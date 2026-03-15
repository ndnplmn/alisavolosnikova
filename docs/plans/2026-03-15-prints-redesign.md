# Prints Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Prints page as a luxury edition experience — each print is a collectible object, scarcity is the primary emotional driver, Awwwards-winning level.

**Architecture:** Vertical list of asymmetric 65/35 PrintCards separated by rules. New `EditionBar` component communicates scarcity visually with an animated fill. GSAP ScrollTrigger drives all entrance animations. Sibling dimming on hover replaces scale+overlay. Filter bar uses a sliding GSAP indicator.

**Tech Stack:** Next.js App Router, GSAP (ScrollTrigger), Tailwind v4, Cormorant Garamond (font-serif), DM Sans (font-sans), `urlFor`/`getBlurDataURL` from `@/lib/sanity/image`, `TransitionLink` from `@/components/ui/PageTransition`.

---

## Context: Key files

- `app/prints/page.tsx` — server component, fetches prints, renders page header + `<PrintGrid>`
- `components/prints/PrintGrid.tsx` — client component with filter bar, grid, PrintCard, closing section
- `lib/sanity/image.ts` — exports `urlFor(source)` and `getBlurDataURL(lqip?)`
- `components/ui/PageTransition.tsx` — exports `TransitionLink`
- Design tokens in `app/globals.css`:  `--color-ink`, `--color-teal`, `--color-muted`, `--color-text-dark`
- Tailwind classes: `font-serif`, `font-sans`, `text-muted`, `bg-ink`, `tracking-extreme` (0.22em)

---

## Task 1: Create EditionBar component

**Files:**
- Create: `components/prints/EditionBar.tsx`

### Step 1: Create the file

```tsx
// components/prints/EditionBar.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface EditionBarProps {
  editionSize: number
  editionsSold: number
  /** Stagger delay offset so bars don't all animate simultaneously */
  animDelay?: number
}

export function EditionBar({ editionSize, editionsSold, animDelay = 0 }: EditionBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fillRef    = useRef<HTMLDivElement>(null)

  const sold       = Math.min(editionsSold, editionSize)
  const editionsLeft = editionSize - sold
  const isSoldOut  = editionsLeft === 0
  const ratio      = sold / editionSize          // 0–1

  useEffect(() => {
    const fill    = fillRef.current
    const wrapper = wrapperRef.current
    if (!fill || !wrapper) return

    const anim = gsap.fromTo(
      fill,
      { scaleX: 0 },
      {
        scaleX: ratio,
        duration: 1.2,
        ease: 'power3.out',
        delay: animDelay,
        scrollTrigger: { trigger: wrapper, start: 'top 88%' },
      }
    )

    return () => { anim.scrollTrigger?.kill() }
  }, [ratio, animDelay])

  const status = (() => {
    if (isSoldOut)      return { text: 'SOLD OUT',             color: 'var(--color-muted)' }
    if (editionsLeft === 1) return { text: 'LAST EDITION',     color: 'var(--color-teal)' }
    if (editionsLeft <= 3)  return { text: `ONLY ${editionsLeft} LEFT`, color: 'var(--color-teal)' }
    return                        { text: `${editionsLeft} REMAINING`, color: 'var(--color-muted)' }
  })()

  return (
    <div ref={wrapperRef}>
      {/* Track */}
      <div className="relative w-full overflow-hidden" style={{ height: '1px', background: 'rgba(10,10,10,0.1)' }}>
        <div
          ref={fillRef}
          className="absolute inset-0 bg-ink origin-left"
          style={{
            transform: 'scaleX(0)',
            opacity: isSoldOut ? 0.25 : 1,
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between items-baseline mt-2">
        <span
          className="font-sans text-[9px] tracking-extreme"
          style={{ color: status.color }}
        >
          {status.text}
        </span>
        <span className="font-sans text-[9px] tracking-extreme text-muted">
          {sold} / {editionSize}
        </span>
      </div>
    </div>
  )
}
```

### Step 2: Verify TypeScript compiles

Run: `cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit`
Expected: no errors related to `EditionBar.tsx`

### Step 3: Commit

```bash
git add components/prints/EditionBar.tsx
git commit -m "feat: add EditionBar component with GSAP scroll-triggered fill animation"
```

---

## Task 2: Rewrite page header in `app/prints/page.tsx`

**Files:**
- Modify: `app/prints/page.tsx`

The current header uses `text-2xl` — weak for the display language of this site.
Replace the entire `return` block. Keep PLACEHOLDER_PRINTS and the Sanity fetch unchanged.

### Step 1: Rewrite the file

