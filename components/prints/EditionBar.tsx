// components/prints/EditionBar.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface EditionBarProps {
  editionSize: number
  editionsSold: number
  /** Stagger delay offset so bars don't all animate simultaneously */
  animDelay?: number
}

export function EditionBar({ editionSize, editionsSold, animDelay = 0 }: EditionBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fillRef    = useRef<HTMLDivElement>(null)

  if (editionSize <= 0) return null
  const sold       = Math.min(editionsSold, editionSize)
  const editionsLeft = editionSize - sold
  const isSoldOut  = editionsLeft === 0
  const ratio      = sold / editionSize          // 0–1

  useEffect(() => {
    const fill    = fillRef.current
    const wrapper = wrapperRef.current
    if (!fill || !wrapper) return

    const anim = gsap.fromTo(
      fill,
      { scaleX: 0 },
      {
        scaleX: ratio,
        duration: 1.2,
        ease: 'power3.out',
        delay: animDelay,
        scrollTrigger: { trigger: wrapper, start: 'top 88%' },
      }
    )

    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, []) // entrance-only — runs once on mount

  const status = (() => {
    if (isSoldOut)          return { text: 'SOLD OUT',                   color: 'var(--color-muted)' }
    if (editionsLeft === 1) return { text: 'LAST EDITION',               color: 'var(--color-teal)' }
    if (editionsLeft <= 3)  return { text: `ONLY ${editionsLeft} LEFT`,  color: 'var(--color-teal)' }
    return                         { text: `${editionsLeft} REMAINING`,  color: 'var(--color-muted)' }
  })()

  return (
    <div ref={wrapperRef}>
      {/* Track */}
      <div className="relative w-full overflow-hidden" style={{ height: '1px', background: 'rgba(10,10,10,0.1)' }}>
        <div
          ref={fillRef}
          className="absolute inset-0 bg-ink origin-left"
          style={{
            transform: 'scaleX(0)',
            opacity: isSoldOut ? 0.25 : 1,
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between items-baseline mt-2">
        <span
          className="font-sans text-[9px] tracking-extreme"
          style={{ color: status.color }}
        >
          {status.text}
        </span>
        <span className="font-sans text-[9px] tracking-extreme text-muted">
          {sold} / {editionSize}
        </span>
      </div>
    </div>
  )
}
