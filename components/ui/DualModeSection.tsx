'use client'
import { useRef, type ReactNode } from 'react'
import { useDualMode } from '@/hooks/useDualMode'

interface DualModeSectionProps {
  mode: 'dark' | 'light'
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

export function DualModeSection({
  mode,
  children,
  className = '',
  as: Tag = 'section',
}: DualModeSectionProps) {
  const ref = useRef<HTMLElement>(null)
  useDualMode(ref, mode)

  return (
    <Tag ref={ref as React.RefObject<HTMLElement & HTMLDivElement & HTMLElement>} className={className}>
      {children}
    </Tag>
  )
}
