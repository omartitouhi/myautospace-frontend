import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, DoubleSide, Matrix4, MeshPhysicalMaterial, Vector3 } from 'three'

const MODEL_URL = '/models/skoda/SkodaReady.glb'

/* Bounding box of a node's mesh subtree expressed in its parent's local space —
   used to find each part's hinge edge (front for doors, rear for the hood). */
function localBox(node) {
  const parent = node.parent
  parent.updateWorldMatrix(true, true)
  const toLocal = new Matrix4().copy(parent.matrixWorld).invert()
  const box = new Box3()
  const v = new Vector3()
  node.traverse((o) => {
    if (!o.isMesh || !o.geometry) return
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
    const bb = o.geometry.boundingBox
    for (let xi = 0; xi < 2; xi++) {
      for (let yi = 0; yi < 2; yi++) {
        for (let zi = 0; zi < 2; zi++) {
          v.set(xi ? bb.max.x : bb.min.x, yi ? bb.max.y : bb.min.y, zi ? bb.max.z : bb.min.z)
          v.applyMatrix4(o.matrixWorld).applyMatrix4(toLocal)
          box.expandByPoint(v)
        }
      }
    }
  })
  return box
}

/* Loads the Skoda glTF, normalizes it, and publishes hinge/steer descriptors
   (pivot at the real hinge edge so doors swing outward, not into the cabin). */
export function SkodaModel({ partsRef, targetSize = 4.6 }) {
  const { scene } = useGLTF(MODEL_URL)
  const root = useMemo(() => scene, [scene])

  useLayoutEffect(() => {
    // Normalize: fixed footprint, wheels on y = 0, centered on origin.
    let box = new Box3().setFromObject(root)
    const size = new Vector3()
    box.getSize(size)
    root.scale.setScalar(targetSize / Math.max(size.x, size.y, size.z))

    box = new Box3().setFromObject(root)
    const center = new Vector3()
    box.getCenter(center)
    root.position.x -= center.x
    root.position.z -= center.z
    root.position.y -= box.min.y
    root.updateWorldMatrix(true, true)

    // Real automotive paint = a slightly diffuse metallic base under a glossy
    // clearcoat. A plain shiny MeshStandardMaterial reads as plastic, so swap
    // the body paint to a physical material with a clearcoat layer.
    root.traverse((obj) => {
      if (!obj.isMesh) return
      obj.castShadow = true
      obj.receiveShadow = true
      obj.frustumCulled = false
      const mat = obj.material
      if (!mat) return
      if (/primary/i.test(mat.name)) {
        obj.material = new MeshPhysicalMaterial({
          name: mat.name,
          color: mat.color,
          map: mat.map ?? null,
          normalMap: mat.normalMap ?? null,
          metalness: 0.9,
          roughness: 0.42,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.9,
          side: DoubleSide,
        })
      } else if ('envMapIntensity' in mat) {
        mat.envMapIntensity = 1.15
      }
    })

    const Z = new Vector3(0, 0, 1) // chassis vertical (door + steer axis)
    const X = new Vector3(1, 0, 0) // chassis lateral (hood lift axis)

    const doorHinge = (name, side, rear) => {
      const node = root.getObjectByName(name)
      if (!node) return null
      const b = localBox(node)
      const c = new Vector3()
      b.getCenter(c)
      return {
        node,
        axis: Z,
        pivot: new Vector3(c.x, b.max.y, c.z), // front edge
        restPos: node.position.clone(),
        restQuat: node.quaternion.clone(),
        signKey: side === 'L' ? 'leftSign' : 'rightSign',
        angleKey: 'doorAngle',
        rear,
      }
    }

    const hoodHinge = () => {
      const node = root.getObjectByName('bonnet_dummy')
      if (!node) return null
      const b = localBox(node)
      const c = new Vector3()
      b.getCenter(c)
      return {
        node,
        axis: X,
        pivot: new Vector3(c.x, b.min.y, c.z), // rear edge (windshield side)
        restPos: node.position.clone(),
        restQuat: node.quaternion.clone(),
        signKey: 'hoodSign',
        angleKey: 'hoodAngle',
        rear: false,
      }
    }

    const steer = (name) => {
      const node = root.getObjectByName(name)
      return node ? { node, axis: Z, restQuat: node.quaternion.clone() } : null
    }

    partsRef.current = {
      root,
      hood: hoodHinge(),
      doors: [
        doorHinge('door_lf_dummy', 'L', false),
        doorHinge('door_lr_dummy', 'L', true),
        doorHinge('door_rf_dummy', 'R', false),
        doorHinge('door_rr_dummy', 'R', true),
      ].filter(Boolean),
      // Front wheels only — GLTFLoader strips dots, so `wheel` + `wheel002`.
      steers: [steer('wheel'), steer('wheel002')].filter(Boolean),
    }
    if (import.meta.env.DEV && typeof window !== 'undefined') window.__parts = partsRef.current
  }, [root, partsRef, targetSize])

  return <primitive object={root} />
}

useGLTF.preload(MODEL_URL)
