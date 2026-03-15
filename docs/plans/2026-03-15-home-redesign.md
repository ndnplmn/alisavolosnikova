# Home Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the home page from a single Hero component into a 5-section scrollable narrative (Hero → Statement → Featured Work → Stats → Prints Teaser) with an adaptive-panel editorial hero and deliberate dark/light tonal cuts between sections.

**Architecture:** `app/page.tsx` becomes a server component fetching Sanity series data. `Hero.tsx` is completely rewritten to remove the GRID/LIST toggle and implement a 70/30 adaptive-panel layout. `Nav.tsx` loses its home-page GRID/LIST buttons. The four unused home components (`Statement`, `FeaturedWork`, `SeriesCounter`, `PrintTeaser`) are rewritten and wired into the page.

**Tech Stack:** Next.js App Router (server component for data), GSAP 3 (ScrollTrigger, color animation), Lenis smooth scroll, Tailwind v4, design tokens (`bg-ink #0A0A0A`, `bg-light #F5F5F5`, `text-text-dark`, `text-text-light`, `text-muted #8A8A8A`, `tracking-extreme 0.22em`).

---

## Task 1: Wire `app/page.tsx` — server component + all 5 sections

**Files:**
- Modify: `app/page.tsx`

**Step 1: Rewrite `app/page.tsx`**

```tsx
// app/page.tsx
import { client }           from '@/lib/sanity/client'
import { ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { Hero }          from '@/components/home/Hero'
import { Statement }     from '@/components/home/Statement'
import { FeaturedWork }  from '@/components/home/FeaturedWork'
import { SeriesCounter } from '@/components/home/SeriesCounter'
import { PrintTeaser }   from '@/components/home/PrintTeaser'

export const revalidate = 3600

export default async function HomePage() {
  let series: any[] = []
  try { series = await client.fetch(ALL_SERIES_QUERY) ?? [] } catch {}

  return (
    <main>
      <Hero />
      <Statement />
      <FeaturedWork series={series} />
      <SeriesCounter />
      <PrintTeaser />
    </main>
  )
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors (components don't exist yet — TS will error on imports until they're built; that is fine, proceed).

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): wire page as server component with 5 sections"
```

---

## Task 2: Rewrite `Hero.tsx` — adaptive panel, 70/30 split, filter, scroll

**Files:**
- Modify: `components/home/Hero.tsx`

**Step 1: Full rewrite**

