'use client'
import { type ReactNode } from 'react'

// Shell for global client-side providers
// FilmGrain, CustomCursor, PageLoader, LenisProvider will be added in Tasks 04-08
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
