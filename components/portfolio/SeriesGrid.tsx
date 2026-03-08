'use client'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
// @ts-ignore
import { Flip } from 'gsap/Flip'
import { SeriesCard } from './SeriesCard'
import { SeriesList } from './SeriesList'
import { CursorImageTrail } from './CursorImageTrail'

gsap.registerPlugin(Flip)

type Filter   = 'ALL' | 'B&W' | 'COLOR'
type ViewMode = 'GRID' | 'LIST'

interface SeriesItem {
  _id: string
  title: string
  slug: string
  year: number
  photoCount: number
  mode: 'dark' | 'light'
  coverImage: {
    asset: { url: string; metadata: { lqip: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
}

export function SeriesGrid({ series }: { series: SeriesItem[] }) {
  const [filter,   setFilter]   = useState<Filter>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('GRID')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = series.filter(s => {
    if (filter === 'ALL')  return true
    if (filter === 'B&W')  return s.mode === 'dark'
    if (filter === 'COLOR') return s.mode === 'light'
    return true
  })

  const changeFilter = (f: Filter) => {
    if (f === filter) return
    const grid = gridRef.current
    if (!grid) { setFilter(f); return }
    const items = grid.querySelectorAll('[data-flip-id]')
    const state = Flip.getState(items)
    setFilter(f)
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power3.inOut',
        absolute: true,
        onLeave: (els: Element[]) => gsap.to(els as HTMLElement[], { opacity: 0, duration: 0.15 }),
        onEnter: (els: Element[]) => gsap.fromTo(els as HTMLElement[], { opacity: 0 }, { opacity: 1, duration: 0.25 }),
      })
    })
  }

  return (
    <div>
      {/* ── Controls bar — sticky under nav ──────────────────── */}
      <div
        className="flex justify-between items-center px-6 py-3
                   sticky z-30 bg-light border-b border-ink/[0.07]"
        style={{ top: 'var(--nav-h)' }}
      >
        {/* Filters */}
        <div className="flex gap-6">
          {(['ALL', 'B&W', 'COLOR'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              data-cursor="link"
              className={`font-sans text-[9px] tracking-[0.2em] transition-opacity duration-200
                          ${filter === f
                            ? 'text-ink opacity-100'
                            : 'text-ink opacity-30 hover:opacity-70'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-5">
          {(['GRID', 'LIST'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              data-cursor="link"
              className={`font-sans text-[9px] tracking-[0.2em] transition-opacity duration-200
                          ${viewMode === v
                            ? 'text-ink opacity-100'
                            : 'text-ink opacity-30 hover:opacity-70'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Cursor trail — list view only */}
      {viewMode === 'LIST' && <CursorImageTrail series={series} />}

      {/* ── Content ──────────────────────────────────────────── */}
      <div ref={gridRef}>
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-px gap-y-0 px-6 pt-8 pb-20">
            {filtered.map(s => (
              <div key={s._id} data-flip-id={s._id} className="px-4 first:pl-0 last:pr-0">
                <SeriesCard
                  title={s.title}
                  slug={s.slug}
                  year={s.year}
                  photoCount={s.photoCount}
                  coverImage={s.coverImage}
                  seriesId={s._id}
                />
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-2 py-32 text-center">
                <p className="font-sans text-[9px] tracking-[0.22em] text-muted uppercase">
                  No series in this category.
                </p>
              </div>
            )}
          </div>
        ) : (
          <SeriesList series={filtered} />
        )}
      </div>
    </div>
  )
}
