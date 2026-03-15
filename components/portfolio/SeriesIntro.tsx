'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SeriesIntro({ description }: { description: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const st = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    ).scrollTrigger

    return () => { st?.kill() }
  }, [])

  return (
    <div
      className="py-28 md:py-36 px-6 md:px-12"
    >
      <div ref={ref} style={{ maxWidth: '44ch', opacity: 0 }}>
        <p
          className="font-serif italic text-text-dark/65"
          style={{ fontSize: 'clamp(1.15rem, 1.9vw, 1.75rem)', lineHeight: 1.68 }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