```tsx
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

type Filter   = 'ALL' | 'B&W' | 'COLOR'
type PhotoMode = 'dark' | 'light'

// ─── Design tokens for each panel mode ────────────────────────────────────────
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

const TOTAL = PHOTOS.length

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
  const containerRef  = useRef<HTMLDivElement>(null)
  const indicatorRef  = useRef<HTMLDivElement>(null)
  const buttonRefs    = useRef<(HTMLButtonElement | null)[]>([])
  const colors        = PANEL_COLORS[mode]

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { positionIndicator(filter, false) }, [])

  // Sync indicator color when mode changes (panel bg switches)
  useEffect(() => {
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, { backgroundColor: colors.text, duration: 0.4 })
    }
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
        className="absolute bottom-0 origin-left"
        style={{ height: '1px', left: 0, width: 0, backgroundColor: colors.text }}
      />
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const { lang, langRef } = useLang()
  const [filter,    setFilter]    = useState<Filter>('ALL')
  const [isMobile,  setIsMobile]  = useState(false)
  const [activeMode, setActiveMode] = useState<PhotoMode>('dark')

  const filteredPhotos    = filter === 'ALL' ? PHOTOS
    : PHOTOS.filter(p => filter === 'B&W' ? p.mode === 'dark' : p.mode === 'light')
  const filteredPhotosRef = useRef(filteredPhotos)
  useEffect(() => { filteredPhotosRef.current = filteredPhotos }, [filteredPhotos])

  // ── Panel refs ──
  const panelRef     = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLParagraphElement>(null)
  const descRef      = useRef<HTMLParagraphElement>(null)
  const metaRef      = useRef<HTMLParagraphElement>(null)
  const locRef       = useRef<HTMLParagraphElement>(null)
  const counterRef   = useRef<HTMLSpanElement>(null)
  const totalRef     = useRef<HTMLSpanElement>(null)
  const viewLinkRef  = useRef<HTMLAnchorElement>(null)
  // All text-colored elements (excluding muted — #8A8A8A works on both bg)
  const primaryTextRefs = useRef<(HTMLElement | null)[]>([])

  // ── Photo refs ──
  const photoRefs     = useRef<HTMLDivElement[]>([])
  const activeIdxRef  = useRef(0)

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Update panel on active photo change ──
  const updatePanel = useCallback((i: number) => {
    const photos = filteredPhotosRef.current
    const photo  = photos[i]
    if (!photo) return
    activeIdxRef.current = i

    const colors = PANEL_COLORS[photo.mode]

    // Panel background
    if (panelRef.current) {
      gsap.to(panelRef.current, { backgroundColor: colors.bg, duration: 0.4, ease: 'power2.inOut' })
    }

    // Cross-fade primary text: fade out → update content → fade in
    const textEls = primaryTextRefs.current.filter(Boolean) as HTMLElement[]
    gsap.to(textEls, {
      opacity: 0, y: -5, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        // Update content
        if (titleRef.current)   titleRef.current.textContent   = photo.title
        if (descRef.current)    descRef.current.textContent    = photo[langRef.current as 'en' | 'ru']
        if (metaRef.current)    metaRef.current.textContent    = photo.series ? `${photo.series} · ${photo.year}` : photo.year
        if (locRef.current)     locRef.current.textContent     = photo.location
        if (counterRef.current) counterRef.current.textContent = String(i + 1).padStart(2, '0')
        if (viewLinkRef.current) (viewLinkRef.current as HTMLAnchorElement).href = `/work/${photo.slug}`

        // Instant color change while invisible, then fade in
        gsap.set(textEls, { color: colors.text })
        gsap.fromTo(textEls,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', stagger: 0.035 }
        )
      },
    })

    // Sync mode state for FilterBar color adaptation
    setActiveMode(photo.mode)
  }, [langRef])

  // Re-run updatePanel when lang changes (so description re-renders)
  useEffect(() => {
    updatePanel(activeIdxRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // ── ScrollTriggers ──
  useEffect(() => {
    photoRefs.current.length = filteredPhotos.length

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
        // Panel update
        const t1 = ScrollTrigger.create({
          trigger: el,
          start: 'top 50%', end: 'bottom 50%',
          onEnter:     () => updatePanel(i),
          onEnterBack: () => updatePanel(i),
        })
        triggers.push(t1)

        // Snap
        const t2 = ScrollTrigger.create({
          trigger: el,
          start: 'top 38%',
          onEnter:     () => snapTo(el),
          onEnterBack: () => snapTo(el),
        })
        triggers.push(t2)
      }

      // Ken Burns subtle settle on entrance
      const tKB = gsap.fromTo(el,
        { scale: 1.025 },
        { scale: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 70%' } }
      )
      if (tKB.scrollTrigger) triggers.push(tKB.scrollTrigger)

      // Mobile: description fade-in
      if (isMobile) {
        const mDescEl = el.nextElementSibling as HTMLElement | null
        if (mDescEl) {
          gsap.fromTo(mDescEl,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 60%' } }
          )
        }
      }
    })

    // Initialize panel to first photo on mount / filter change
    updatePanel(0)

    return () => { triggers.forEach(t => t.kill()) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPhotos, isMobile])

  // ─── Desktop layout ──────────────────────────────────────────────────────────
  if (!isMobile) {
    const colors = PANEL_COLORS[activeMode]
    return (
      <div className="flex" style={{ minHeight: `${filteredPhotos.length * 100}svh` }}>

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
              position: 'sticky',
              top: 'var(--nav-h)',
              height: 'calc(100svh - var(--nav-h))',
              backgroundColor: PANEL_COLORS[filteredPhotos[0]?.mode ?? 'dark'].bg,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* TOP: artist + rule + filter */}
            <div className="px-8 pt-10">
              <p
                className="font-sans text-[9px] tracking-extreme"
                style={{ color: colors.muted }}
              >
                АЛИСА ВОЛОСНИКОВА
              </p>
              <div style={{ height: '1px', background: colors.rule, margin: '12px 0 16px' }} />
              <FilterBar
                filter={filter}
                onChange={f => { setFilter(f) }}
                mode={activeMode}
              />
              <div style={{ height: '1px', background: colors.rule, marginTop: '16px' }} />
            </div>

            {/* MIDDLE: series meta + title + description + location */}
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
                {filteredPhotos[0]?.en ?? ''}
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
                  ref={totalRef}
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
                href={`/work/${filteredPhotos[0]?.slug ?? ''}`}
                ref={viewLinkRef as React.RefObject<HTMLAnchorElement>}
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

  // ─── Mobile layout ──────────────────────────────────────────────────────────
  return (
    <div>
      {filteredPhotos.map((photo, i) => (
        <div key={photo.slug}>
          {/* Photo */}
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
          {/* Caption */}
          <div className="px-6 pt-5 pb-10">
            <p
              className="font-serif italic"
              style={{
                fontSize:   'clamp(1.6rem, 5vw, 2.8rem)',
                fontWeight: 300,
                lineHeight: 1.05,
                color:      'var(--color-text-dark)',
              }}
            >
              {photo.title}
            </p>
            <p
              className="font-serif italic mt-2"
              style={{ fontSize: '13px', lineHeight: 1.8, opacity: 0.6, color: 'var(--color-text-dark)' }}
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
```

