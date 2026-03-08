'use client'
import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Mode = 'dark' | 'light'

const MODE_COLORS: Record<Mode, { bg: string; color: string }> = {
  dark: { bg: '#0A0A0A', color: '#E8E4DF' },
  light: { bg: '#F5F2EE', color: '#1A1A1A' },
}

export function useDualMode(sectionRef: RefObject<HTMLElement | null>, mode: Mode) {
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const { bg, color } = MODE_COLORS[mode]

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => applyMode(bg, color),
      onEnterBack: () => applyMode(bg, color),
    })

    return () => trigger.kill()
  }, [mode, sectionRef])
}

function applyMode(bg: string, color: string) {
  gsap.to(document.body, {
    backgroundColor: bg,
    color,
    duration: 0.8,
    ease: 'none',
    overwrite: 'auto',
  })
}
