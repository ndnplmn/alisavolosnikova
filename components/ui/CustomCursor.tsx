'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

type CursorState = 'default' | 'hover-photo' | 'hover-link'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [isTouch, setIsTouch] = useState(true) // default true to avoid SSR flash
  const [state, setState] = useState<CursorState>('default')
  const [label, setLabel] = useState('')

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true)
      return
    }
    setIsTouch(false)

    const dot = dotRef.current
    if (!dot) return

    // Smooth cursor tracking
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('mousemove', onMouseMove)

    // Photo hover
    const onPhotoEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      setLabel(el.dataset.cursorLabel ?? '')
      setState('hover-photo')
    }
    const onPhotoLeave = () => {
      setState('default')
      setLabel('')
    }

    // Link hover
    const onLinkEnter = () => setState('hover-link')
    const onLinkLeave = () => setState('default')

    // Register targets (called once + on DOM mutations for dynamic content)
    const registerTargets = () => {
      document.querySelectorAll('[data-cursor="photo"]').forEach(el => {
        el.removeEventListener('mouseenter', onPhotoEnter)
        el.removeEventListener('mouseleave', onPhotoLeave)
        el.addEventListener('mouseenter', onPhotoEnter)
        el.addEventListener('mouseleave', onPhotoLeave)
      })
      document.querySelectorAll('a, button, [data-cursor="link"]').forEach(el => {
        el.removeEventListener('mouseenter', onLinkEnter)
        el.removeEventListener('mouseleave', onLinkLeave)
        el.addEventListener('mouseenter', onLinkEnter)
        el.addEventListener('mouseleave', onLinkLeave)
      })
    }

    registerTargets()

    // Re-register on DOM changes (new photos/links added after navigation)
    const observer = new MutationObserver(registerTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      observer.disconnect()
    }
  }, [])

  // Size animation based on state
  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    const sizes: Record<CursorState, number> = {
      'default': 6,
      'hover-link': 40,
      'hover-photo': 64,
    }
    const eases: Record<CursorState, string> = {
      'default': 'power2.out',
      'hover-link': 'power2.out',
      'hover-photo': 'elastic.out(1, 0.5)',
    }

    gsap.to(dot, {
      width: sizes[state],
      height: sizes[state],
      duration: state === 'hover-photo' ? 0.5 : 0.3,
      ease: eases[state],
    })
  }, [state])

  // Don't render on touch devices
  if (isTouch) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center mix-blend-difference bg-[#F5F2EE]"
      style={{
        width: 6,
        height: 6,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, width, height',
      }}
    >
      {state === 'hover-photo' && label && (
        <span
          ref={labelRef}
          className="font-sans text-[7px] tracking-extreme text-dark uppercase whitespace-nowrap select-none"
        >
          {label}
        </span>
      )}
    </div>
  )
}
