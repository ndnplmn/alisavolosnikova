'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { TransitionLink } from '@/components/ui/PageTransition'
import { useViewMode } from '@/contexts/ViewModeContext'

const NAV_ITEMS = [
  { label: 'ABOUT',   href: '/about'   },
  { label: 'PRINTS',  href: '/prints'  },
  { label: 'CONTACT', href: '/contact' },
]

export function Nav() {
  const pathname  = usePathname()
  const navRef    = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeRef  = useRef<HTMLButtonElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const { viewMode, setViewMode } = useViewMode()
  const isHome = pathname === '/'

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  // Entrance + hide-on-scroll-down / reveal-on-scroll-up
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // Entrance
    gsap.fromTo(nav, { y: -48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 })

    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      if (y < 8) {
        gsap.to(nav, { y: 0, duration: 0.45, ease: 'power3.out', overwrite: true })
      } else if (y > lastY) {
        gsap.to(nav, { y: '-100%', duration: 0.35, ease: 'power3.in', overwrite: true })
      } else {
        gsap.to(nav, { y: 0, duration: 0.45, ease: 'power3.out', overwrite: true })
      }
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Escape key
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Focus management
  useEffect(() => {
    if (mobileOpen) closeRef.current?.focus()
    else burgerRef.current?.focus()
  }, [mobileOpen])

  return (
    <>
      {/* ── Desktop / mobile top bar ─────────────────────────── */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 h-8 flex items-start justify-between px-3 pt-2"
        style={{}}
        aria-label="Main navigation"
      >
        {/* Name / home link */}
        <Link
          href="/"
          data-cursor="link"
          className="font-sans text-[10px] tracking-[0.22em] text-ink uppercase
                     hover:opacity-50 transition-opacity duration-200"
        >
          Алиса Волосникова
        </Link>

        {/* GRID / LIST toggle — home only, centered */}
        {isHome && (
          <div className="hidden md:flex gap-5 absolute left-1/2 -translate-x-1/2">
            {(['GRID', 'LIST'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                data-cursor="link"
                className="font-sans text-[9px] tracking-[0.2em] text-ink transition-opacity duration-200"
                style={{ opacity: viewMode === v ? 1 : 0.3 }}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <TransitionLink
                href={href}
                data-cursor="link"
                className={`relative font-sans text-[10px] tracking-[0.18em]
                            transition-opacity duration-200 inline-block text-ink
                            ${isActive(href)
                              ? 'opacity-100'
                              : 'opacity-35 hover:opacity-100'}`}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-ink" />
                )}
              </TransitionLink>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          ref={burgerRef}
          className="md:hidden font-sans text-[18px] text-ink leading-none
                     opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          &#8212;
        </button>
      </nav>

      {/* ── Mobile overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 bg-cream z-[60] flex flex-col items-center justify-center gap-10 md:hidden"
        >
          <button
            ref={closeRef}
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-6 font-sans text-[20px] text-ink leading-none
                       opacity-40 hover:opacity-100 transition-opacity"
            aria-label="Close menu"
          >
            &#215;
          </button>

          {NAV_ITEMS.map(({ label, href }) => (
            <TransitionLink
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`font-serif text-5xl transition-opacity duration-200
                          ${isActive(href) ? 'text-ink' : 'text-ink/40 hover:text-ink/80'}`}
            >
              {label}
            </TransitionLink>
          ))}

          <p className="absolute bottom-6 left-6 font-sans text-[9px] tracking-[0.22em] text-muted uppercase">
            Fine Art Photography
          </p>
        </div>
      )}
    </>
  )
}
