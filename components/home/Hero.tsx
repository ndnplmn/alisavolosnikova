// components/home/Hero.tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TransitionLink } from '@/components/ui/PageTransition'
import { getLenis } from '@/hooks/useLenis'
import { useLang } from '@/contexts/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

type Filter    = 'ALL' | 'B&W' | 'COLOR'
type PhotoMode = 'dark' | 'light'

// ─── Panel color tokens per mode ──────────────────────────────────────────────
const PANEL_COLORS: Record<PhotoMode, {
  bg: string; text: string; rule: string; muted: string; watermark: string
}> = {
  dark:  { bg: '#0A0A0A', text: '#F5F5F5', rule: 'rgba(245,245,245,0.12)', muted: 'rgba(245,245,245,0.45)', watermark: 'rgba(245,245,245,0.07)' },
  light: { bg: '#F5F5F5', text: '#0A0A0A', rule: 'rgba(10,10,10,0.1)',     muted: 'rgba(10,10,10,0.40)',   watermark: 'rgba(10,10,10,0.07)'      },
}

const FILTERS = ['ALL', 'B&W', 'COLOR'] as const

// ─── Photo data ───────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: '/images/foto-01.png', slug: 'oblique-light',     title: 'Oblique Light',        series: '', year: '2024', position: 'center 30%',    mode: 'dark'  as const, location: 'Moscow · 2024',           en: 'Oblique light on skin.\nSilence has texture.',                     ru: 'Косой свет на коже.\nТишина имеет фактуру.' },
  { src: '/images/foto-02.png', slug: 'between-breaths',   title: 'Between Breaths',      series: '', year: '2024', position: 'center center',  mode: 'dark'  as const, location: 'Saint Petersburg · 2024', en: 'A pause between two breaths.\nNothing moves.',                     ru: 'Пауза между двумя вдохами.\nНичто не движется.' },
  { src: '/images/foto-03.png', slug: 'body-as-landscape', title: 'Body as Landscape',    series: '', year: '2023', position: 'center 40%',    mode: 'light' as const, location: 'Tbilisi · 2023',          en: 'The body as landscape.\nShadow is its geography.',                ru: 'Тело как пейзаж.\nТень — его география.' },
  { src: '/images/foto-04.png', slug: 'suspended-instant', title: 'Suspended Instant',    series: '', year: '2025', position: 'center center',  mode: 'dark'  as const, location: 'Moscow · 2025',           en: 'A suspended instant.\nTime does not advance here.',               ru: 'Застывший миг.\nВремя здесь не движется.' },
  { src: '/images/foto-05.png', slug: 'fragment-real',     title: 'Fragment of the Real', series: '', year: '2024', position: 'center 35%',    mode: 'light' as const, location: 'Helsinki · 2024',         en: 'A fragment of the real.\nEverything else is noise.',              ru: 'Фрагмент реального.\nВсё остальное — шум.' },
  { src: '/images/foto-06.png', slug: 'light-reveals',     title: 'Light Reveals',        series: '', year: '2023', position: 'center center',  mode: 'dark'  as const, location: 'Yerevan · 2023',          en: 'Light does not illuminate —\nit reveals what was already there.', ru: 'Свет не освещает —\nон открывает то, что уже было.' },
  { src: '/images/foto-07.png', slug: 'active-stillness',  title: 'Active Stillness',     series: '', year: '2025', position: 'center 40%',    mode: 'light' as const, location: 'Moscow · 2025',           en: 'Active stillness.\nThe image breathes on its own.',              ru: 'Активная тишина.\nОбраз дышит сам по себе.' },
  { src: '/images/foto-08.png', slug: 'between-form',      title: 'Between Form',         series: '', year: '2024', position: 'center center',  mode: 'dark'  as const, location: 'Riga · 2024',             en: 'Between form and its absence.\nA threshold zone.',               ru: 'Между формой и её отсутствием.\nПограничная зона.' },
  { src: '/images/foto-09.png', slug: 'last-frame',        title: 'Last Frame',           series: '', year: '2025', position: 'center 30%',    mode: 'light' as const, location: 'Saint Petersburg · 2025', en: 'The last frame.\nThe visible dissolves.',                         ru: 'Последний кадр.\nВидимое растворяется.' },
]

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({
  filter,
  onChange,
  mode,
}: {
  filter:   Filter
  onChange: (f: Filter) => void
  mode:     PhotoMode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const buttonRefs   = useRef<(HTMLButtonElement | null)[]>([])
  const colors       = PANEL_COLORS[mode]

  const positionIndicator = useCallback((f: Filter, animate: boolean) => {
    const container = containerRef.current
    const indicator = indicatorRef.current
    if (!container || !indicator) return
    const idx = FILTERS.indexOf(f)
    const btn = buttonRefs.current[idx]
    if (!btn) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    if (animate) {
      gsap.to(indicator, { x: bRect.left - cRect.left, width: bRect.width, duration: 0.35, ease: 'power3.inOut' })
    } else {
      gsap.set(indicator, { x: bRect.left - cRect.left, width: bRect.width })
    }
  }, [])

  // Mount only — snap indicator to initial position
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { positionIndicator(filter, false) }, [])

  // Sync indicator color when panel mode changes
  useEffect(() => {
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, { backgroundColor: colors.text, duration: 0.4 })
    }
    return () => { gsap.killTweensOf(indicatorRef.current) }
  }, [mode, colors.text])

  return (
    <div ref={containerRef} className="relative flex gap-5">
      {FILTERS.map((f, i) => (
        <button
          key={f}
          ref={el => { buttonRefs.current[i] = el }}
          onClick={() => { onChange(f); positionIndicator(f, true) }}
          aria-pressed={filter === f}
          className="font-sans text-[9px] tracking-extreme transition-opacity duration-200"
          style={{ opacity: filter === f ? 1 : 0.3, color: colors.text }}
        >
          {f}
        </button>
      ))}
      <div
        ref={indicatorRef}
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 0, left: 0, height: '1px', width: 0, backgroundColor: colors.text }}
      />
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const { lang, langRef } = useLang()
  const [filter,     setFilter]     = useState<Filter>('ALL')
  const [isMobile,   setIsMobile]   = useState(false)
  const [activeMode, setActiveMode] = useState<PhotoMode>(PHOTOS[0].mode)
  const [activeSlug, setActiveSlug] = useState<string>(PHOTOS[0].slug)

  const filteredPhotos    = filter === 'ALL' ? PHOTOS
    : PHOTOS.filter(p => filter === 'B&W' ? p.mode === 'dark' : p.mode === 'light')
  const filteredPhotosRef = useRef(filteredPhotos)
  useEffect(() => { filteredPhotosRef.current = filteredPhotos }, [filteredPhotos])

  // ── Panel refs ──
  const panelRef    = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLParagraphElement>(null)
  const descRef     = useRef<HTMLParagraphElement>(null)
  const metaRef     = useRef<HTMLParagraphElement>(null)
  const locRef      = useRef<HTMLParagraphElement>(null)
  const counterRef  = useRef<HTMLSpanElement>(null)
  const activeIdxRef    = useRef(0)

  // All primary-text elements (animated between #0A0A0A and #F5F5F5)
  const primaryTextRefs = useRef<(HTMLElement | null)[]>([])

  // ── Photo refs ──
  const photoRefs = useRef<HTMLDivElement[]>([])

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Panel update ──
  const updatePanel = useCallback((i: number) => {
    const photos = filteredPhotosRef.current
    const photo  = photos[i]
    if (!photo) return
    activeIdxRef.current = i

    const colors = PANEL_COLORS[photo.mode]

    // Animate panel background
    if (panelRef.current) {
      gsap.to(panelRef.current, { backgroundColor: colors.bg, duration: 0.4, ease: 'power2.inOut' })
    }

    // Cross-fade text: fade out → update content → color → fade in
    const textEls = primaryTextRefs.current.filter(Boolean) as HTMLElement[]
    gsap.to(textEls, {
      opacity: 0, y: -5, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        if (titleRef.current)   titleRef.current.textContent   = photo.title
        if (descRef.current)    descRef.current.textContent    = photo[langRef.current]
        if (metaRef.current)    metaRef.current.textContent    = photo.series
          ? `${photo.series} · ${photo.year}`
          : photo.year
        if (locRef.current)     locRef.current.textContent     = photo.location
        if (counterRef.current) counterRef.current.textContent = String(i + 1).padStart(2, '0')

        setActiveSlug(photo.slug)

        // Instant color change while invisible, then fade in
        gsap.set(textEls, { color: colors.text })
        gsap.fromTo(textEls,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', stagger: 0.035 }
        )
      },
    })

    setActiveMode(photo.mode)
  }, [langRef])

  // Re-run panel update when language changes
  useEffect(() => {
    updatePanel(activeIdxRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // ── ScrollTriggers + Lenis snap ──
  useEffect(() => {
    photoRefs.current = []

    let lastSnapAt = 0
    const snapTo = (el: HTMLElement) => {
      const now = Date.now()
      if (now - lastSnapAt < 1000) return
      lastSnapAt = now
      getLenis()?.scrollTo(el, { offset: -48, duration: 1.1 })
    }

    const triggers: ScrollTrigger[] = []

    photoRefs.current.forEach((el, i) => {
      if (!el) return

      if (!isMobile) {
        // Panel update trigger
        const t1 = ScrollTrigger.create({
          trigger: el,
          start: 'top 50%', end: 'bottom 50%',
          onEnter:     () => updatePanel(i),
          onEnterBack: () => updatePanel(i),
        })
        triggers.push(t1)

        // Snap trigger
        const t2 = ScrollTrigger.create({
          trigger: el,
          start: 'top 38%',
          onEnter:     () => snapTo(el),
          onEnterBack: () => snapTo(el),
        })
        triggers.push(t2)
      }

      // Ken Burns subtle settle on photo entrance
      const anim = gsap.fromTo(el,
        { scale: 1.025 },
        { scale: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 70%' } }
      )
      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    })

    // Initialize panel to first photo
    updatePanel(0)

    return () => { triggers.forEach(t => t.kill()) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPhotos, isMobile])

  const colors = PANEL_COLORS[activeMode]

  // ─── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div>
        {filteredPhotos.map((photo, i) => (
          <div key={photo.slug}>
            <div
              ref={el => { if (el) photoRefs.current[i] = el }}
              className="relative w-full overflow-hidden"
              style={{ height: '82svh' }}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: photo.position }}
                priority={i === 0}
              />
            </div>
            <div className="px-6 pt-5 pb-10">
              <p
                className="font-serif italic"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 300, lineHeight: 1.05, color: 'var(--color-text-dark)' }}
              >
                {photo.title}
              </p>
              <p
                className="font-serif italic mt-2"
                style={{ fontSize: '13px', lineHeight: 1.8, opacity: 0.6, color: 'var(--color-text-dark)', whiteSpace: 'pre-line' }}
              >
                {photo[lang as 'en' | 'ru']}
              </p>
              <p className="font-sans text-[9px] tracking-extreme text-muted mt-3">
                {photo.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ─── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex">
      {/* Left: photo sequence — 70% */}
      <div className="w-[70%] flex-shrink-0">
        {filteredPhotos.map((photo, i) => (
          <div
            key={photo.slug}
            ref={el => { if (el) photoRefs.current[i] = el }}
            className="relative w-full overflow-hidden"
            style={{ height: '100svh' }}
          >
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              sizes="70vw"
              className="object-cover"
              style={{ objectPosition: photo.position }}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Right: sticky adaptive panel — 30% */}
      <div className="w-[30%]">
        <div
          ref={panelRef}
          style={{
            position:        'sticky',
            top:             'var(--nav-h)',
            height:          'calc(100svh - var(--nav-h))',
            backgroundColor: PANEL_COLORS[filteredPhotos[0]?.mode ?? 'dark'].bg,
            display:         'flex',
            flexDirection:   'column',
            justifyContent:  'space-between',
          }}
        >
          {/* TOP: artist name + rule + filter */}
          <div className="px-8 pt-10">
            <p className="font-sans text-[9px] tracking-extreme" style={{ color: colors.muted }}>
              АЛИСА ВОЛОСНИКОВА
            </p>
            <div style={{ height: '1px', background: colors.rule, margin: '12px 0 16px' }} />
            <FilterBar filter={filter} onChange={setFilter} mode={activeMode} />
            <div style={{ height: '1px', background: colors.rule, marginTop: '16px' }} />
          </div>

          {/* MIDDLE: series/year + title + description + location */}
          <div className="px-8 flex flex-col gap-3 flex-1 justify-center">
            <p
              ref={el => { metaRef.current = el; primaryTextRefs.current[0] = el }}
              className="font-sans text-[9px] tracking-extreme"
              style={{ color: colors.muted }}
            >
              {filteredPhotos[0]?.series
                ? `${filteredPhotos[0].series} · ${filteredPhotos[0].year}`
                : filteredPhotos[0]?.year ?? ''}
            </p>
            <p
              ref={el => { titleRef.current = el; primaryTextRefs.current[1] = el }}
              className="font-serif italic"
              style={{
                fontSize:      'clamp(2rem, 2.8vw, 4rem)',
                fontWeight:    300,
                letterSpacing: '-0.02em',
                lineHeight:    1.0,
                color:         colors.text,
                whiteSpace:    'pre-line',
              }}
            >
              {filteredPhotos[0]?.title ?? ''}
            </p>
            <p
              ref={el => { descRef.current = el; primaryTextRefs.current[2] = el }}
              className="font-serif italic"
              style={{
                fontSize:   'clamp(0.85rem, 1.05vw, 1.2rem)',
                lineHeight: 1.85,
                color:      colors.text,
                opacity:    0.55,
                maxWidth:   '26ch',
                whiteSpace: 'pre-line',
              }}
            >
              {filteredPhotos[0]?.[lang as 'en' | 'ru'] ?? ''}
            </p>
            <p
              ref={el => { locRef.current = el; primaryTextRefs.current[3] = el }}
              className="font-sans text-[9px] tracking-extreme"
              style={{ color: colors.muted, marginTop: '4px' }}
            >
              {filteredPhotos[0]?.location ?? ''}
            </p>
          </div>

          {/* BOTTOM: watermark counter + view link */}
          <div className="px-8 pb-10">
            <div style={{ lineHeight: 0.85, marginBottom: '24px' }}>
              <span
                ref={el => { counterRef.current = el; primaryTextRefs.current[4] = el }}
                className="font-serif italic block"
                style={{
                  fontSize:   'clamp(4.5rem, 6.5vw, 8rem)',
                  fontWeight: 300,
                  color:      colors.text,
                  opacity:    0.07,
                }}
              >
                {String(1).padStart(2, '0')}
              </span>
              <span
                className="font-serif italic block"
                style={{
                  fontSize:   'clamp(1.5rem, 2vw, 2.5rem)',
                  fontWeight: 300,
                  color:      colors.muted,
                  opacity:    0.5,
                }}
              >
                / {String(filteredPhotos.length).padStart(2, '0')}
              </span>
            </div>
            <TransitionLink
              href={`/work/${activeSlug}`}
              data-cursor="link"
              className="font-sans text-[9px] tracking-extreme transition-opacity duration-300 hover:opacity-40"
              style={{ color: colors.text }}
            >
              VIEW SERIES →
            </TransitionLink>
          </div>
        </div>
      </div>
    </div>
  )
}
