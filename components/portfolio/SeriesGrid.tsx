'use client'
import { useState, useRef } from 'react'
import { gsap } from 'gsap'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – gsap type file uses lowercase 'flip.d.ts' but the module is 'Flip'
import { Flip } from 'gsap/Flip'
import { SeriesCard } from './SeriesCard'
import { SeriesList } from './SeriesList'
import { CursorImageTrail } from './CursorImageTrail'

gsap.registerPlugin(Flip)

type Filter = 'ALL' | 'B&W' | 'COLOR'
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

interface SeriesGridProps {
  series: SeriesItem[]
}

export function SeriesGrid({ series }: SeriesGridProps) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('GRID')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = series.filter(s => {
    if (filter === 'ALL') return true
    if (filter === 'B&W') return s.mode === 'dark'
    if (filter === 'COLOR') return s.mode === 'light'
    return true
  })

  const changeFilter = (f: Filter) => {
    if (f === filter) return
    const grid = gridRef.current
    if (!grid) {
      setFilter(f)
      return
    }
    const items = grid.querySelectorAll('[data-flip-id]')
    const state = Flip.getState(items)
    setFilter(f)
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power3.inOut',
        absolute: true,
        onLeave: (els: Element[]) => gsap.to(els as HTMLElement[], { opacity: 0, duration: 0.2 }),
        onEnter: (els: Element[]) => gsap.fromTo(els as HTMLElement[], { opacity: 0 }, { opacity: 1, duration: 0.3 }),
      })
    })
  }

  return (
    <div>
      {/* Controls bar */}
      <div className="flex justify-between items-center px-6 py-4 sticky top-0 z-30 bg-light/90 backdrop-blur-sm border-b border-text-dark/5">
        {/* Filter */}
        <div className="flex gap-5">
          {(['ALL', 'B&W', 'COLOR'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={`font-sans text-[9px] tracking-extreme transition-colors duration-200 cursor-none ${
                filter === f ? 'text-text-dark underline' : 'text-muted hover:text-text-dark'
              }`}
              data-cursor="link"
            >
              {f}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-4">
          {(['GRID', 'LIST'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`font-sans text-[9px] tracking-extreme transition-colors duration-200 cursor-none ${
                viewMode === v ? 'text-text-dark underline' : 'text-muted hover:text-text-dark'
              }`}
              data-cursor="link"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Cursor trail — only in list view */}
      {viewMode === 'LIST' && <CursorImageTrail series={series} />}

      {/* Content */}
      <div ref={gridRef}>
        {viewMode === 'GRID' ? (
          <div className="flex gap-5 overflow-x-auto px-6 py-12 scrollbar-none snap-x snap-mandatory">
            {filtered.map(s => (
              <div key={s._id} data-flip-id={s._id} className="snap-start">
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
          </div>
        ) : (
          <SeriesList series={filtered} />
        )}
      </div>
    </div>
  )
}
