'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TransitionLink } from '@/components/ui/PageTransition'
import { useLang } from '@/contexts/LanguageContext'
import { useViewMode } from '@/contexts/ViewModeContext'

gsap.registerPlugin(ScrollTrigger)

type Filter = 'ALL' | 'B&W' | 'COLOR'

const PHOTOS = [
  { src: '/images/foto-01.png', slug: 'oblique-light',     position: 'center 30%',  mode: 'dark'  as const, location: 'Moscow · 2024',            en: 'Oblique light on skin.\nSilence has texture.',              ru: 'Косой свет на коже.\nТишина имеет фактуру.' },
  { src: '/images/foto-02.png', slug: 'between-breaths',   position: 'center center', mode: 'dark'  as const, location: 'Saint Petersburg · 2024',  en: 'A pause between two breaths.\nNothing moves.',              ru: 'Пауза между двумя вдохами.\nНичто не движется.' },
  { src: '/images/foto-03.png', slug: 'body-as-landscape', position: 'center 40%',  mode: 'light' as const, location: 'Tbilisi · 2023',           en: 'The body as landscape.\nShadow is its geography.',          ru: 'Тело как пейзаж.\nТень — его география.' },
  { src: '/images/foto-04.png', slug: 'suspended-instant', position: 'center center', mode: 'dark'  as const, location: 'Moscow · 2025',            en: 'A suspended instant.\nTime does not advance here.',         ru: 'Застывший миг.\nВремя здесь не движется.' },
  { src: '/images/foto-05.png', slug: 'fragment-real',     position: 'center 35%',  mode: 'light' as const, location: 'Helsinki · 2024',          en: 'A fragment of the real.\nEverything else is noise.',        ru: 'Фрагмент реального.\nВсё остальное — шум.' },
  { src: '/images/foto-06.png', slug: 'light-reveals',     position: 'center center', mode: 'dark'  as const, location: 'Yerevan · 2023',           en: 'Light does not illuminate —\nit reveals what was already there.', ru: 'Свет не освещает —\nон открывает то, что уже было.' },
  { src: '/images/foto-07.png', slug: 'active-stillness',  position: 'center 40%',  mode: 'light' as const, location: 'Moscow · 2025',            en: 'Active stillness.\nThe image breathes on its own.',         ru: 'Активная тишина.\nОбраз дышит сам по себе.' },
  { src: '/images/foto-08.png', slug: 'between-form',      position: 'center center', mode: 'dark'  as const, location: 'Riga · 2024',              en: 'Between form and its absence.\nA threshold zone.',          ru: 'Между формой и её отсутствием.\nПограничная зона.' },
  { src: '/images/foto-09.png', slug: 'last-frame',        position: 'center 30%',  mode: 'light' as const, location: 'Saint Petersburg · 2025',  en: 'The last frame.\nThe visible dissolves.',                   ru: 'Последний кадр.\nВидимое растворяется.' },
]

const TOTAL = PHOTOS.length