**Step 2: Check that `TransitionLink` accepts `ref`**

Open `components/ui/PageTransition.tsx` and verify `TransitionLink` is a `forwardRef` component. If it is not, remove the `ref={viewLinkRef}` prop from the `TransitionLink` in Hero and instead look up the link via a wrapping `<div ref>`:

```tsx
// Replace the TransitionLink VIEW SERIES block with:
<div ref={el => { viewLinkRef.current = el?.querySelector('a') ?? null }}>
  <TransitionLink
    href={`/work/${filteredPhotos[0]?.slug ?? ''}`}
    data-cursor="link"
    className="font-sans text-[9px] tracking-extreme transition-opacity duration-300 hover:opacity-40"
    style={{ color: colors.text }}
  >
    VIEW SERIES →
  </TransitionLink>
</div>
```

**Step 3: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors.

**Step 4: Commit**

```bash
git add components/home/Hero.tsx
git commit -m "feat(Hero): adaptive panel, 70/30 editorial split, remove GRID/LIST toggle"
```

---

## Task 3: Remove GRID/LIST toggle from `Nav.tsx`

**Files:**
- Modify: `components/ui/Nav.tsx`

**Step 1: Remove the toggle block**

In `Nav.tsx`, delete lines 94–109 (the `{isHome && ...}` block that renders GRID/LIST buttons):

```tsx
// DELETE these lines entirely:
{/* GRID / LIST toggle — home only, centered */}
{isHome && (
  <div className="hidden md:flex gap-5 absolute left-1/2 -translate-x-1/2">
    {(['GRID', 'LIST'] as const).map(v => (
      <button
        key={v}
        onClick={() => setViewMode(v)}
        data-cursor="link"
        className="font-sans text-[9px] tracking-[0.2em] text-ink transition-opacity duration-200"
        style={{ opacity: viewMode === v ? 1 : 0.3 }}
      >
        {v}
      </button>
    ))}
  </div>
)}
```

Also remove these now-unused lines at the top of the component:
- `import { useViewMode } from '@/contexts/ViewModeContext'` — remove this import
- `const { viewMode, setViewMode } = useViewMode()` — remove this line
- `const isHome = pathname === '/'` — remove this line (no longer needed)

**Step 2: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors.

**Step 3: Commit**

```bash
git add components/ui/Nav.tsx
git commit -m "feat(Nav): remove GRID/LIST toggle — home uses single editorial layout"
```

---

