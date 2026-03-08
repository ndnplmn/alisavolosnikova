'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

type CursorState = 'default' | 'hover-photo' | 'hover-link'

export function CustomCursor() {
  const ringRef  = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [isTouch, setIsTouch]   = useState(true)
  const [state,   setState]     = useState<CursorState>('default')
  const [label,   setLabel]     = useState('')

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) { setIsTouch(true); return }
    setIsTouch(false)

    const ring = ringRef.current
    if (!ring) return

    // Position tracking
    const xTo = gsap.quickTo(ring, 'x', { duration: 0.10, ease: 'power3.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.10, ease: 'power3.out' })

    const onMouseMove = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY) }
    window.addEventListener('mousemove', onMouseMove)

    // Hover handlers
    const onPhotoEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      setLabel(el.dataset.cursorLabel ?? '')
      setState('hover-photo')
    }
    const onPhotoLeave = () => { setState('default'); setLabel('') }
    const onLinkEnter  = () => setState('hover-link')
    const onLinkLeave  = () => setState('default')

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
    const observer = new MutationObserver(registerTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      observer.disconnect()
    }
  }, [])

  // Ring size transitions
  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return

    const sizes: Record<CursorState, number> = {
      'default':     28,
      'hover-link':  44,
      'hover-photo': 80,
    }
    const fills: Record<CursorState, string> = {
      'default':     'transparent',
      'hover-link':  'transparent',
      'hover-photo': 'rgba(255,255,255,0.15)',
    }

    gsap.to(ring, {
      width:           sizes[state],
      height:          sizes[state],
      backgroundColor: fills[state],
      duration:        state === 'hover-photo' ? 0.45 : 0.25,
      ease:            state === 'hover-photo' ? 'elastic.out(1,0.6)' : 'power2.out',
    })
  }, [state])

  if (isTouch) return null

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full
                 flex items-center justify-center mix-blend-difference"
      style={{
        width:  28,
        height: 28,
        border: '1.5px solid #ffffff',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, width, height',
      }}
    >
      {state === 'hover-photo' && label && (
        <span
          ref={labelRef}
          className="font-sans text-[7px] tracking-[0.2em] text-white uppercase
                     whitespace-nowrap select-none"
        >
          {label}
        </span>
      )}
    </div>
  )
}
