'use client'
import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'

// ─── Context ──────────────────────────────────────────────────────────────────
type Ctx = {
  navigate:    (href: string) => void
  onLinkEnter: () => void
  onLinkLeave: () => void
}

const TransitionCtx = createContext<Ctx>({
  navigate:    () => {},
  onLinkEnter: () => {},
  onLinkLeave: () => {},
})

export function usePageTransition() { return useContext(TransitionCtx) }

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const navigate    = useCallback((href: string) => { router.push(href) }, [router])
  const onLinkEnter = useCallback(() => {}, [])
  const onLinkLeave = useCallback(() => {}, [])

  return (
    <TransitionCtx.Provider value={{ navigate, onLinkEnter, onLinkLeave }}>
      {children}
    </TransitionCtx.Provider>
  )
}

// ─── TransitionLink — drop-in replacement for <Link> ─────────────────────────
import type { ReactNode as RN } from 'react'

type TransitionLinkProps = {
  href:           string
  children:       RN
  className?:     string
  style?:         React.CSSProperties
  'data-cursor'?: string
  onClick?:       () => void
}

export function TransitionLink({
  href, children, className, onClick, ...rest
}: TransitionLinkProps) {
  const { navigate } = usePageTransition()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(document as any).startViewTransition(() => {
        flushSync(() => navigate(href))
      })
    } else {
      navigate(href)
    }
  }, [href, navigate, onClick])

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}