## Task 4: Rewrite `Statement.tsx` — word-stagger manifesto

**Files:**
- Modify: `components/home/Statement.tsx`

**Step 1: Full rewrite**

```tsx
// components/home/Statement.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QUOTE       = 'She does not capture moments. She selects them.'
const ATTRIBUTION = 'MOSCOW · EST. 2019'

export function Statement() {
  const sectionRef     = useRef<HTMLElement>(null)
  const wordsRef       = useRef<HTMLSpanElement[]>([])
  const attributionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section     = sectionRef.current
    const attribution = attributionRef.current
    if (!section || !attribution) return

    const words = wordsRef.current.filter(Boolean)
    if (words.length === 0) return

    // Set initial state (invisible before scroll trigger)
    gsap.set(words, { y: '115%', opacity: 0 })
    gsap.set(attribution, { opacity: 0, y: 8 })

    const totalWordDuration = words.length * 0.055 + 0.8

    ScrollTrigger.create({
      trigger: section,
      start:   'top 70%',
      once:    true,
      onEnter: () => {
        gsap.to(words, {
          y:        '0%',
          opacity:  1,
          duration: 0.8,
          stagger:  0.055,
          ease:     'power3.out',
        })
        gsap.to(attribution, {
          opacity:  1,
          y:        0,
          duration: 0.6,
          ease:     'power2.out',
          delay:    totalWordDuration,
        })
      },
    })

    return () => { ScrollTrigger.getAll().filter(t => t.trigger === section).forEach(t => t.kill()) }
  }, [])

  // Split quote into words — each word in an overflow:hidden wrapper
  const wordElements = QUOTE.split(' ').map((word, i) => (
    <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.28em' }}>
      <span
        ref={el => { if (el) wordsRef.current[i] = el }}
        style={{ display: 'inline-block' }}
      >
        {word}
      </span>
    </span>
  ))

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 py-24 md:py-32"
    >
      {/* Pre-quote attribution */}
      <p className="font-sans text-[9px] tracking-extreme text-muted mb-8">
        АЛИСА ВОЛОСНИКОВА
      </p>

      {/* Quote */}
      <div
        className="font-serif italic text-text-light"
        style={{
          fontSize:      'clamp(3.5rem, 6vw, 8rem)',
          fontWeight:    300,
          lineHeight:    0.92,
          letterSpacing: '-0.03em',
        }}
        aria-label={QUOTE}
      >
        {wordElements}
      </div>

      {/* Rule + attribution */}
      <div ref={attributionRef}>
        <div
          style={{
            width:      '48px',
            height:     '1px',
            background: 'rgba(245,245,245,0.12)',
            marginTop:  '3.5rem',
          }}
        />
        <p className="font-sans text-[9px] tracking-extreme text-muted mt-6">
          {ATTRIBUTION}
        </p>
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors.

**Step 3: Commit**

```bash
git add components/home/Statement.tsx
git commit -m "feat(Statement): word-stagger manifesto with dark bg and attribution"
```

---

## Task 5: Rewrite `FeaturedWork.tsx` — marquee strip + editorial series list

**Files:**
- Modify: `components/home/FeaturedWork.tsx`

**Step 1: Full rewrite**

```tsx
// components/home/FeaturedWork.tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'
import { TransitionLink } from '@/components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

