'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Stat {
  value: number
  label: string
}

const DEFAULT_STATS: Stat[] = [
  { value: 12, label: 'SERIES' },
  { value: 6, label: 'YEARS' },
  { value: 3, label: 'CONTINENTS' },
]

export function SeriesCounter({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const numberEls = section.querySelectorAll<HTMLElement>('[data-count-target]')

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        numberEls.forEach(el => {
          const target = Number(el.dataset.countTarget ?? '0')
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: 'power1.out',
            onUpdate() {
              el.textContent = Math.round(obj.val).toString()
            },
          })
        })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="flex justify-center gap-16 md:gap-24 py-28 px-8 bg-light"
    >
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p
            className="font-serif text-6xl md:text-8xl text-text-dark leading-none"
            data-count-target={value}
          >
            0
          </p>
          <p className="font-sans text-[9px] tracking-extreme text-muted mt-3">
            {label}
          </p>
        </div>
      ))}
    </section>
  )
}
