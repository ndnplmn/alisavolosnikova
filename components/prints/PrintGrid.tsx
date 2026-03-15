// components/prints/PrintGrid.tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    positionIndicator(filter, false)
  }, []) // mount only — click path handles animated transitions via positionIndicator(f, true)

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
          aria-pressed={filter === f}
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

    // Kill any in-flight tweens from a previous rapid filter change
    gsap.killTweensOf(cards)

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
          // Kill any ScrollTriggers that fired immediately on mount (card already in viewport)
          // so the filter enter tween is the authoritative animation for this transition
          ScrollTrigger.getAll()
            .filter(st => next.includes(st.trigger as HTMLElement))
            .forEach(st => st.kill())

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
      cardAnim.kill()
      textAnim.scrollTrigger?.kill()
      textAnim.kill()
    }
  }, [])

  if (!imageSource) return null

  const isDimmed = hovered !== null && hovered !== print._id

  return (
    // Outer div handles sibling dimming via CSS transition
    <div
      style={{ opacity: isDimmed ? 0.35 : 1, transition: 'opacity 0.4s ease' }}
      onMouseEnter={() => onHover(print._id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Inner div is the GSAP entrance target */}
      <div
        ref={cardRef}
        data-print-card
        className="flex flex-col md:flex-row py-10 md:py-14 px-6 md:px-16"
        style={{ opacity: 0 }}
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
          style={{ opacity: 0 }}
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
                <TransitionLink
                  href={contactUrl}
                  data-cursor="link"
                  className="font-sans text-[9px] tracking-extreme text-text-dark
                             transition-opacity duration-300 hover:opacity-45"
                >
                  INQUIRE ABOUT THIS EDITION →
                </TransitionLink>
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
      className="bg-ink px-6 md:px-16 py-24"
      style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
    >
      <p
        className="font-serif italic"
        style={{
          fontSize:   'clamp(1.4rem, 2.2vw, 2.2rem)',
          lineHeight: 1.7,
          maxWidth:   '42ch',
          color:      'rgba(245,245,245,0.45)',
        }}
      >
        Each print arrives rolled in archival tissue, with a signed
        certificate of authenticity and edition number.
      </p>

      <div className="mt-10 flex flex-col gap-2">
        <p className="font-sans text-[9px] tracking-extreme" style={{ color: 'rgba(245,245,245,0.3)' }}>
          PRODUCTION TIME: 2–3 WEEKS
        </p>
        <p className="font-sans text-[9px] tracking-extreme" style={{ color: 'rgba(245,245,245,0.3)' }}>
          SHIPS WORLDWIDE · INSURED DELIVERY
        </p>
      </div>

      <div
        className="mt-16 pt-16"
        style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
      >
        <TransitionLink
          href="/"
          className="font-serif italic text-text-light transition-opacity duration-500 hover:opacity-45"
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