interface SeriesItem {
  _id:        string
  title:      string
  slug:       string
  year?:      string
  mode?:      string
  photoCount?: number
  description?: string
  coverImage: {
    asset: { url: string; metadata: { lqip?: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
}

// ─── Marquee strip (CSS animation — no dependency on about/Marquee) ──────────
function SeriesMarquee({ series }: { series: SeriesItem[] }) {
  if (series.length === 0) return null
  // Duplicate for seamless loop
  const items = [...series, ...series]

  return (
    <div
      className="overflow-hidden select-none"
      style={{ borderTop: '1px solid rgba(10,10,10,0.07)', borderBottom: '1px solid rgba(10,10,10,0.07)', padding: '20px 0' }}
      aria-hidden="true"
    >
      <div
        className="flex"
        style={{ animation: 'marquee-left 40s linear infinite', willChange: 'transform' }}
      >
        {items.map((s, i) => (
          <TransitionLink
            key={`${s._id}-${i}`}
            href={`/work/${s.slug}`}
            className="font-serif italic flex-shrink-0 mx-10 transition-opacity duration-300"
            style={{
              fontSize:   'clamp(3rem, 5vw, 6rem)',
              fontWeight: 300,
              opacity:    0.1,
            }}
            onMouseEnter={e => gsap.to(e.currentTarget, { opacity: 1, duration: 0.3 })}
            onMouseLeave={e => gsap.to(e.currentTarget, { opacity: 0.1, duration: 0.3 })}
          >
            {s.title}
          </TransitionLink>
        ))}
      </div>
    </div>
  )
}

// ─── Series row ───────────────────────────────────────────────────────────────
function SeriesRow({ series, index }: { series: SeriesItem; index: number }) {
  const rowRef  = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const imageUrl = series.coverImage?.asset
    ? urlFor(series.coverImage).width(1200).url()
    : null

  const lqip = series.coverImage?.asset?.metadata?.lqip
  const hotspot = series.coverImage?.hotspot
  const objectPosition = hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center center'

  const meta = [
    series.year,
    series.mode ? series.mode.toUpperCase() : null,
    series.photoCount ? `${series.photoCount} PHOTOS` : null,
  ].filter(Boolean).join(' · ')

  useEffect(() => {
    const img  = imgRef.current
    const text = textRef.current
    if (!img || !text) return

    gsap.set([img, text], { opacity: 0 })
    gsap.set(img,  { x: -20 })
    gsap.set(text, { x: 20 })

    ScrollTrigger.create({
      trigger: imgRef.current,
      start:   'top 80%',
      once:    true,
      onEnter: () => {
        gsap.to(img,  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
        gsap.to(text, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 })
      },
    })

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.trigger === imgRef.current)
        .forEach(t => t.kill())
    }
  }, [])

  if (!imageUrl) return null

  return (
    <div
      ref={rowRef}
      className="flex flex-col md:flex-row py-12 md:py-16"
      style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }}
      onMouseEnter={() => {
        if (imgRef.current) gsap.to(imgRef.current.querySelector('img'), { filter: 'saturate(0.75)', duration: 0.4 })
      }}
      onMouseLeave={() => {
        if (imgRef.current) gsap.to(imgRef.current.querySelector('img'), { filter: 'saturate(1)', duration: 0.4 })
      }}
    >
      {/* Image — 55% */}
      <div
        ref={imgRef}
        className="relative overflow-hidden w-full md:w-[55%] flex-shrink-0"
        style={{ aspectRatio: '16/10' }}
      >
        <Image
          src={imageUrl}
          alt={series.title}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
          style={{ objectPosition }}
          {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
        />
      </div>

      {/* Text panel — 45% */}
      <div
        ref={textRef}
        className="flex flex-col justify-between pt-6 md:pt-0 md:pl-14 md:w-[45%]"
      >
        <div>
          {/* Series number + name */}
          <div className="flex items-start justify-between mb-2">
            <p
              className="font-serif italic text-text-dark"
              style={{
                fontSize:      'clamp(1.8rem, 3vw, 3.5rem)',
                fontWeight:    300,
                letterSpacing: '-0.02em',
                lineHeight:    1.0,
              }}
            >
              {series.title}
            </p>
            <span className="font-sans text-[9px] tracking-extreme text-muted ml-4 mt-1 flex-shrink-0">
              {String(index + 1).padStart(2, '0')} →
            </span>
          </div>

          {/* Meta */}
          {meta && (
            <p className="font-sans text-[9px] tracking-extreme text-muted mt-2">
              {meta}
            </p>
          )}

          {/* Description */}
          {series.description && (
            <p
              className="font-serif italic mt-4"
              style={{
                fontSize:   'clamp(0.9rem, 1.1vw, 1.3rem)',
                lineHeight: 1.7,
                opacity:    0.55,
                color:      'var(--color-text-dark)',
                maxWidth:   '36ch',
              }}
            >
              {series.description}
            </p>
          )}
        </div>

        <TransitionLink
          href={`/work/${series.slug}`}
          data-cursor="link"
          className="font-sans text-[9px] tracking-extreme text-text-dark
                     transition-opacity duration-300 hover:opacity-40 mt-6 md:mt-0 self-start"
        >
          VIEW SERIES →
        </TransitionLink>
      </div>
    </div>
  )
}