```tsx
// app/prints/page.tsx
import { client }          from '@/lib/sanity/client'
import { ALL_PRINTS_QUERY } from '@/lib/sanity/queries'
import { PrintGrid }       from '@/components/prints/PrintGrid'
export const revalidate = 3600

const PLACEHOLDER_PRINTS = [
  {
    _id: 'print-1',
    editionSize: 10,
    editionsSold: 3,
    dimensions: '60 × 80 cm',
    paper: 'Hahnemühle Photo Rag',
    colorMode: 'bw',
    format: 'large',
    photo: {
      title: 'Silence No. 1',
      altText: 'Misty mountain landscape in black and white',
      image: { asset: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-2',
    editionSize: 15,
    editionsSold: 15,
    dimensions: '40 × 50 cm',
    paper: 'Baryta Photographique',
    colorMode: 'bw',
    format: 'small',
    photo: {
      title: 'Urban Ghost III',
      altText: 'Blurred figure in a city street',
      image: { asset: { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-3',
    editionSize: 8,
    editionsSold: 2,
    dimensions: '50 × 70 cm',
    paper: 'Hahnemühle Photo Rag',
    colorMode: 'color',
    format: 'large',
    photo: {
      title: 'Raw Light II',
      altText: 'Forest light study in color',
      image: { asset: { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-4',
    editionSize: 12,
    editionsSold: 4,
    dimensions: '30 × 40 cm',
    paper: 'Hahnemühle German Etching',
    colorMode: 'bw',
    format: 'small',
    photo: {
      title: 'Solitude',
      altText: 'Lone figure on empty street',
      image: { asset: { url: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=900', metadata: { lqip: null } } },
    },
  },
]

export default async function PrintsPage() {
  let prints: any[] = []
  try {
    prints = await client.fetch(ALL_PRINTS_QUERY) ?? []
  } catch {
    // Sanity not configured yet
  }
  if (prints.length === 0) prints = PLACEHOLDER_PRINTS

  // Compute total available editions server-side
  const availableEditions = prints.reduce((sum: number, p: any) => {
    const size = p.editionSize ?? 10
    const sold = Math.min(p.editionsSold ?? 0, size)
    return sum + (size - sold)
  }, 0)

  return (
    <div className="min-h-screen bg-light text-text-dark">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 md:px-16 pt-16 pb-0">
        <p className="font-sans text-[9px] tracking-extreme text-muted mb-10">
          FINE ART PRINTS
        </p>
        <h1
          className="font-serif italic text-text-dark"
          style={{
            fontSize:      'clamp(4rem, 9vw, 12rem)',
            fontWeight:    300,
            lineHeight:    0.88,
            letterSpacing: '-0.03em',
          }}
        >
          Limited<br />Editions.
        </h1>
        <div
          className="flex flex-wrap items-center justify-between gap-4 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(10,10,10,0.1)' }}
        >
          <p className="font-sans text-[9px] tracking-extreme text-muted">
            ARCHIVAL PIGMENT · SIGNED &amp; NUMBERED · PRODUCED TO ORDER
          </p>
          {availableEditions > 0 && (
            <p className="font-sans text-[9px] tracking-extreme text-muted">
              {availableEditions} EDITION{availableEditions !== 1 ? 'S' : ''} AVAILABLE
            </p>
          )}
        </div>
      </div>

      <PrintGrid prints={prints} />
    </div>
  )
}
```

### Step 2: Verify TypeScript compiles

Run: `cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit`
Expected: no errors

### Step 3: Visual check

Run: `npm run dev`
Open `http://localhost:3000/prints`
Expected: large italic "Limited Editions." headline, meta row with edition counter

### Step 4: Commit

```bash
git add app/prints/page.tsx
git commit -m "feat: prints page — display typography header with available editions counter"
```

---

## Task 3: Rewrite PrintGrid — filter bar with sliding GSAP indicator

**Files:**
- Modify: `components/prints/PrintGrid.tsx` (full rewrite — remove Flip, add FilterBar subcomponent)

This task replaces only the filter bar and the main PrintGrid shell.
The `PrintCard` function is rewritten in Task 4.

### Step 1: Rewrite the file

Replace the entire file content:

