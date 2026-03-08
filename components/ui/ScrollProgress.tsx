'use client'
import { useEffect, useRef } from 'react'

/**
 * Fixed bottom-left scroll-progress counter — "00 %" — à la GSProductions.
 * Invisible on the hero (scroll = 0), fades in as user scrolls.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const update = () => {
      const el = ref.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0
      el.textContent = String(pct).padStart(2, '0') + ' %'
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="fixed bottom-5 left-6 z-40 pointer-events-none
                 font-sans text-[9px] tracking-[0.22em] text-ink/30
                 select-none"
    >
      00 %
    </span>
  )
}