// ─── FeaturedWork ─────────────────────────────────────────────────────────────
export function FeaturedWork({ series }: { series: SeriesItem[] }) {
  if (series.length === 0) return null

  return (
    <section className="bg-light">
      {/* Header */}
      <div className="px-6 md:px-16 pt-20 pb-0">
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          SELECTED WORK
        </p>
        <div style={{ height: '1px', background: 'rgba(10,10,10,0.1)', marginTop: '16px' }} />
      </div>

      {/* Marquee strip */}
      <SeriesMarquee series={series} />

      {/* Editorial series list */}
      <div className="px-6 md:px-16 pb-24">
        {series.map((s, i) => (
          <SeriesRow key={s._id} series={s} index={i} />
        ))}
      </div>
    </section>
  )
}
```

**Step 2: Add CSS animation keyframe for marquee**

Open `app/globals.css` and add before the closing `}` or after the last rule:

```css
@keyframes marquee-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

**Step 3: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors.

**Step 4: Commit**

```bash
git add components/home/FeaturedWork.tsx app/globals.css
git commit -m "feat(FeaturedWork): marquee strip + editorial series list with hover desaturation"
```

---

## Task 6: Rewrite `SeriesCounter.tsx` — stats bar with count-up

**Files:**
- Modify: `components/home/SeriesCounter.tsx`

**Step 1: Full rewrite**

```tsx
// components/home/SeriesCounter.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 12, label: 'SERIES'       },
  { value: 6,  label: 'YEARS ACTIVE' },
  { value: 3,  label: 'CONTINENTS'   },
]

export function SeriesCounter() {
  const sectionRef = useRef<HTMLElement>(null)
  const numRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const labelRefs  = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Set initial state
    numRefs.current.forEach(el => { if (el) el.textContent = '00' })
    gsap.set(labelRefs.current.filter(Boolean), { opacity: 0 })

    ScrollTrigger.create({
      trigger: section,
      start:   'top 75%',
      once:    true,
      onEnter: () => {
        STATS.forEach(({ value }, i) => {
          const el = numRefs.current[i]
          if (!el) return
          const obj = { val: 0 }
          gsap.to(obj, {
            val:      value,
            duration: 1.6,
            ease:     'power1.out',
            onUpdate: () => {
              el.textContent = String(Math.round(obj.val)).padStart(2, '0')
            },
          })
        })
        gsap.to(labelRefs.current.filter(Boolean), {
          opacity:  1,
          duration: 0.6,
          stagger:  0.1,
          delay:    0.3,
        })
      },
    })

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.trigger === section)
        .forEach(t => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 py-20"
      style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
    >
      <div className="flex justify-between items-end">
        {STATS.map(({ value, label }, i) => (
          <div key={label} className="flex items-end gap-8 md:gap-16">
            {/* Stat */}
            <div>
              <span
                ref={el => { numRefs.current[i] = el }}
                className="font-serif italic text-text-light block"
                style={{ fontSize: 'clamp(4rem, 6vw, 7rem)', fontWeight: 300, lineHeight: 1 }}
              >
                {String(value).padStart(2, '0')}
              </span>
              <p
                ref={el => { labelRefs.current[i] = el }}
                className="font-sans text-[9px] tracking-extreme text-muted mt-2"
              >
                {label}
              </p>
            </div>
            {/* Separator — not after last item */}
            {i < STATS.length - 1 && (
              <span
                aria-hidden="true"
                className="font-serif text-text-light self-end mb-2"
                style={{ fontSize: 'clamp(3rem, 4vw, 5rem)', opacity: 0.12 }}
              >
                ·
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: no new errors.

**Step 3: Commit**

```bash
git add components/home/SeriesCounter.tsx
git commit -m "feat(SeriesCounter): full-width stats bar with count-up animation"
```

---

## Task 7: Rewrite `PrintTeaser.tsx` — clip-path heading reveal

**Files:**
- Modify: `components/home/PrintTeaser.tsx`

**Step 1: Full rewrite**

```tsx
// components/home/PrintTeaser.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TransitionLink } from '@/components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

