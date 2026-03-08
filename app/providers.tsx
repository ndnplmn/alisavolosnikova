'use client'
import { type ReactNode } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoader />
      {children}
    </>
  )
}
