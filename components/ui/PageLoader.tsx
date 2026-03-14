'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export function PageLoader() {
  const panelRef = useRef<HTMLDivElement>(null)
  const nameRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('av-loader-shown')) {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const panel = panelRef.current
    const name  = nameRef.current
    if (!panel || !name) return

    gsap.set(name, { opacity: 0 })

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('av-loader-shown', '1')
        setVisible(false)
      },
    })

    // Name appears
    tl.to(name,  { opacity: 1, duration: 0.3, ease: 'power2.out' })
    // Hold
    tl.to({},    { duration: 0.2 })
    // Everything fades out
    tl.to(panel, { opacity: 0, duration: 0.3, ease: 'power2.out' })

    return () => { tl.kill() }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[9999] pointer-events-none bg-dark flex items-center justify-center"
      role="status"
      aria-label="Загрузка"
    >
      <div
        ref={nameRef}
        style={{
          fontFamily:    'var(--font-sans), system-ui, sans-serif',
          fontWeight:    300,
          fontSize:      'clamp(11px, 1vw, 14px)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color:         'rgba(239,239,235,0.6)',
        }}
      >
        Алиса Волосникова
      </div>
    </div>
  )
}
