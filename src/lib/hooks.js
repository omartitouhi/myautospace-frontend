/* Shared motion hooks — scroll reveals, sticky nav, count-up, parallax.
   Every hook degrades gracefully: when the document can't animate
   (reduced motion, hidden/background tab) content is shown in its final state. */

import { useEffect, useRef, useState } from 'react'

/* ---- reveal on scroll ---- */
export function useReveal() {
  useEffect(() => {
    // Arming is decided in App's layout effect. If not armed (reduced motion,
    // hidden doc, motion off), reveals stay at their visible base state.
    if (!document.documentElement.classList.contains('reveal-armed')) return
    const els = document.querySelectorAll('.reveal:not(.in)')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
}

/* ---- nav scrolled state ---- */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

/* ---- count up when visible ---- */
function cannotAnimate() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.visibilityState !== 'visible'
  )
}

export function useCountUp(target, { duration = 1600, decimals = 0 } = {}) {
  const ref = useRef(null)
  // Frozen/hidden doc (background tab) or reduced motion: rAF won't advance,
  // so seed the final value immediately rather than counting up from 0.
  const [val, setVal] = useState(() => (cannotAnimate() ? target : 0))
  const done = useRef(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Already seeded to the final value — nothing to animate.
    if (cannotAnimate()) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true
            const start = performance.now()
            const tick = (now) => {
              const p = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - p, 3)
              setVal(target * eased)
              if (p < 1) requestAnimationFrame(tick)
              else setVal(target)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [target, duration])
  const display =
    decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()
  return [ref, display]
}

/* ---- pointer parallax for a container; children read data-depth ---- */
export function usePointerParallax() {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let raf = null,
      tx = 0,
      ty = 0
    const onMove = (e) => {
      const r = node.getBoundingClientRect()
      tx = (e.clientX - (r.left + r.width / 2)) / r.width
      ty = (e.clientY - (r.top + r.height / 2)) / r.height
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const apply = () => {
      raf = null
      node.querySelectorAll('[data-depth]').forEach((el) => {
        const d = parseFloat(el.getAttribute('data-depth'))
        el.style.transform = `translate3d(${tx * d * 26}px, ${ty * d * 26}px, 0)`
      })
    }
    const onLeave = () => {
      node.querySelectorAll('[data-depth]').forEach((el) => {
        el.style.transform = 'translate3d(0,0,0)'
      })
    }
    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return ref
}

/* ---- scroll parallax: translateY on element by factor ---- */
export function useScrollParallax(factor = 0.12) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let raf = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const r = node.getBoundingClientRect()
        const center = r.top + r.height / 2 - window.innerHeight / 2
        node.style.transform = `translate3d(0, ${center * factor * -1}px, 0)`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [factor])
  return ref
}