```tsx
// components/prints/PrintGrid.tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'
import { TransitionLink }        from '@/components/ui/PageTransition'
import { EditionBar }            from './EditionBar'

gsap.registerPlugin(ScrollTrigger)

const FILTERS = ['ALL', 'B&W', 'COLOR', 'LARGE FORMAT', 'SMALL FORMAT'] as const
type Filter = typeof FILTERS[number]

// ─── FilterBar ───────────────────────────────────────────────────────────────
function FilterBar({
  filter,
  onChange,
}: {
  filter: Filter
  onChange: (f: Filter) => void
}) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const indicatorRef  = useRef<HTMLDivElement>(null)
  const buttonRefs    = useRef<(HTMLButtonElement | null)[]>([])

  // Position indicator under the currently active filter
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
      gsap.to(indicator, {
        x:        bRect.left - cRect.left,
        width:    bRect.width,
        duration: 0.35,
        ease:     'power3.inOut',
      })
    } else {
      gsap.set(indicator, {
        x:     bRect.left - cRect.left,
        width: bRect.width,
      })
    }
  }, [])

  // Set initial position after mount (no animation)
  useEffect(() => {
    positionIndicator(filter, false)
  }, [filter, positionIndicator])

  return (
    <div
      ref={containerRef}
      className="relative flex gap-6 flex-wrap px-6 md:px-16 py-4 bg-light/90 z-30"
      style={{ position: 'sticky', top: 'var(--nav-h)', backdropFilter: 'blur(8px)' }}
    >
      {FILTERS.map((f, i) => (
        <button
          key={f}
          ref={el => { buttonRefs.current[i] = el }}
          onClick={() => {
            onChange(f)
            positionIndicator(f, true)
          }}
          className="font-sans text-[9px] tracking-extreme transition-opacity duration-200"
          style={{ opacity: filter === f ? 1 : 0.3 }}
        >
          {f}
        </button>
      ))}
      {/* Sliding underline indicator */}
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute bottom-0 bg-ink"
        style={{ height: '1px', left: 0, width: 0 }}
      />
    </div>
  )
}

// ─── PrintGrid ────────────────────────────────────────────────────────────────
export function PrintGrid({ prints }: { prints: any[] }) {
  const [filter,  setFilter]  = useState<Filter>('ALL')
  const [hovered, setHovered] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = prints.filter(p => {
    if (filter === 'ALL')          return true
    if (filter === 'B&W')          return p.colorMode === 'bw'
    if (filter === 'COLOR')        return p.colorMode === 'color'
    if (filter === 'LARGE FORMAT') return p.format === 'large'
    if (filter === 'SMALL FORMAT') return p.format === 'small'
    return true
  })

  // Filter change: exit → update state → enter
  const changeFilter = useCallback((f: Filter) => {
    if (f === filter) return
    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-print-card]') ?? []
    )
    if (cards.length === 0) { setFilter(f); return }

    gsap.to(cards, {
      opacity: 0,
      y: -12,
      duration: 0.25,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => {
        setFilter(f)
        requestAnimationFrame(() => {
          const next = Array.from(
            listRef.current?.querySelectorAll<HTMLElement>('[data-print-card]') ?? []
          )
          gsap.fromTo(
            next,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }
          )
        })
      },
    })
  }, [filter])

  return (
    <div>
      <FilterBar filter={filter} onChange={changeFilter} />

      {/* Print list */}
      <div ref={listRef}>
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-sans text-[9px] tracking-extreme text-muted">
              No prints in this category yet.
            </p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p._id}
              style={{ borderBottom: '1px solid rgba(10,10,10,0.1)' }}
            >
              <PrintCard
                print={p}
                index={i}
                hovered={hovered}
                onHover={setHovered}
              />
            </div>
          ))
        )}
      </div>

      {/* Closing section */}
      <ClosingSection />
    </div>
  )
}

// ─── PrintCard ────────────────────────────────────────────────────────────────
function PrintCard({
  print,
  index,
  hovered,
  onHover,
}: {
  print:   any
  index:   number
  hovered: string | null
  onHover: (id: string | null) => void
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const cardRef  = useRef<HTMLDivElement>(null)
  const textRef  = useRef<HTMLDivElement>(null)

  const editionSize  = print.editionSize  ?? 10
  const editionsSold = Math.min(print.editionsSold ?? 0, editionSize)
  const editionsLeft = editionSize - editionsSold
  const isSoldOut    = editionsLeft === 0
  const photoTitle   = print.photo?.title ?? 'Fine Art Print'
  const contactUrl   = `/contact?print=${encodeURIComponent(photoTitle)}`

  const imageSource = print.photo?.image
    ? urlFor(print.photo.image).width(1200).url()
    : null

  // Aspect ratio from Sanity metadata; fallback 4/3
  const dim         = print.photo?.image?.asset?.metadata?.dimensions
  const aspectRatio = dim ? `${dim.width}/${dim.height}` : '4/3'
  const lqip        = print.photo?.image?.asset?.metadata?.lqip

  // Scroll entrance: card slides up, text slides in from right
  useEffect(() => {
    const card = cardRef.current
    const text = textRef.current
    if (!card || !text) return

    const cardAnim = gsap.fromTo(
      card,
      { opacity: 0, y: 40 },
      {
        opacity:  1,
        y:        0,
        duration: 1.0,
        ease:     'power3.out',
        scrollTrigger: { trigger: card, start: 'top 82%' },
      }
    )
    const textAnim = gsap.fromTo(
      text,
      { opacity: 0, x: 16 },
      {
        opacity:  1,
        x:        0,
        duration: 0.9,
        ease:     'power3.out',
        delay:    0.15,
        scrollTrigger: { trigger: card, start: 'top 82%' },
      }
    )

    return () => {
      cardAnim.scrollTrigger?.kill()
      textAnim.scrollTrigger?.kill()
    }
  }, [])

  if (!imageSource) return null

  const isDimmed = hovered !== null && hovered !== print._id

  return (
    // Outer div handles sibling dimming via CSS transition
    <div
      ref={outerRef}
      style={{ opacity: isDimmed ? 0.35 : 1, transition: 'opacity 0.4s ease' }}
      onMouseEnter={() => onHover(print._id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Inner div is the GSAP entrance target */}
      <div
        ref={cardRef}
        data-print-card
        className="flex flex-col md:flex-row py-10 md:py-14 px-6 md:px-16"
        style={{ opacity: 0 }}   // GSAP animates this to 1
      >
        {/* Image column — 65% */}
        <div
          className="relative overflow-hidden w-full md:w-[65%] flex-shrink-0"
          style={{
            aspectRatio,
            opacity: isSoldOut ? 0.45 : 1,
          }}
        >
          <Image
            src={imageSource}
            alt={print.photo?.altText ?? photoTitle}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-cover"
            {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
          />
        </div>

        {/* Text panel — 35% */}
        <div
          ref={textRef}
          className="flex flex-col justify-between pt-8 md:pt-0 md:pl-10 lg:pl-14 md:w-[35%]"
          style={{ opacity: 0 }}   // GSAP animates this to 1
        >
          {/* Top: meta + title + specs */}
          <div>
            <p className="font-sans text-[9px] tracking-extreme text-muted mb-5">
              {print.photo?.series
                ? `${print.photo.series} · ${print.photo?.year ?? ''}`
                : (print.photo?.year ?? 'FINE ART')}
            </p>
            <p
              className="font-serif italic text-text-dark"
              style={{
                fontSize:      'clamp(1.8rem, 3vw, 3.5rem)',
                fontWeight:    300,
                lineHeight:    1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {photoTitle}
            </p>
            <div className="mt-6 flex flex-col gap-1.5">
              {print.dimensions && (
                <p className="font-sans text-[9px] tracking-extreme text-muted">
                  {print.dimensions}
                </p>
              )}
              {print.paper && (
                <p className="font-sans text-[9px] tracking-extreme text-muted">
                  {print.paper}
                </p>
              )}
            </div>
          </div>

          {/* Bottom: EditionBar + CTA */}
          <div className="mt-10 md:mt-0">
            <EditionBar
              editionSize={editionSize}
              editionsSold={editionsSold}
              animDelay={index * 0.08}
            />
            <div className="mt-8">
              {isSoldOut ? (
                <span className="font-sans text-[9px] tracking-extreme text-muted">
                  SOLD OUT
                </span>
              ) : (
                <Link
                  href={contactUrl}
                  data-cursor="link"
                  className="font-sans text-[9px] tracking-extreme text-text-dark
                             transition-opacity duration-300 hover:opacity-45"
                >
                  INQUIRE ABOUT THIS EDITION →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ClosingSection ───────────────────────────────────────────────────────────
function ClosingSection() {
  return (
    <div
      className="px-6 md:px-16 py-24"
      style={{ borderTop: '1px solid rgba(10,10,10,0.1)' }}
    >
      <p
        className="font-serif italic text-text-dark/50"
        style={{
          fontSize:   'clamp(1.4rem, 2.2vw, 2.2rem)',
          lineHeight: 1.7,
          maxWidth:   '42ch',
        }}
      >
        Each print arrives rolled in archival tissue, with a signed
        certificate of authenticity and edition number.
      </p>

      <div className="mt-10 flex flex-col gap-2">
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          PRODUCTION TIME: 2–3 WEEKS
        </p>
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          SHIPS WORLDWIDE · INSURED DELIVERY
        </p>
      </div>

      <div
        className="mt-16 pt-16"
        style={{ borderTop: '1px solid rgba(10,10,10,0.1)' }}
      >
        <TransitionLink
          href="/"
          className="font-serif italic text-text-dark transition-opacity duration-500 hover:opacity-45"
          style={{
            fontSize:      'clamp(2.5rem, 5vw, 6rem)',
            fontWeight:    300,
            lineHeight:    0.95,
            letterSpacing: '-0.025em',
            display:       'inline-block',
          }}
        >
          Back to the work →
        </TransitionLink>
      </div>
    </div>
  )
}
```

