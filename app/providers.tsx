'use client'
import { type ReactNode } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'
import { FilmGrain } from '@/components/ui/FilmGrain'
import { LenisProvider } from '@/components/ui/LenisProvider'
import { LanguageButton } from '@/components/ui/LanguageButton'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ViewModeProvider } from '@/contexts/ViewModeContext'
import { PageTransitionProvider } from '@/components/ui/PageTransition'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PageTransitionProvider>
      <LenisProvider>
        <LanguageProvider>
          <ViewModeProvider>
            <PageLoader />
            <FilmGrain />
            <LanguageButton />
            {children}
          </ViewModeProvider>
        </LanguageProvider>
      </LenisProvider>
    </PageTransitionProvider>
  )
}
