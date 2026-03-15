'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * GSProductions loader — one-line layout, 0.5 s shorter:
 *
 * Layout  : "А[лиса] В[олосникова]" — single centred row
 * Timing  : COUNT_DURATION 2 300 ms (was 2 800 ms — 0.5 s removed)
 * Sequence: initials rise → words expand → counter → fade → centre-split exit
 */

const COUNT_DURATION = 2800

export function PageLoader() {
  const leftPanelRef  = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const counterRef    = useRef<HTMLSpanElement>(null)
  const init1Ref      = useRef<HTMLSpanElement>(null) // А
  const exp1Ref       = useRef<HTMLSpanElement>(null) // лиса
  const init2Ref      = useRef<HTMLSpanElement>(null) // В
  const exp2Ref       = useRef<HTMLSpanElement>(null) // олосникова
  const [visible, setVisible] = useState(false)

  // Check sessionStorage after mount (useState lazy init doesn't run on client
  // when server-rendered null causes a hydration mismatch in Next.js App Router)
  useEffect(() => {
    if (!sessionStorage.getItem('av-loader-shown')) {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const leftPanel  = leftPanelRef.current
    const rightPanel = rightPanelRef.current
    const counter    = counterRef.current
    const init1      = init1Ref.current
    const exp1       = exp1Ref.current
    const init2      = init2Ref.current
    const exp2       = exp2Ref.current
    if (!leftPanel || !rightPanel || !counter || !init1 || !exp1 || !init2 || !exp2) return

    // Initial state
    gsap.set([init1, init2], { y: '110%' })
    gsap.set([exp1, exp2],   { clipPath: 'inset(0% 100% 0% 0%)' })

    // rAF counter 00 % → 100 %
    let raf: number
    const countStart = performance.now()
    const tickCounter = (now: number) => {
      const progress = Math.min(100, Math.round(((now - countStart) / COUNT_DURATION) * 100))
      counter.textContent = (progress >= 100 ? '100' : String(progress).padStart(2, '0')) + ' %'
      if (progress < 100) raf = requestAnimationFrame(tickCounter)
    }

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        sessionStorage.setItem('av-loader-shown', '1')
        window.dispatchEvent(new CustomEvent('av:loader-done'))
        setVisible(false)
      },
    })

    // 1. Both initials rise (А first, then В, stagger 0.28 s — matches GSP's G→S→P)
    tl.to([init1, init2], {
      y: '0%',
      duration: 0.6,
      stagger: 0.28,
      ease: 'power3.out',
    })

    // 2. Both word-tails expand left→right
    tl.to([exp1, exp2], {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.0,
      stagger: 0.14,
      ease: 'power3.inOut',
    }, '-=0.2')

    // 3. Counter starts
    tl.add(() => { requestAnimationFrame(tickCounter) }, '-=0.9')

    // 4. Hold until counter finishes
    tl.to({}, { duration: COUNT_DURATION / 1000 + 0.25 }, '-=0.6')

    // 5. Fade out text
    tl.to([init1, exp1, init2, exp2], {
      opacity: 0,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.in',
    })

    // 6. Centre-split exit (GSP exact: 1.2 s, power4.inOut, simultaneous)
    tl.to(leftPanel,  { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.2, ease: 'power4.inOut' })
    tl.to(rightPanel, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.2, ease: 'power4.inOut' }, '<')
    tl.to(counter,    { opacity: 0, duration: 0.8, ease: 'power2.in' }, '<')

    return () => { tl.kill(); cancelAnimationFrame(raf) }
  }, [visible])

  if (!visible) return null

  const text: React.CSSProperties = {
    fontFamily:    'var(--font-sans), system-ui, sans-serif',
    fontWeight:    500,
    fontSize:      'clamp(13px, 1.2vw, 18px)',
    lineHeight:    1,
    letterSpacing: '0.08em',
    color:         'var(--color-text-light)',
    display:       'inline-block',
    whiteSpace:    'nowrap',
  }

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      role="status"
      aria-label="Загрузка"
    >
      {/* Two black panels */}
      <div
        ref={leftPanelRef}
        className="absolute top-0 left-0 h-full bg-dark"
        style={{ width: '52%', clipPath: 'inset(0% 0% 0% 0%)' }}
      />
      <div
        ref={rightPanelRef}
        className="absolute top-0 right-0 h-full bg-dark"
        style={{ width: '52%', clipPath: 'inset(0% 0% 0% 0%)' }}
      />

      {/* Single centred row: "А[лиса] В[олосникова]" */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>

          {/* А */}
          <div style={{ overflow: 'hidden', display: 'inline-block' }}>
            <span ref={init1Ref} style={text}>А</span>
          </div>
          {/* лиса */}
          <span ref={exp1Ref} style={{ ...text, clipPath: 'inset(0% 100% 0% 0%)' }}>лиса</span>

          {/* word gap */}
          <span style={{ ...text, opacity: 0, userSelect: 'none' }}>&nbsp;&nbsp;</span>

          {/* В */}
          <div style={{ overflow: 'hidden', display: 'inline-block' }}>
            <span ref={init2Ref} style={text}>В</span>
          </div>
          {/* олосникова */}
          <span ref={exp2Ref} style={{ ...text, clipPath: 'inset(0% 100% 0% 0%)' }}>олосникова</span>

        </div>
      </div>

      {/* Bottom-right counter */}
      <span
        ref={counterRef}
        className="fixed z-20 font-sans"
        style={{
          bottom:             '2.5rem',
          right:              '2.5rem',
          fontSize:           '9px',
          letterSpacing:      '0.2em',
          color:              'rgba(245,245,245,0.35)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        00 %
      </span>
    </div>
  )
}
