# Prints Page Redesign — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Prints page as a luxury edition experience — scarcity as the primary emotional driver, each print treated as a collectible object, Awwwards-winning level design.

**Architecture:** Vertical list of PrintCards (not a grid), each card in an asymmetric 65/35 split layout. A new `EditionBar` component communicates scarcity visually. GSAP ScrollTrigger drives all entrance animations. Sibling dimming on hover replaces the generic scale+overlay.

**Tech Stack:** Next.js App Router, GSAP (ScrollTrigger, quickTo), Tailwind v4, Cormorant Garamond serif, DM Sans sans, Sanity image helpers.

---

## Section 1 — Page Header

**File:** `app/prints/page.tsx`

**Layout:**
```
FINE ART PRINTS                          ← 9px meta label, tracking-extreme, text-muted

Limited                                 ← font-serif italic, clamp(4rem, 9vw, 12rem)
Editions.                               ← weight 300, lineHeight 0.88, letterSpacing -0.03em

─────────────────────────────────────────
ARCHIVAL PIGMENT · SIGNED & NUMBERED · PRODUCED TO ORDER · {N} EDITIONS AVAILABLE
```

`{N} EDITIONS AVAILABLE` is computed server-side: sum of `(editionSize - editionsSold)` across all non-sold-out prints.

---

## Section 2 — Filter Bar

**File:** `components/prints/PrintGrid.tsx`

- Horizontal row of labels: ALL · B&W · COLOR · LARGE FORMAT · SMALL FORMAT
- Active indicator: a `1px` line that slides horizontally under the active filter via GSAP
  - `gsap.to(indicator, { x: targetOffset, duration: 0.35, ease: 'power3.inOut' })`
- Active text: `opacity: 1`; inactive: `opacity: 0.3`, `hover: opacity: 0.65`
- Sticky in desktop: `position: sticky; top: var(--nav-h)` with `backdrop-filter: blur(8px)`
- On filter change: existing cards exit `{ opacity: 0, y: -12 }` staggered, new cards enter `{ opacity: 0, y: 20 } → { opacity: 1, y: 0 }` staggered. No Flip.js.

---

## Section 3 — EditionBar Component

**File:** `components/prints/EditionBar.tsx` (new)

**Props:**
```ts
interface EditionBarProps {
  editionSize: number
  editionsSold: number
  animDelay?: number   // stagger delay for entrance
}
```

**Visual:**
- Container: `w-full h-px bg-text-dark/10` relative
- Fill: `absolute inset-y-0 left-0 bg-ink origin-left` — animated with GSAP
  - `gsap.fromTo(fill, { scaleX: 0 }, { scaleX: ratio, duration: 1.2, ease: 'power3.out', delay: animDelay })`
  - `ratio = editionsSold / editionSize`
- Below bar: flex row with left status text + right fraction `{editionsSold} / {editionSize}`

**Status text semantic states:**
| Condition | Text | Color |
|---|---|---|
| `editionsLeft >= 4` | `{editionsLeft} REMAINING` | `text-muted` |
| `1 < editionsLeft < 4` | `ONLY {editionsLeft} LEFT` | `color: var(--color-teal)` |
| `editionsLeft === 1` | `LAST EDITION` | `color: var(--color-teal)` |
| `editionsLeft === 0` | `SOLD OUT` | `text-muted`, bar fill at 100% with `opacity: 0.35` |

All text: `font-sans 9px tracking-extreme`.

---

## Section 4 — PrintCard Redesign

**File:** `components/prints/PrintGrid.tsx` (PrintCard function)

