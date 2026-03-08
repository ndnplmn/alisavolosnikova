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
      className="flex justify-center gap-16 md:gap-32 py-28 px-8 bg-cream border-t border-ink/[0.07]"
    >
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p
            className="font-serif text-7xl md:text-[7rem] text-ink leading-none"
            data-count-target={value}
          >
            0
          </p>
          <div className="w-6 h-px bg-ink/20 mx-auto my-3" />
          <p className="font-sans text-[9px] tracking-[0.22em] text-muted uppercase">
            {label}
          </p>
        </div>
      ))}
    </section>
  )
}
