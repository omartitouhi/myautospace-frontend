import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'
import { Hero } from './Hero'

const CarScene = lazy(() => import('./hero3d/CarScene'))

/* If WebGL/3D fails at runtime, fall back to the cinematic photo hero. */
class HeroBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* Decide once whether the 3D hero can run. Reduced-motion, no-WebGL, and
   small screens get the cinematic photo hero instead — same as before. */
function use3DCapable() {
  const [capable] = useState(() => {
    if (typeof window === 'undefined') return false
    const forced =
      localStorage.getItem('force3d') === '1' || window.location.search.includes('force3d')
    if (!forced) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
      if (window.innerWidth < 768) return false
    }
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      return false
    }
  })
  return capable
}

function smoothstep(p, a, b) {
  if (a === b) return p < a ? 0 : 1
  const t = Math.min(Math.max((p - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

// Smooth band: ramps 0→1 over [a,b], holds at 1, ramps 1→0 over [c,d].
function band(p, a, b, c, d) {
  return smoothstep(p, a, b) * (1 - smoothstep(p, c, d))
}

export function Hero3D() {
  const capable = use3DCapable()
  if (!capable) return <Hero />
  return (
    <HeroBoundary fallback={<Hero />}>
      <Hero3DExperience />
    </HeroBoundary>
  )
}

function Hero3DExperience() {
  const { t } = useUI()
  const h3 = t.hero3d
  const sectionRef = useRef(null)
  const progressRef = useRef(0)
  const [mounted, setMounted] = useState(true)

  // Overlay nodes we style imperatively each frame (no React churn on scroll).
  const introRef = useRef(null)
  const transactRef = useRef(null)
  const servicesRef = useRef(null)
  const hintRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf = 0

    const setPanel = (el, v, rise = 26) => {
      if (!el) return
      el.style.opacity = v.toFixed(3)
      el.style.transform = `translateY(${((1 - v) * rise).toFixed(1)}px)`
      el.style.pointerEvents = v > 0.6 ? 'auto' : 'none'
    }

    const tick = () => {
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const p = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0
      progressRef.current = p

      // While the dark car stage covers the viewport, the nav switches to its
      // on-dark treatment (light text) regardless of theme — matching the page.
      const covering = rect.top <= 1 && rect.bottom >= window.innerHeight * 0.9 && p < 0.92
      document.documentElement.classList.toggle('hero-dark', covering)

      setPanel(introRef.current, band(p, 0, 0, 0.08, 0.16))
      setPanel(transactRef.current, band(p, 0.15, 0.22, 0.34, 0.42))
      setPanel(servicesRef.current, band(p, 0.45, 0.53, 0.68, 0.74))
      if (hintRef.current) hintRef.current.style.opacity = band(p, 0, 0, 0.06, 0.13).toFixed(3)
      // Fade the whole stage out as the page below takes over.
      if (stageRef.current) stageRef.current.style.opacity = (1 - band(p, 0.86, 0.99, 1, 1)).toFixed(3)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Unmount the canvas when the hero is well out of view (saves the GPU).
    const io = new IntersectionObserver(
      ([entry]) => setMounted(entry.isIntersecting),
      { rootMargin: '40% 0px 40% 0px' },
    )
    io.observe(section)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.documentElement.classList.remove('hero-dark')
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero3d">
      <div ref={stageRef} className="hero3d-stage">
        <div className="hero3d-backdrop" aria-hidden="true" />
        <div className="hero3d-canvas">
          {mounted ? (
            <Suspense fallback={null}>
              <CarScene progressRef={progressRef} />
            </Suspense>
          ) : null}
        </div>

        {/* Beat 0 — establishing title */}
        <div ref={introRef} className="hero3d-panel hero3d-intro">
          <span className="hero-pill">
            <span className="dot" /> {h3.kicker}
          </span>
          <h1>
            {h3.title.map((line, i) => (
              <span className="line" key={i}>
                {line.em ? (
                  <>
                    {line.pre}
                    <em>{line.em}</em>
                  </>
                ) : (
                  line.text
                )}
              </span>
            ))}
          </h1>
          <p>{h3.sub}</p>
        </div>

        {/* Beat 1 — buy / sell / rent */}
        <div ref={transactRef} className="hero3d-panel hero3d-transact">
          <h2>{h3.transact.title}</h2>
          <div className="hero3d-cards">
            {h3.transact.items.map((it) => (
              <div key={it.t} className="hero3d-card glass">
                <Icon name={it.ic} />
                <b>{it.t}</b>
                <span>{it.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Beat 2 — services */}
        <div ref={servicesRef} className="hero3d-panel hero3d-services">
          <h2>{h3.services.title}</h2>
          <div className="hero3d-chips">
            {h3.services.items.map((it) => (
              <span key={it.t} className="hero3d-chip glass">
                <Icon name={it.ic} /> {it.t}
              </span>
            ))}
          </div>
        </div>

        <div ref={hintRef} className="hero3d-hint">
          <span>{h3.scrollHint}</span>
          <Icon name="chevDown" />
        </div>
      </div>
    </section>
  )
}
