'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAV_ITEMS = [
  { label: 'WORK', href: '/work' },
  { label: 'ABOUT', href: '/about' },
  { label: 'PRINTS', href: '/prints' },
  { label: 'CONTACT', href: '/contact' },
]

export function Nav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Desktop: fade nav in/out based on cursor proximity to top 12% of viewport
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // Start at low opacity
    gsap.set(nav, { opacity: 0.35 })

    const onMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.12
      if (e.clientY < threshold) {
        gsap.to(nav, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      } else {
        gsap.to(nav, { opacity: 0.35, duration: 0.3, ease: 'power2.out' })
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Desktop nav — fixed top-right */}
      <nav
        ref={navRef}
        className="fixed top-6 right-6 z-40 hidden md:block"
        aria-label="Main navigation"
      >
        <ul className="flex gap-6 list-none m-0 p-0">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                data-cursor="link"
                className={`
                  relative font-sans text-[10px] tracking-extreme text-light no-underline
                  transition-opacity duration-200
                  ${isActive(href) ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
                `}
              >
                {label}
                {/* Active underline */}
                {isActive(href) && (
                  <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: hamburger toggle — top-right */}
      <button
        className="fixed top-6 right-6 z-50 md:hidden font-sans text-lg text-light leading-none pointer-events-auto"
        onClick={() => setMobileOpen(o => !o)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '×' : '—'}
      </button>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-dark z-40 flex flex-col items-center justify-center gap-10 md:hidden">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`font-serif text-4xl text-light no-underline transition-opacity ${isActive(href) ? 'opacity-100' : 'opacity-60'}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
