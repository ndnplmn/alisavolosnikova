'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StatementProps {
  text?: string
}

export function Statement({ text = '"She does not capture moments. She selects them."' }: StatementProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    // Manual word split
    const words = el.textContent?.split(' ') ?? []
    el.innerHTML = words
      .map(w => `<span class="inline-block overflow-hidden"><span class="word-inner inline-block" style="transform:translateY(110%)">${w}</span></span>`)
      .join(' ')

    const wordInners = el.querySelectorAll<HTMLElement>('.word-inner')

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      onEnter: () => {
        gsap.to(wordInners, {
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        })
      },
    })

    return () => {
      st.kill()
    }
  }, [text])

  return (
    <section
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-dark px-8 py-24"
    >
      <div className="max-w-3xl text-center">
        <p
          ref={textRef}
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-light leading-tight"
        >
          {text}
        </p>
        <div className="w-24 h-px bg-text-light/20 mx-auto mt-16" />
      </div>
    </section>
  )
}