### Step 2: Verify TypeScript compiles

Run: `cd /Users/andonipalomino/alisa-volosnikova && npx tsc --noEmit`
Expected: no errors

### Step 3: Visual checks

Run: `npm run dev`, open `http://localhost:3000/prints`

Verify:
- [ ] Filter bar is sticky below nav, has blur backdrop
- [ ] Clicking a filter slides the underline indicator
- [ ] Filter change: cards exit upward, new cards enter from below, staggered
- [ ] Each print shows as two-column (65/35) on desktop, stacked on mobile
- [ ] EditionBar fills on scroll with correct semantic state colors
- [ ] "Urban Ghost III" (sold out) shows image at 45% opacity, "SOLD OUT" text, no inquire link
- [ ] Hover on any print dims all others to 35%
- [ ] Closing section shows italic serif statement + "Back to the work →" display link
- [ ] Scroll entrance: each card rises from y:40 with text sliding from x:16

### Step 4: Commit

```bash
git add components/prints/PrintGrid.tsx
git commit -m "feat: prints page — luxury edition redesign with EditionBar, 65/35 layout, sibling dimming, GSAP filter transitions"
```

---

## Task 4: Fix ContactForm palette bug

**Files:**
- Modify: `components/contact/ContactForm.tsx`

The ContactForm still uses `text-text-light` and `border-text-light/20` — these are white-on-white on the light-background contact page.

