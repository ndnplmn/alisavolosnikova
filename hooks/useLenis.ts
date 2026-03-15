'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Module-level singleton — lets other components call scrollTo without prop-drilling
let _lenis: Lenis | null = null
export const getLenis = () => _lenis

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      wheelMultiplier: 0.8,
      infinite: false,
    })
    _lenis = lenis

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', () => ScrollTrigger.update())

    // Drive Lenis via GSAP ticker for frame-perfect sync
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      _lenis = null
      gsap.ticker.remove(tick)
    }
  }, [])
}
