'use client'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useLang } from '@/contexts/LanguageContext'

export function LanguageButton() {
  const { lang, toggle } = useLang()
  const enRef  = useRef<HTMLSpanElement>(null)
  const ruRef  = useRef<HTMLSpanElement>(null)

  const handleClick = () => {
    const leaving = lang === 'en' ? enRef.current : ruRef.current
    const entering = lang === 'en' ? ruRef.current : enRef.current

    gsap.to(leaving,  { opacity: 0, y: -6, duration: 0.2, ease: 'power2.in' })
    gsap.fromTo(entering,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', delay: 0.15 }
    )
    toggle()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={lang === 'en' ? 'Switch to Russian' : 'Switch to English'}
      className="fixed z-[9998] font-sans"
      style={{
        bottom:        '1.6rem',
        right:         '1.6rem',
        cursor:        'pointer',
        background:    'none',
        border:        'none',
        padding:       0,
        mixBlendMode:  'difference',
        width:         '22px',
        height:        '22px',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
      }}
    >
      <span style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          ref={enRef}
          style={{
            position:      'absolute',
            fontSize:      '9px',
            letterSpacing: '0.12em',
            color:         'rgba(255,255,255,0.85)',
            opacity:       lang === 'en' ? 1 : 0,
          }}
        >
          EN
        </span>
        <span
          ref={ruRef}
          style={{
            position:      'absolute',
            fontSize:      '9px',
            letterSpacing: '0.12em',
            color:         'rgba(255,255,255,0.85)',
            opacity:       lang === 'ru' ? 1 : 0,
          }}
        >
          RU
        </span>
      </span>
    </button>
  )
}
