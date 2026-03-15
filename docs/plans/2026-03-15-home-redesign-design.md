# Home Page Redesign — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the home page from a single-component photo grid into a complete scrollable narrative — a cinematic journey that opens with photographs, pivots to language, showcases the body of work, quantifies the practice, and closes with the editions offer.

**Architecture:** Five distinct sections with deliberate tonal cuts (light → dark → light → dark). Hero is a 70/30 split with adaptive panel. Scroll-below sections wire in the four existing but unused home components. GSAP ScrollTrigger drives all entrance animations. No GRID/LIST toggle — one definitive editorial layout.

**Tech Stack:** Next.js App Router (server component for Sanity data), GSAP (ScrollTrigger, quickTo), Lenis smooth scroll, Tailwind v4, Cormorant Garamond serif, DM Sans sans, existing design tokens.

---

## Tonal Sequence (page rhythm)

```
Section 1 — Hero          bg-light (adaptive panel per photo)
Section 2 — Statement     bg-ink   ← cut to dark
Section 3 — Featured Work bg-light ← cut to light
Section 4A — Stats        bg-ink   ← cut to dark
Section 4B — Prints       bg-ink   (continues dark, closes page)
```

---

## Section 1 — Hero: Cinematic Scroll Sequence

**Files:**
- Rewrite: `components/home/Hero.tsx`
- No new files

### Layout (desktop, ≥ md)

Two-column split, full viewport height per photo:

```
┌─────────────────────────────────┬──────────────────────┐
│                                 │  АЛИСА ВОЛОСНИКОВА   │
│                                 │  ─────────────────── │
│                                 │                      │
│   LEFT COLUMN  70%              │  ALL · B&W · COLOR   │  ← filter
│   stacked photos                │  ─────────────────── │
│   each: 100svh                  │                      │
│   object-cover                  │  Series · Year       │
│   no gap                        │                      │
│                                 │  Photo Title         │  ← large serif italic
│                                 │                      │
│                                 │  Poetic description  │  ← smaller serif italic
│                                 │                      │
│                                 │  Location · Date     │
│                                 │                      │
│                                 │  01                  │  ← watermark counter
│                                 │     / 09             │
│                                 │                      │
│                                 │  VIEW SERIES →       │
└─────────────────────────────────┴──────────────────────┘
```

### Right panel — adaptive

Panel transitions from `bg-ink / text-text-light` to `bg-light / text-text-dark` based on `photo.mode`:
- `mode: 'dark'` → `bg-ink`, all text `text-text-light`, rule `rgba(245,245,245,0.12)`
- `mode: 'light'` → `bg-light`, all text `text-text-dark`, rule `rgba(10,10,10,0.1)`

Transition: `gsap.to(panelRef.current, { backgroundColor, duration: 0.4, ease: 'power2.inOut' })`. Text colors also GSAP-animated simultaneously.

### Panel layout (flex column, justify-between, full height, sticky top: var(--nav-h))

```
TOP BLOCK  (px-8 md:px-10, pt-10):
  Artist name          font-sans text-[9px] tracking-extreme, color-adaptive/60
  1px rule             color-adaptive/12, mt-3 mb-5
  Filter row           ALL · B&W · COLOR  — same sliding GSAP indicator as PrintGrid
                       font-sans text-[9px] tracking-extreme
                       active: opacity 1 / inactive: opacity 0.3
  1px rule             color-adaptive/12, mt-4

MIDDLE BLOCK (px-8 md:px-10, flex-1, flex flex-col justify-center, gap-3):
  Series · Year        font-sans text-[9px] tracking-extreme, color-adaptive/50
  Photo title          font-serif italic, clamp(2rem, 2.8vw, 4rem), weight 300
                       letterSpacing -0.02em, lineHeight 1.0
                       GSAP cross-fade: opacity 0→1, y 8→0, duration 0.5, power2.out
  Poetic description   font-serif italic, clamp(0.85rem, 1.05vw, 1.2rem)
                       lineHeight 1.85, color-adaptive/55, maxWidth 26ch
                       GSAP cross-fade: delay 0.1s after title
  Location · Date      font-sans text-[9px] tracking-extreme, color-adaptive/40, mt-2

BOTTOM BLOCK (px-8 md:px-10, pb-10):
  Watermark counter    font-serif italic, clamp(4.5rem, 6.5vw, 8rem)
                       weight 300, color-adaptive/07 (near-invisible)
                       format: "01\n/ 09" — stacked, lineHeight 0.85
  VIEW SERIES →        font-sans text-[9px] tracking-extreme
                       TransitionLink href={`/work/${photo.slug}`}
                       hover: opacity 0.4, duration 0.3
                       mt-6
```