export function Hero() {
  const { lang, langRef } = useLang()
  const { viewMode } = useViewMode()
  const [isMobile, setIsMobile] = useState(false)
  const [filter, setFilter]     = useState<Filter>('ALL')

  const filteredPhotos = filter === 'ALL' ? PHOTOS
    : PHOTOS.filter(p => filter === 'B&W' ? p.mode === 'dark' : p.mode === 'light')
  const counterRef   = useRef<HTMLSpanElement>(null)
  const mCounterRef  = useRef<HTMLSpanElement>(null)
  const locationRef  = useRef<HTMLParagraphElement>(null)
  const descRef      = useRef<HTMLParagraphElement>(null)
  const mDescRefs    = useRef<HTMLParagraphElement[]>([])
  const photoRefs    = useRef<HTMLDivElement[]>([])
  const innerRefs    = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    // Trim stale refs from previous filter/viewMode to avoid creating triggers on unmounted elements
    photoRefs.current.length = filteredPhotos.length
    innerRefs.current.length = filteredPhotos.length

    photoRefs.current.forEach((el, i) => {
      if (!el) return

      // Update desktop panel (LIST mode only)
      if (!isMobile && viewMode === 'LIST') {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%', end: 'bottom 45%',
          onEnter:     () => updatePanel(i),
          onEnterBack: () => updatePanel(i),
        })
      }

      // Mobile: fade description in when photo enters viewport
      if (isMobile) {
        const mDesc = mDescRefs.current[i]
        if (mDesc) {
          gsap.fromTo(mDesc,
            { opacity: 0, y: 10 },
            {
              opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play none none reverse' },
            }
          )
        }
      }
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [isMobile, filter, viewMode])

  function updatePanel(i: number) {
    const counter  = counterRef.current
    const desc     = descRef.current
    const location = locationRef.current
    const mCount   = mCounterRef.current

    const total = filteredPhotos.length
    if (mCount) mCount.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')

    if (!counter || !desc) return
    const targets = location ? [counter, desc, location] : [counter, desc]
    gsap.to(targets, {
      opacity: 0, y: 6, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
        desc.innerHTML = filteredPhotos[i][langRef.current].replace('\n', '<br/>')
        if (location) location.textContent = filteredPhotos[i].location
        gsap.fromTo(targets,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }
        )
      },
    })
  }

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    color:      'rgba(17,17,17,0.35)',
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  if (isMobile) return (
    <div style={{ position: 'relative' }}>

      {/* Floating counter — top right, fixed during scroll */}
      <div style={{
        position:   'fixed',
        top:        'calc(var(--nav-h) + 1rem)',
        right:      '1.25rem',
        zIndex:     40,
        pointerEvents: 'none',
      }}>
        <span
          ref={mCounterRef}
          style={{
            fontFamily:         'var(--font-sans)',
            fontSize:           '9px',
            letterSpacing:      '0.2em',
            color:              'rgba(17,17,17,0.3)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          01 / {String(TOTAL).padStart(2, '0')}
        </span>
      </div>

      {/* Photos — full width */}
      {PHOTOS.map(({ src, en, ru, slug, position }, i) => (
        <div key={src} style={{ marginBottom: i < TOTAL - 1 ? '1px' : 0 }}>

          {/* Photo */}
          <TransitionLink href={`/work/${slug}`} style={{ display: 'block' }}>
            <div
              ref={el => { if (el) photoRefs.current[i] = el }}
              style={{
                position: 'relative',
                height:   '82svh',
                overflow: 'hidden',
                clipPath: 'inset(100% 0 0 0)',
              }}
            >
              <div
                ref={el => { if (el) innerRefs.current[i] = el }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <Image
                  src={src}
                  alt={`Алиса Волосникова — ${String(i + 1).padStart(2, '0')}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: position }}
                  priority={i === 0}
                />
              </div>
            </div>
          </TransitionLink>

          {/* Description below photo */}
          <p
            ref={el => { if (el) mDescRefs.current[i] = el }}
            style={{
              fontFamily:  'var(--font-serif), Georgia, serif',
              fontStyle:   'italic',
              fontSize:    'clamp(0.85rem, 3.5vw, 1rem)',
              lineHeight:  1.6,
              color:       'rgba(17,17,17,0.5)',
              padding:     '1.25rem 1.25rem 1.75rem',
              margin:      0,
              opacity:     0,
            }}
            dangerouslySetInnerHTML={{ __html: (lang === 'en' ? en : ru).replace('\n', '<br/>') }}
          />

        </div>
      ))}

    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // DESKTOP — GRID LAYOUT (thumbnail grid, 3 columns)
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'GRID') return (
    <div style={{ padding: '2rem 2.5rem 6rem' }}>
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '3px',
      }}>
        {filteredPhotos.map(({ src, slug, location, position }, i) => (
          <TransitionLink
            key={src}
            href={`/work/${slug}`}
            style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', display: 'block' }}
          >
            <Image
              src={src}
              alt={`Алиса Волосникова — ${String(i + 1).padStart(2, '0')}`}
              fill
              sizes="33vw"
              className="object-cover"
              style={{ objectPosition: position }}
              priority={i < 3}
            />
            {/* location badge — bottom left */}
            <span style={{
              position:      'absolute',
              bottom:        '0.75rem',
              left:          '0.75rem',
              fontFamily:    'var(--font-sans)',
              fontSize:      '8px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         'rgba(232,228,223,0.7)',
            }}>
              {location}
            </span>
          </TransitionLink>
        ))}
      </div>

    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // DESKTOP — LIST LAYOUT (photos left + sticky panel right) — default
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>

      {/* Scrolling photo column — LEFT */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {filteredPhotos.map(({ src, slug, position }, i) => (
          <TransitionLink
            key={src}
            href={`/work/${slug}`}
            style={{ display: 'block', marginBottom: i < filteredPhotos.length - 1 ? '5px' : 0 }}
          >
            <div
              ref={el => { if (el) photoRefs.current[i] = el }}
              style={{
                position: 'relative',
                height:   '100vh',
                overflow: 'hidden',
              }}
            >
              <div
                ref={el => { if (el) innerRefs.current[i] = el }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <Image
                  src={src}
                  alt={`Алиса Волосникова — ${String(i + 1).padStart(2, '0')}`}
                  fill
                  sizes="70vw"
                  className="object-cover"
                  style={{ objectPosition: position }}
                  priority={i === 0}
                />
              </div>
            </div>
          </TransitionLink>
        ))}

      </div>

      {/* Sticky right panel */}
      <div style={{
        position:       'sticky',
        top:            'var(--nav-h)',
        width:          '30%',
        height:         'calc(100vh - var(--nav-h))',
        background:     'var(--color-cream)',
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        padding:        '2.5rem',
      }}>
        {/* Filter buttons — top */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {(['ALL', 'B&W', 'COLOR'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '9px',
                letterSpacing: '0.2em',
                background:    'none',
                border:        'none',
                padding:       0,
                cursor:        'pointer',
                color:         'rgba(17,17,17,1)',
                opacity:       filter === f ? 1 : 0.3,
                transition:    'opacity 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <p
          ref={descRef}
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontStyle:  'italic',
            fontSize:   'clamp(0.95rem, 1.15vw, 1.25rem)',
            lineHeight: 1.65,
            color:      'rgba(17,17,17,0.6)',
            maxWidth:   '20ch',
            margin:     0,
          }}
          dangerouslySetInnerHTML={{ __html: (filteredPhotos[0] ?? PHOTOS[0])[lang].replace('\n', '<br/>') }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Location — bottom */}
          <p ref={locationRef} style={{ ...mono, fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
            {filteredPhotos[0]?.location ?? PHOTOS[0].location}
          </p>
          <span
            ref={counterRef}
            style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(17,17,17,0.2)', fontVariantNumeric: 'tabular-nums' }}
          >
            01 / {String(filteredPhotos.length).padStart(2, '0')}
          </span>
        </div>
      </div>

    </div>
  )
}
