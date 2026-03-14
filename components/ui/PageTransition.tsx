'use client'
import { createContext, useContext, useCallback, type ReactNode } from 'react'
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

// ─── TransitionLink — drop-in replacement for <Link> in Nav ──────────────────
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
    navigate(href)
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