### ScrollTrigger behavior

Per photo:
```ts
// Panel update trigger
ScrollTrigger.create({
  trigger: photoEl,
  start: 'top 50%', end: 'bottom 50%',
  onEnter:     () => updatePanel(i),
  onEnterBack: () => updatePanel(i),
})

// Snap trigger
ScrollTrigger.create({
  trigger: photoEl,
  start: 'top 38%',
  onEnter:     () => snapTo(photoEl),
  onEnterBack: () => snapTo(photoEl),
})
```

`snapTo` debounced to 1000ms (prevent recursive Lenis scroll events):
```ts
getLenis()?.scrollTo(el, { offset: -48, duration: 1.1 })
```

Photo entrance (subtle Ken Burns settle — NOT parallax):
```ts
gsap.fromTo(photoEl,
  { opacity: 0.75, scale: 1.025 },
  { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: photoEl, start: 'top 65%' } }
)
```

### Filter

State: `'ALL' | 'B&W' | 'COLOR'`. Filters `PHOTOS` array same as current implementation. On filter change: kill all ScrollTriggers, re-trim `photoRefs`, rebuild triggers on next render.

Filter indicator: same GSAP `getBoundingClientRect()` sliding underline from PrintGrid. Color-adaptive: `bg-ink` on light panel, `bg-light` on dark panel.

### Mobile (< md)

Single column. Each photo: `82svh`, `object-cover`. Below each photo:
```
Photo title     font-serif italic, clamp(1.6rem, 5vw, 2.8rem), weight 300, mt-5
Poetic line     font-serif italic, 13px, lineHeight 1.8, opacity 0.6, mt-2
Location        font-sans text-[9px] tracking-extreme, text-muted, mt-3
```
GSAP entrance per photo: `opacity: 0→1, y: 12→0, duration: 0.5, ease: power2.out`, trigger `top 60%`.

### Removed

- `viewMode` / GRID toggle — removed entirely from Hero. GRID view is a future `/work` page concern.
- `useViewMode` context — no longer imported in Hero.
- `mCounterRef`, `counterRef` — replaced by watermark counter in panel.

---

## Section 2 — Statement: Typographic Manifesto

**File:** Rewrite `components/home/Statement.tsx`

**Background:** `bg-ink`

```
px-6 md:px-16
py-24 md:py-32

АЛИСА ВОЛОСНИКОВА         ← font-sans text-[9px] tracking-extreme text-muted mb-8
(above the quote)

She does not              ← font-serif italic
capture moments.             clamp(3.5rem, 6vw, 8rem)
She selects them.            weight 300, lineHeight 0.92
                             letterSpacing -0.03em
                             text-text-light
                             maxWidth: none

────────────────          ← 1px rule, white/12, width 48px, mt-14

MOSCOW · EST. 2019        ← font-sans text-[9px] tracking-extreme text-muted mt-6
```

### Animation

Split quote into words. Each word wrapped in `overflow: hidden` container. Animate each word:
```ts
gsap.fromTo(words,
  { y: '115%', opacity: 0 },
  { y: '0%',   opacity: 1,
    duration: 0.8, stagger: 0.055, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 70%', once: true }
  }
)
```

