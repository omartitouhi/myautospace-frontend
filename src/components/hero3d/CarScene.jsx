import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Quaternion, Vector3 } from 'three'
import { SkodaModel } from './SkodaModel'

/* Piecewise smoothstep interpolation across scroll-keyed control points. */
function track(p, keys) {
  if (p <= keys[0][0]) return keys[0][1]
  const last = keys[keys.length - 1]
  if (p >= last[0]) return last[1]
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, v0] = keys[i]
    const [p1, v1] = keys[i + 1]
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0)
      return v0 + (v1 - v0) * (t * t * (3 - 2 * t))
    }
  }
  return last[1]
}

const DEG = Math.PI / 180

// Camera + part choreography, keyed on scroll progress p ∈ [0,1].
// Beat 1 (zoom) ~ .12–.40   Beat 2 (orbit + open) ~ .40–.74   Beat 3 (release) .74–1
const PATH = {
  azimuthDeg: [[0, 29], [0.12, -22], [0.4, -22], [0.74, 338], [1, 372]],
  elevDeg: [[0, -0.5], [0.12, 9], [0.4, 11], [0.56, 24], [0.74, 15], [1, 12]],
  radius: [[0, 5], [0.12, 5.2], [0.4, 4.9], [0.56, 5.6], [0.74, 5.4], [1, 8.8]],
  targetY: [[0, 1.1], [0.4, 0.9], [0.74, 1], [1, 1.05]],
  open: [[0, 0], [0.42, 0], [0.57, 1], [0.72, 1], [0.81, 0]],
  carFade: [[0, 1], [0.86, 1], [0.98, 0]],
}

// Live-tunable constants (poke window.__car in dev, then bake in).
const TUNE = {
  azBase: 180, // rotates the orbit so the establishing shot faces the front
  frameY: -1.0, // aims the camera below the car so it sits high in frame
  elevAdd: 0,
  radMul: 1,
  hoodAngle: 50, hoodSign: 1,
  doorAngle: 62, leftSign: -1, rightSign: 1, rearScale: 0.92,
  steerAngle: 17, steerSign: 1,
}
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__car = { ...(window.__car || {}), ...TUNE }
}
const tune = (k) => (typeof window !== 'undefined' && window.__car?.[k] != null ? window.__car[k] : TUNE[k])

const _q = new Quaternion()
const _v = new Vector3()

// Rotate a hinged part about a pivot edge (so doors swing on their real hinge).
function applyHinge(h, amount) {
  const ang = amount * tune(h.signKey) * tune(h.angleKey) * DEG
  _q.setFromAxisAngle(h.axis, ang)
  _v.copy(h.restPos).sub(h.pivot).applyAxisAngle(h.axis, ang).add(h.pivot)
  h.node.position.copy(_v)
  h.node.quaternion.copy(h.restQuat).premultiply(_q)
}

function applySteer(s) {
  _q.setFromAxisAngle(s.axis, tune('steerSign') * tune('steerAngle') * DEG)
  s.node.quaternion.copy(s.restQuat).premultiply(_q)
}

function Rig({ progressRef, partsRef }) {
  const { camera } = useThree()
  const target = useRef([0, 1, 0])

  useFrame((_, dt) => {
    const p = progressRef.current
    const azim = (track(p, PATH.azimuthDeg) + tune('azBase')) * DEG
    const elev = (track(p, PATH.elevDeg) + tune('elevAdd')) * DEG
    const r = track(p, PATH.radius) * tune('radMul')
    const ty = track(p, PATH.targetY)

    const dx = r * Math.cos(elev) * Math.sin(azim)
    const dy = r * Math.sin(elev)
    const dz = r * Math.cos(elev) * Math.cos(azim)

    const lookY = ty + tune('frameY')
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.05))
    camera.position.x += (dx - camera.position.x) * k
    camera.position.y += (ty + dy - camera.position.y) * k
    camera.position.z += (dz - camera.position.z) * k
    target.current[1] += (lookY - target.current[1]) * k
    camera.lookAt(0, target.current[1], 0)

    const parts = partsRef.current
    if (parts) {
      const a = track(p, PATH.open)
      if (parts.hood) applyHinge(parts.hood, a)
      for (const d of parts.doors) applyHinge(d, a * (d.rear ? tune('rearScale') : 1))
      for (const s of parts.steers) applySteer(s)
      if (parts.root) parts.root.visible = track(p, PATH.carFade) > 0.02
    }
  })

  return null
}

/* Inline studio environment echoing homebg.jpg: two long ceiling neon strips
   (the sharp highlight streaks on the paint) + soft side fills + a dark floor.
   No network fetch; reflections stay crisp through the clearcoat. */
function StudioEnv() {
  return (
    <Environment frames={1} resolution={512}>
      <color attach="background" args={['#0a0c10']} />
      <Lightformer form="rect" intensity={7} position={[0, 6, -2.4]} rotation-x={-Math.PI / 2} scale={[14, 0.5, 1]} />
      <Lightformer form="rect" intensity={7} position={[0, 6, 2.4]} rotation-x={-Math.PI / 2} scale={[14, 0.5, 1]} />
      <Lightformer form="rect" intensity={5} position={[-7, 2, 0]} rotation-y={Math.PI / 2} scale={[9, 5, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={4} position={[7, 2, 0]} rotation-y={-Math.PI / 2} scale={[9, 5, 1]} color="#cdd9e4" />
      <Lightformer form="rect" intensity={0.5} position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} color="#0e1218" />
    </Environment>
  )
}

export default function CarScene({ progressRef }) {
  const partsRef = useRef(null)
  const dpr = useMemo(() => [1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.75)], [])

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [2.6, 1.3, 6.6], fov: 40, near: 0.1, far: 100 }}
    >
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#ffffff', '#2a2e33', 0.45]} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      >
        <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 30]} />
      </directionalLight>
      {/* cool back rim for edge definition + brand-green kicker */}
      <directionalLight position={[-7, 5, -6]} intensity={1.3} color="#dfe7f0" />
      <pointLight position={[-5, 2.5, -4]} intensity={26} color="#1a6450" distance={20} decay={2} />

      <Suspense fallback={null}>
        <SkodaModel partsRef={partsRef} />
        <StudioEnv />
      </Suspense>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.62} scale={13} blur={2.4} far={6} resolution={1024} color="#05080a" />

      <Rig progressRef={progressRef} partsRef={partsRef} />
    </Canvas>
  )
}