**Layout — asymmetric 65/35:**
```
┌────────────────────────────┬──────────────────┐
│                            │ SERIES · YEAR    │  ← 9px meta, text-muted
│                            │                  │
│      IMAGE                 │ Print Title      │  ← font-serif italic
│      65% width             │                  │    clamp(1.8rem,3vw,3.5rem)
│      aspect-ratio natural  │ 60 × 80 cm       │  ← 9px meta, text-muted, mt-6
│      (no fixed height)     │ Hahnemühle       │
│                            │ Photo Rag        │
│                            │                  │
│                            │ [EditionBar]     │  ← mt-8
│                            │                  │
│                            │ INQUIRE ABOUT    │  ← font-sans 9px tracking-extreme
│                            │ THIS EDITION →   │    hover: opacity 0.45, mt-8
└────────────────────────────┴──────────────────┘
```

- Image column: `relative overflow-hidden` — no scale on hover, no overlay
- Image: `object-cover w-full h-full`, aspect-ratio driven by natural image dimensions via `aspect-[{w}/{h}]` computed from Sanity metadata
- Text column: `flex flex-col justify-between py-8 pl-10 md:pl-14 pr-6`
- Inquire CTA: `TransitionLink` with `href={/contact?print={title}}`

**Hover — sibling dimming (useState in PrintGrid):**
```ts
const [hovered, setHovered] = useState<string | null>(null)
// on each card:
opacity: hovered !== null && hovered !== print._id ? 0.35 : 1
transition: opacity 0.4s ease
```

**Mobile (< md):** Stack vertical — image full-width, text panel below with `p-6`

**Sold out card:** image at `opacity: 0.45`, title with `text-muted`, CTA replaced with `SOLD OUT` span, EditionBar shows full bar at low opacity.

---

## Section 5 — Grid Layout & Scroll Animations

**File:** `components/prints/PrintGrid.tsx`

**Layout:** Vertical list separated by `border-b border-text-dark/10`. No CSS grid.

```tsx
<div>
  {filtered.map((print, i) => (
    <div key={print._id} className="border-b border-text-dark/10">
      <PrintCard print={print} index={i} hovered={hovered} setHovered={setHovered} />
    </div>
  ))}
</div>
```

**Scroll entrance per card (ScrollTrigger):**
```ts
gsap.fromTo(card, { opacity: 0, y: 40 }, {
  opacity: 1, y: 0,
  duration: 1.0,
  ease: 'power3.out',
  scrollTrigger: { trigger: card, start: 'top 82%' }
})
```

**Text column entrance (offset):**
```ts
gsap.fromTo(textCol, { opacity: 0, x: 16 }, {
  opacity: 1, x: 0,
  duration: 0.9,
  ease: 'power3.out',
  delay: 0.15,
  scrollTrigger: { trigger: card, start: 'top 82%' }
})
```

EditionBar animates when card enters (via `animDelay` prop = `index * 0.08`).

---

## Section 6 — Closing Section

**File:** `components/prints/PrintGrid.tsx` (bottom of component)

Replace the current CTAButton+text block with:

```
─────────────────────────────────────────

Each print arrives rolled in archival        ← font-serif italic
tissue, with a signed certificate            ← clamp(1.4rem, 2.2vw, 2.2rem)
of authenticity and edition number.          ← text-text-dark/50, lineHeight 1.7, maxWidth 42ch

PRODUCTION TIME: 2–3 WEEKS                  ← 9px tracking-extreme text-muted, mt-10
SHIPS WORLDWIDE · INSURED DELIVERY          ← 9px tracking-extreme text-muted, mt-2

─────────────────────────────────────────

Back to the work →                           ← TransitionLink href="/"
                                              font-serif italic
                                              clamp(2.5rem, 5vw, 6rem)
                                              hover: opacity 0.45, duration 0.5
```

Padding: `py-24 px-6 md:px-16`

---

## Palette / Typography Reference

All values from existing design tokens:
- `--color-ink` / `bg-ink` for EditionBar fill and primary text
- `--color-teal` for scarcity urgency states
- `--color-muted` for meta labels
- `--color-text-dark/10` for rules and containers
- `font-serif` = Cormorant Garamond
- `font-sans` = DM Sans
- Meta labels always: `font-sans text-[9px] tracking-extreme text-muted uppercase`