Attribution line enters after last word:
```ts
gsap.fromTo(attribution,
  { opacity: 0, y: 8 },
  { opacity: 1, y: 0,
    duration: 0.6, ease: 'power2.out',
    delay: words.length * 0.055 + 0.25,  // after all words settle
    scrollTrigger: { trigger: section, start: 'top 70%', once: true }
  }
)
```

---

## Section 3 — Featured Work: Series Index

**File:** Rewrite `components/home/FeaturedWork.tsx`

**Background:** `bg-light`

**Props:** `series: SeriesItem[]` — array from `ALL_SERIES_QUERY`

### Header

```
px-6 md:px-16, pt-20 pb-0

SELECTED WORK             ← font-sans text-[9px] tracking-extreme text-muted
─────────────────────     ← 1px solid rgba(10,10,10,0.1), mt-4
```

### Zone A — Display Marquee

Immediately below the header rule. Uses existing `Marquee` component:

```tsx
<Marquee speed={40} pauseOnHover>
  {series.map(s => (
    <TransitionLink key={s._id} href={`/work/${s.slug}`}>
      <span
        className="font-serif italic mx-12 select-none"
        style={{
          fontSize: 'clamp(3rem, 5vw, 6rem)',
          fontWeight: 300,
          opacity: 0.1,
          transition: 'opacity 0.3s ease',
        }}
        onMouseEnter={e => gsap.to(e.currentTarget, { opacity: 1, duration: 0.3 })}
        onMouseLeave={e => gsap.to(e.currentTarget, { opacity: 0.1, duration: 0.3 })}
      >
        {s.title}
      </span>
    </TransitionLink>
  ))}
</Marquee>
```

Height: `py-8`. Border top + bottom: `1px solid rgba(10,10,10,0.07)`.

### Zone B — Editorial Series List

```
px-6 md:px-16, pb-24

Each row (data-series-row):
┌──────────────────────────────────┬──────────────────────────────────────┐
│  IMAGE  55%                      │  Series Name                   01 →  │
│  aspect-ratio: 16/10             │  YEAR · MODE · N PHOTOS              │
│  object-cover                    │                                      │
│  on-row-hover:                   │  Short description (1–2 lines)       │
│    filter: saturate(0.75)        │  font-serif italic                   │
│    0.4s ease                     │  clamp(0.9rem, 1.1vw, 1.3rem)       │
│                                  │  lineHeight 1.7, opacity 0.55        │
│                                  │                                      │
│                                  │  VIEW SERIES →                       │
│                                  │  font-sans text-[9px] tracking-extreme│
│                                  │  mt-6, hover opacity 0.4             │
└──────────────────────────────────┴──────────────────────────────────────┘
border-bottom: 1px solid rgba(10,10,10,0.08)
py-12 md:py-16
```

Series name: `font-serif italic, clamp(1.8rem, 3vw, 3.5rem), weight 300, letterSpacing -0.02em`
Series number (right of name): `font-sans text-[9px] tracking-extreme text-muted`
Meta row: `font-sans text-[9px] tracking-extreme text-muted, mt-2`

Text panel: `pl-10 md:pl-14, flex flex-col justify-between`

### Entrance animation per row

```ts
gsap.fromTo(imageCol,
  { opacity: 0, x: -20 },
  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: row, start: 'top 80%', once: true } }
)
gsap.fromTo(textCol,
  { opacity: 0, x: 20 },
  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.1,
    scrollTrigger: { trigger: row, start: 'top 80%', once: true } }
)
```

Stagger between rows: each row's ScrollTrigger fires independently as it enters viewport — natural stagger from scroll speed.

### Mobile

Stack vertical: image full-width (aspect 16/10), text below with `pt-6`.

---

## Section 4A — Stats Bar

