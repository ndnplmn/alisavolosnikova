'use client'
import { type ReactNode } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'
import { FilmGrain } from '@/components/ui/FilmGrain'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { LenisProvider } from '@/components/ui/LenisProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <PageLoader />
      <FilmGrain />
      <CustomCursor />
      {children}
    </LenisProvider>
  )
}
