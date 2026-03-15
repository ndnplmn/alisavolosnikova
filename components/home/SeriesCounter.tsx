// components/home/SeriesCounter.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 12, label: 'SERIES'       },
  { value: 6,  label: 'YEARS ACTIVE' },
  { value: 3,  label: 'CONTINENTS'   },
]

export function SeriesCounter() {
  const sectionRef = useRef<HTMLElement>(null)
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const labelRefs  = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Set initial state
    numRefs.current.forEach(el => { if (el) el.textContent = '00' })
    gsap.set(labelRefs.current.filter(Boolean), { opacity: 0 })

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top 75%',
      once:    true,
      onEnter: () => {
        STATS.forEach(({ value }, i) => {
          const el = numRefs.current[i]
          if (!el) return
          const obj = { val: 0 }
          gsap.to(obj, {
            val:      value,
            duration: 1.6,
            ease:     'power1.out',
            onUpdate: () => {
              el.textContent = String(Math.round(obj.val)).padStart(2, '0')
            },
          })
        })
        gsap.to(labelRefs.current.filter(Boolean), {
          opacity:  1,
          duration: 0.6,
          stagger:  0.1,
          delay:    0.3,
        })
      },
    })

    return () => { st.kill() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 py-20"
      style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
    >
      <div className="flex justify-between items-end">
        {STATS.map(({ value, label }, i) => (
          <div key={label} className="flex items-end gap-8 md:gap-16">
            {/* Stat */}
            <div>
              <span
                ref={el => { numRefs.current[i] = el }}
                className="font-serif italic text-text-light block"
                style={{ fontSize: 'clamp(4rem, 6vw, 7rem)', fontWeight: 300, lineHeight: 1 }}
              >
                {'00'}
              </span>
              <p
                ref={el => { labelRefs.current[i] = el }}
                className="font-sans text-[9px] tracking-extreme text-muted mt-2"
              >
                {label}
              </p>
            </div>
            {/* Separator — not after last item */}
            {i < STATS.length - 1 && (
              <span
                aria-hidden="true"
                className="font-serif text-text-light self-end mb-2"
                style={{ fontSize: 'clamp(3rem, 4vw, 5rem)', opacity: 0.12 }}
              >
                ·
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