**File:** Rewrite `components/home/SeriesCounter.tsx`

**Background:** `bg-ink`

```
px-6 md:px-16, py-20
border-top: 1px solid rgba(245,245,245,0.08)

┌──────────────┬────┬──────────────┬────┬────────────────┐
│  12          │ ·  │  6           │ ·  │  3             │
│  SERIES      │    │  YEARS ACTIVE│    │  CONTINENTS    │
└──────────────┴────┴──────────────┴────┴────────────────┘
flex, justify-between, items-end
```

Number: `font-serif italic, clamp(4rem, 6vw, 7rem), weight 300, text-text-light`
Label: `font-sans text-[9px] tracking-extreme text-muted, mt-2, block`
Separator `·`: `font-serif, clamp(3rem, 4vw, 5rem), rgba(245,245,245,0.12), self-end mb-2`

### Animation

```ts
ScrollTrigger.create({
  trigger: section, start: 'top 75%', once: true,
  onEnter: () => {
    stats.forEach(({ el, target }) => {
      gsap.to(el, { innerText: target, duration: 1.6, ease: 'power1.out',
        snap: { innerText: 1 }, // integer snap
        onUpdate: () => { el.textContent = String(Math.round(Number(el.textContent))).padStart(2, '0') }
      })
    })
    gsap.fromTo(labels, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.3, stagger: 0.1 })
  }
})
```

---

## Section 4B — Prints Teaser

**File:** Rewrite `components/home/PrintTeaser.tsx`

**Background:** `bg-ink` (continues from 4A — no tonal break)

```
px-6 md:px-16, pt-16 pb-32
border-top: 1px solid rgba(245,245,245,0.08)

FINE ART PRINTS           ← font-sans text-[9px] tracking-extreme text-muted, mb-10

Limited                   ← font-serif italic
editions,                    clamp(4rem, 8vw, 11rem), weight 300
archival quality.            lineHeight 0.88, letterSpacing -0.03em
                             text-text-light

─────────────────────     ← 1px rule, white/08, mt-20

ARCHIVAL PIGMENT ·        [VIEW PRINTS →]
SIGNED & NUMBERED ·          font-sans text-[9px] tracking-extreme
PRODUCED TO ORDER            text-text-light, hover opacity 0.4
font-sans text-[9px]         TransitionLink href="/prints"
text-muted tracking-extreme
```

Bottom row: `flex justify-between items-center, mt-8`

### Animation — clip-path line reveal

Each line of the heading enters with a clip-path wipe:
```ts
gsap.fromTo(lines,
  { clipPath: 'inset(0 100% 0 0)' },
  { clipPath: 'inset(0 0% 0 0)',
    duration: 1.0, stagger: 0.15, ease: 'power3.inOut',
    scrollTrigger: { trigger: section, start: 'top 78%', once: true }
  }
)
```

Bottom row fades in after lines complete:
```ts
gsap.fromTo(bottomRow,
  { opacity: 0, y: 8 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
    delay: lines.length * 0.15 + 0.3,
    scrollTrigger: { trigger: section, start: 'top 78%', once: true }
  }
)
```

---

## Page Assembly — `app/page.tsx`

Becomes a server component fetching Sanity data:

```tsx
import { client } from '@/lib/sanity/client'
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

---

## Palette / Typography Reference

All values from existing design tokens:
- `bg-ink` = `#0A0A0A` / `bg-light` = `#F5F5F5`
- `text-text-dark` = `#0A0A0A` / `text-text-light` = `#F5F5F5`
- `text-muted` = `#8A8A8A`
- `--color-ink` for GSAP backgroundColor on dark panels
- `--color-light` for GSAP backgroundColor on light panels
- `font-serif` = Cormorant Garamond
- `font-sans` = DM Sans
- `tracking-extreme` = `0.22em`
- Meta labels always: `font-sans text-[9px] tracking-extreme text-muted uppercase`