### Step 1: Replace all `text-light` references with `text-dark`

In `components/contact/ContactForm.tsx`, replace:
- `border-text-light/20` → `border-text-dark/20`  (appears 3 times: name input, email input, textarea)
- `text-text-light` → `text-text-dark`  (appears 3 times: same inputs)
- `focus:border-text-light` → `focus:border-text-dark`  (appears 3 times)

### Step 2: Verify

Run: `npm run dev`, open `http://localhost:3000/contact`
Expected: form inputs have visible dark border-bottom and dark text on the light background

### Step 3: Commit

```bash
git add components/contact/ContactForm.tsx
git commit -m "fix: contact form palette — text-light → text-dark for light background"
```

---

## Task 5: Fix PageLoader counter color

**Files:**
- Modify: `components/ui/PageLoader.tsx` line ~168

The bottom-right counter in the loader still uses `rgba(232,228,223,0.35)` — the old cream color pre-palette-update.

### Step 1: Edit the color

In `components/ui/PageLoader.tsx`, find:
```tsx
color:              'rgba(232,228,223,0.35)',
```
Replace with:
```tsx
color:              'rgba(245,245,245,0.35)',
```

### Step 2: Verify

Clear `sessionStorage` in browser devtools (`sessionStorage.clear()`), refresh `http://localhost:3000`
Expected: loader counter visible in bottom-right during the loading sequence

### Step 3: Commit

```bash
git add components/ui/PageLoader.tsx
git commit -m "fix: PageLoader counter color — update cream rgba to new Museum White palette"
```

---

## Verification checklist (full page)

After all tasks, verify:

```
http://localhost:3000/prints
```

- [ ] Header: "Limited Editions." at display scale, edition counter in meta row
- [ ] Filter bar: sticky, blur backdrop, sliding indicator animates on click
- [ ] Prints list: vertical, each card separated by a 1px rule
- [ ] PrintCard desktop: 65% image / 35% text, image fills natural aspect ratio
- [ ] PrintCard mobile: stacked, image full-width, text below
- [ ] EditionBar: fills smoothly on scroll, teal for scarce editions, muted for sold out
- [ ] Sold-out card: image at 45% opacity, no inquire link, EditionBar full at low opacity
- [ ] Hover: non-hovered cards fade to 35%
- [ ] Scroll entrance: each card slides in from y:40, text from x:16
- [ ] Closing: italic serif statement + "Back to the work →" display link
- [ ] Contact page: form inputs visible on light background (palette fix)
- [ ] Loader: counter visible in correct cream tone

```bash
npx tsc --noEmit
```
Expected: 0 errors
