'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAME = 'Алиса Волосникова'

// Split name into individual character spans for animation
function NameChars() {
  return (
    <span aria-label={NAME} className="inline-flex flex-wrap justify-center">
      {NAME.split('').map((char, i) => (
        <span
          key={i}
          className="loader-char inline-block"
          aria-hidden="true"
          style={{ overflow: 'hidden', display: 'inline-block' }}
        >
          <span
            className="loader-char-inner inline-block"
            style={{ transform: 'translateY(110%)' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </span>
  )
}

export function PageLoader() {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Only show once per session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('av-loader-shown')) {
      setVisible(false)
      return
    }

    const charInners = document.querySelectorAll<HTMLElement>('.loader-char-inner')
    if (!charInners.length) return

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('av-loader-shown', '1')
        setVisible(false)
      },
    })

    tl
      // Reveal name chars bottom-to-top (slide up from below)
      .to(charInners, {
        y: 0,
        duration: 0.6,
        stagger: 0.035,
        ease: 'power3.out',
      })
      // Hold
      .to({}, { duration: 0.65 })
      // Vertical split exit: top slides up, bottom slides down simultaneously
      .to(topRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
      }, '>')
      .to(bottomRef.current, {
        yPercent: 100,
        duration: 0.8,
        ease: 'power4.inOut',
      }, '<') // same start time as previous

    return () => {
      tl.kill()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9998] overflow-hidden"
      aria-label="Loading"
      role="status"
    >
      {/* Top half */}
      <div
        ref={topRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-dark flex items-end justify-center pb-1"
      >
        <h1
          className="font-serif text-xl sm:text-2xl md:text-4xl text-light"
          style={{ letterSpacing: '0.25em' }}
        >
          <NameChars />
        </h1>
      </div>

      {/* Bottom half */}
      <div
        ref={bottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-dark"
      />
    </div>
  )
}
