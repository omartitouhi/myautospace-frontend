import { useLayoutEffect } from 'react'
import { useReveal } from '../lib/hooks'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Listings } from '../components/Listings'
import { HowItWorks } from '../components/HowItWorks'
import { Features } from '../components/Features'
import { Services } from '../components/Services'
import { Stats } from '../components/Stats'
import { CTA } from '../components/CTA'
import { Footer } from '../components/Footer'

export function Landing() {
  // Intro: always make content visible (`shown`); only run the entrance
  // animation + arm scroll-reveals when the document is actually visible.
  // A hidden/background tab or reduced-motion never traps content behind an
  // animation/transition that can't advance. Arm before paint so there's no
  // visible→hidden flash.
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canAnimate = document.visibilityState === 'visible' && !reduce
    if (canAnimate) {
      document.documentElement.classList.add('reveal-armed')
      document.body.classList.add('animate')
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => document.body.classList.add('shown')),
      )
      return () => cancelAnimationFrame(id)
    }
    document.body.classList.add('shown')
  }, [])

  useReveal()

  return (
    <>
      <Nav />
      <Hero />
      <Listings />
      <HowItWorks />
      <Features />
      <Services />
      <Stats />
      <CTA />
      <Footer />
    </>
  )
}
