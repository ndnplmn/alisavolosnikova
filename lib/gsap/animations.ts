import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins once at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Animate target respecting prefers-reduced-motion.
 * If reduced motion is preferred, applies end state immediately.
 */
export function motionSafe(
  prefersReduced: boolean,
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
): gsap.core.Tween | undefined {
  if (prefersReduced) {
    // Extract end-state values (exclude callbacks and GSAP-only props)
    const { onComplete, onUpdate, onStart, ease, duration, delay, stagger, ...endState } = vars
    gsap.set(target, endState)
    onComplete?.()
    return undefined
  }
  return gsap.to(target, vars)
}

export { gsap, ScrollTrigger }
