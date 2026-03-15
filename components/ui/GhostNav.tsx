'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { TransitionLink } from '@/components/ui/PageTransition'

const NAV_ITEMS = [
  { label: 'About',   href: '/about'   },
  { label: 'Prints',  href: '/prints'  },
  { label: 'Contact', href: '/contact' },
]

export function GhostNav() {
  const [open, setOpen]  = useState(false)
  const overlayRef       = useRef<HTMLDivElement>(null)
  const linkRefs         = useRef<(HTMLDivElement | null)[]>([])
  const footerRef        = useRef<HTMLParagraphElement>(null)
  const topRowRef        = useRef<HTMLDivElement>(null)
  const hasOpenedRef     = useRef(false)
  const pathname         = usePathname()

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Animation — open / close
  useEffect(() => {
    if (!open && !hasOpenedRef.current) return
    if (open) hasOpenedRef.current = true

    const overlay = overlayRef.current
    if (!overlay) return

    const links  = linkRefs.current.filter(Boolean) as HTMLElement[]
    const footer = footerRef.current
    const topRow = topRowRef.current

    if (open) {
      // Use fromTo so start state is always explicit regardless of prior GSAP state
      gsap.fromTo(overlay,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power4.inOut', overwrite: 'auto' },
      )
      gsap.fromTo(links,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.4, overwrite: 'auto' },
      )
      if (topRow) gsap.fromTo(topRow,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out', delay: 0.35, overwrite: 'auto' },
      )
      if (footer) gsap.fromTo(footer,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.75, overwrite: 'auto' },
      )
    } else {
      gsap.to(links,  { opacity: 0, y: -20, duration: 0.3, stagger: 0.04, ease: 'power2.in', overwrite: 'auto' })
      if (topRow) gsap.to(topRow, { opacity: 0, duration: 0.2, overwrite: 'auto' })
      if (footer) gsap.to(footer, { opacity: 0, duration: 0.2, overwrite: 'auto' })
      gsap.to(overlay, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.6,
        ease: 'power4.inOut',
        delay: 0.15,
        overwrite: 'auto',
      })
    }
  }, [open])

  // mix-blend-mode: difference — always readable on dark or light backgrounds
  const cornerStyle: React.CSSProperties = {
    fontFamily:    'var(--font-sans)',
    fontSize:      '10px',
    letterSpacing: '0.22em',
    color:         '#ffffff',
    mixBlendMode:  'difference',
    userSelect:    'none',
  }

  // Reset before each render to prevent stale accumulation
  linkRefs.current = []

  return (
    <>
      {/* ── Home link — top left ─────────────────────────────── */}
      <TransitionLink
        href="/"
        data-cursor="link"
        className="fixed top-6 left-6 z-[60] hover:opacity-50 transition-opacity duration-200"
        style={cornerStyle}
        aria-label="Алиса Волосникова — home"
      >
        Алиса Волосникова
      </TransitionLink>

      {/* ── Menu trigger — top right ────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="ghost-nav-overlay"
        className="fixed top-6 right-6 z-[60] hover:opacity-50 transition-opacity duration-200
                   bg-transparent border-none cursor-pointer p-0"
        style={cornerStyle}
      >
        MENU
      </button>

      {/* ── Fullscreen overlay ──────────────────────────────── */}
      {/*
        pointerEvents is controlled by React state (not GSAP) to avoid
        React reconciliation conflicts. clipPath is fully owned by GSAP.
      */}
      <div
        ref={overlayRef}
        id="ghost-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed inset-0 z-[70] flex flex-col px-6 md:px-16 py-8"
        style={{
          backgroundColor: '#0A0A0A',
          clipPath:        'inset(0% 0% 100% 0%)',
          pointerEvents:   open ? 'auto' : 'none',
        }}
      >
        {/* Top row */}
        <div ref={topRowRef} className="flex justify-between items-start">
          <span
            className="font-sans text-[10px] tracking-extreme select-none"
            style={{ color: 'rgba(245,245,245,0.3)' }}
          >
            Алиса Волосникова
          </span>
          <button
            onClick={() => setOpen(false)}
            data-cursor="link"
            aria-label="Close navigation"
            className="font-sans text-[10px] tracking-extreme
                       bg-transparent border-none cursor-pointer p-0"
            style={{ color: 'rgba(245,245,245,0.5)' }}
          >
            CLOSE
          </button>
        </div>

        {/* Main links — vertically centred */}
        <nav aria-label="Main navigation" className="flex-1 flex items-center">
          <ul className="list-none m-0 p-0 flex flex-col">
            {NAV_ITEMS.map(({ label, href }, i) => {
              const isActive    = pathname === href
              // Only dim non-active links when we're already inside a nav page
              const isOnNavPage = NAV_ITEMS.some(item => item.href === pathname)
              const linkOpacity = isOnNavPage ? (isActive ? 1 : 0.45) : 1
              return (
                <li key={href}>
                  <div ref={(el) => { linkRefs.current[i] = el }}>
                    <TransitionLink
                      href={href}
                      onClick={() => setOpen(false)}
                      data-cursor="link"
                      className="block font-serif italic hover:opacity-40 transition-opacity duration-300"
                      style={{
                        color:         '#F5F5F5',
                        fontSize:      'clamp(3.8rem, 8.5vw, 10rem)',
                        lineHeight:    0.87,
                        letterSpacing: '-0.025em',
                        fontWeight:    300,
                        opacity:       linkOpacity,
                      }}
                    >
                      {label}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="font-sans not-italic inline-block ml-4 align-middle"
                          style={{ fontSize: '9px', letterSpacing: '0.22em', opacity: 0.5, verticalAlign: 'middle' }}
                        >
                          ←
                        </span>
                      )}
                    </TransitionLink>
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <p
          ref={footerRef}
          className="font-sans text-[9px] tracking-extreme select-none"
          style={{ color: 'rgba(245,245,245,0.28)' }}
        >
          FINE ART PHOTOGRAPHY · MOSCOW · EST. 2019
        </p>
      </div>
    </>
  )
}
