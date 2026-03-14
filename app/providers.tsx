'use client'
import { type ReactNode } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'
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
            <LanguageButton />
            {children}
          </ViewModeProvider>
        </LanguageProvider>
      </LenisProvider>
    </PageTransitionProvider>
  )
}
