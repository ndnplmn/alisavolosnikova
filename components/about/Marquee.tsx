'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface MarqueeProps {
  row1Items: string[]
  row2Items: string[]
}

export function Marquee({ row1Items, row2Items }: MarqueeProps) {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row1 = row1Ref.current
    const row2 = row2Ref.current
    if (!row1 || !row2) return

    // Duplicate content is in markup — animate xPercent: -50 for seamless loop
    const t1 = gsap.fromTo(row1, { xPercent: 0 },  { xPercent: -50, ease: 'none', duration: 22, repeat: -1 })
    // Row 2 runs in opposite direction: start at -50%, return to 0%
    const t2 = gsap.fromTo(row2, { xPercent: -50 }, { xPercent: 0,   ease: 'none', duration: 30, repeat: -1 })

    // Velocity-linked speed: scroll → marquee accelerates proportionally
    let smoothFactor = 1
    const tick = () => {
      const velocity = ScrollTrigger.getVelocity()
      const target = Math.max(0.4, 1 + Math.abs(velocity) / 2800)
      smoothFactor = gsap.utils.interpolate(smoothFactor, target, 0.09)
      t1.timeScale(smoothFactor)
      t2.timeScale(smoothFactor)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      t1.kill()
      t2.kill()
    }
  }, [])

  const sep = ' · '
  const row1Text = row1Items.map(s => s.toUpperCase()).join(sep) + sep
  const row2Text = row2Items.map(s => s.toUpperCase()).join(sep) + sep

  const itemStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    letterSpacing: '0.2em',
    color: 'var(--color-muted)',
    whiteSpace: 'nowrap',
    paddingRight: '0.5rem',
    flexShrink: 0,
  }

  return (
    <div
      className="w-full overflow-hidden border-y border-text-dark/10 py-3 select-none"
      aria-hidden="true"
    >
      {/* Row 1 — left to right */}
      <div className="overflow-hidden mb-2">
        <div ref={row1Ref} className="flex will-change-transform">
          <span style={itemStyle}>{row1Text}</span>
          <span style={itemStyle}>{row1Text}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-text-dark/10 mb-2" />

      {/* Row 2 — right to left */}
      <div className="overflow-hidden">
        <div ref={row2Ref} className="flex will-change-transform">
          <span style={itemStyle}>{row2Text}</span>
          <span style={itemStyle}>{row2Text}</span>
        </div>
      </div>
    </div>
  )
}
