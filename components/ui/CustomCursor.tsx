'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Two-layer custom cursor:
 *   – outer ring  (28px, trailing, mix-blend-difference)
 *   – inner dot   (4px,  snapping)
 * Both elements are always in the DOM (opacity:0) so GSAP refs
 * are never null when the effect runs.
 */
export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null)
  const dotRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Abort on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return

    const outer = outerRef.current
    const dot   = dotRef.current
    if (!outer || !dot) return

    // Reveal cursor
    gsap.set([outer, dot], { opacity: 1 })

    // Separate easing: ring trails, dot snaps
    const outerX = gsap.quickTo(outer, 'x', { duration: 0.14, ease: 'power3.out' })
    const outerY = gsap.quickTo(outer, 'y', { duration: 0.14, ease: 'power3.out' })
    const dotX   = gsap.quickTo(dot,   'x', { duration: 0.04, ease: 'none' })
    const dotY   = gsap.quickTo(dot,   'y', { duration: 0.04, ease: 'none' })

    const onMouseMove = (e: MouseEvent) => {
      outerX(e.clientX); outerY(e.clientY)
      dotX(e.clientX);   dotY(e.clientY)
    }
    window.addEventListener('mousemove', onMouseMove)

    // Link / button hover — ring expands, dot fades
    const onLinkEnter = () => {
      gsap.to(outer, { width: 48, height: 48, duration: 0.28, ease: 'power2.out' })
      gsap.to(dot,   { opacity: 0, duration: 0.18 })
    }
    const onLinkLeave = () => {
      gsap.to(outer, { width: 28, height: 28, duration: 0.28, ease: 'power2.out' })
      gsap.to(dot,   { opacity: 1, duration: 0.18 })
    }

    const register = () => {
      document.querySelectorAll('a, button, [data-cursor="link"]').forEach(el => {
        el.removeEventListener('mouseenter', onLinkEnter)
        el.removeEventListener('mouseleave', onLinkLeave)
        el.addEventListener('mouseenter', onLinkEnter)
        el.addEventListener('mouseleave', onLinkLeave)
      })
    }
    register()
    const obs = new MutationObserver(register)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      obs.disconnect()
    }
  }, [])

  const base: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0,
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
    opacity: 0,            // shown by JS — avoids flash + ref-null race
    willChange: 'transform',
    borderRadius: '50%',
  }

  return (
    <>
      {/* Outer ring */}
      <div
        ref={outerRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 28, height: 28,
          border: '1px solid rgba(255,255,255,0.88)',
          mixBlendMode: 'difference',
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          ...base,
          width: 4, height: 4,
          backgroundColor: 'rgba(255,255,255,0.88)',
          mixBlendMode: 'difference',
        }}
      />
    </>
  )
}
