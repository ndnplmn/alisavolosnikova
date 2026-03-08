'use client'
import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

interface CTAButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export function CTAButton({ href, onClick, children, className = '', type = 'button' }: CTAButtonProps) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  const onEnter = () => {
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.25, ease: 'power2.out' })
    gsap.to(arrowRef.current, { x: 4, duration: 0.25, ease: 'power2.out' })
  }

  const onLeave = () => {
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.25, ease: 'power2.out' })
    gsap.to(arrowRef.current, { x: 0, duration: 0.25, ease: 'power2.out' })
  }

  const inner = (
    <span className="relative inline-flex flex-col items-start">
      <span className="font-sans text-[10px] tracking-extreme uppercase flex items-center gap-1.5">
        {children}
        <span ref={arrowRef} className="inline-block will-change-transform">→</span>
      </span>
      <span
        ref={lineRef}
        className="block h-px bg-current w-full mt-0.5 will-change-transform"
        style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
      />
    </span>
  )

  const sharedProps = {
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    'data-cursor': 'link' as const,
    className: `inline-block ${className}`,
  }

  if (href) {
    return (
      <Link href={href} {...sharedProps}>
        {inner}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} {...sharedProps} style={{ background: 'none', border: 'none', padding: 0, cursor: 'none' }}>
      {inner}
    </button>
  )
}