const HEADING_LINES = ['Limited', 'editions,', 'archival quality.']

export function PrintTeaser() {
  const sectionRef  = useRef<HTMLElement>(null)
  const lineRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const bottomRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const bottom  = bottomRef.current
    if (!section || !bottom) return

    const lines = lineRefs.current.filter(Boolean) as HTMLElement[]
    if (lines.length === 0) return

    gsap.set(lines,  { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(bottom, { opacity: 0, y: 8 })

    ScrollTrigger.create({
      trigger: section,
      start:   'top 78%',
      once:    true,
      onEnter: () => {
        gsap.to(lines, {
          clipPath:  'inset(0 0% 0 0)',
          duration:  1.0,
          stagger:   0.15,
          ease:      'power3.inOut',
        })
        gsap.to(bottom, {
          opacity:  1,
          y:        0,
          duration: 0.6,
          ease:     'power2.out',
          delay:    lines.length * 0.15 + 0.3,
        })
      },
    })

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.trigger === section)
        .forEach(t => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 pt-16 pb-32"
      style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
    >
      {/* Label */}
      <p className="font-sans text-[9px] tracking-extreme text-muted mb-10">
        FINE ART PRINTS
      </p>

      {/* Heading — each line clip-path revealed */}
      <div
        className="font-serif italic text-text-light"
        style={{
          fontSize:      'clamp(4rem, 8vw, 11rem)',
          fontWeight:    300,
          lineHeight:    0.88,
          letterSpacing: '-0.03em',
        }}
        aria-label={HEADING_LINES.join(' ')}
      >
        {HEADING_LINES.map((line, i) => (
          <span
            key={i}
            ref={el => { lineRefs.current[i] = el }}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            {line}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{ height: '1px', background: 'rgba(245,245,245,0.08)', marginTop: '5rem' }}
      />

      {/* Bottom row */}
      <div ref={bottomRef} className="flex justify-between items-center mt-8">
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          ARCHIVAL PIGMENT · SIGNED &amp; NUMBERED · PRODUCED TO ORDER
        </p>
        <TransitionLink
          href="/prints"
          data-cursor="link"
          className="font-sans text-[9px] tracking-extreme text-text-light
                     transition-opacity duration-300 hover:opacity-40 ml-8 flex-shrink-0"
        >
          VIEW PRINTS →
        </TransitionLink>
      </div>
    </section>
  )
}
```

**Step 2: Verify TypeScript — full pass**

```bash
cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit 2>&1 | grep -v Marquee
```

Expected: zero errors (excluding pre-existing Marquee.tsx error).

**Step 3: Commit**

```bash
git add components/home/PrintTeaser.tsx
git commit -m "feat(PrintTeaser): clip-path heading reveal on dark bg, no image"
```

---

## Visual verification checklist

After all tasks are complete, open `http://localhost:3000` and verify:

1. **Hero** — 70/30 split, sticky panel changes background color as you scroll between dark/light photos. Filter buttons (ALL · B&W · COLOR) work and slide indicator moves. Counter watermark shows current photo number. Mobile: stacked photos with captions below.
2. **Statement** — Words slide up from below on scroll entry. Dark background with white text.
3. **Featured Work** — Marquee strip scrolls automatically, hovers bring names to full opacity. Series rows enter from sides. Image desaturates on row hover.
4. **Stats** — Numbers count up from 00 when section enters viewport.
5. **Prints Teaser** — Heading lines wipe in left-to-right. Bottom row fades in after.
6. **Tonal sequence** — Page alternates: light (hero) → dark (statement) → light (work) → dark (stats + prints).
