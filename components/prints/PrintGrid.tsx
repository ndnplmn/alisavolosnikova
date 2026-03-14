// components/prints/PrintGrid.tsx
'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
// @ts-ignore – gsap type file uses lowercase 'flip.d.ts' but the module is 'Flip'
import { Flip } from 'gsap/Flip'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'
import { CTAButton } from '@/components/ui/CTAButton'

// @ts-ignore
gsap.registerPlugin(Flip)

type Filter = 'ALL' | 'B&W' | 'COLOR' | 'LARGE FORMAT' | 'SMALL FORMAT'

export function PrintGrid({ prints }: { prints: any[] }) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = prints.filter(p => {
    if (filter === 'ALL') return true
    if (filter === 'B&W') return p.colorMode === 'bw'
    if (filter === 'COLOR') return p.colorMode === 'color'
    if (filter === 'LARGE FORMAT') return p.format === 'large'
    if (filter === 'SMALL FORMAT') return p.format === 'small'
    return true
  })

  const changeFilter = (f: Filter) => {
    if (!gridRef.current) { setFilter(f); return }
    // @ts-ignore
    const state = Flip.getState(gridRef.current.querySelectorAll('[data-flip-id]'))
    setFilter(f)
    requestAnimationFrame(() => {
      // @ts-ignore
      Flip.from(state, { duration: 0.5, ease: 'power3.inOut', absolute: true })
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-6 px-6 py-4 font-sans text-[9px] tracking-extreme text-muted flex-wrap">
        {(['ALL', 'B&W', 'COLOR', 'LARGE FORMAT', 'SMALL FORMAT'] as Filter[]).map(f => (
          <button key={f} onClick={() => changeFilter(f)} className={filter === f ? 'text-text-dark underline' : 'hover:text-text-dark transition-colors'}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="px-6 py-12">
        {/* Full width first print */}
        {filtered[0] && <PrintCard key={filtered[0]._id} print={filtered[0]} full />}
        {/* Two-column for rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {filtered.slice(1).map((p: any) => <PrintCard key={p._id} print={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-sans text-sm text-muted">No prints in this category yet.</p>
          </div>
        )}
      </div>

      {/* Edition note */}
      <div className="text-center py-12 px-8 border-t border-text-dark/10">
        <p className="font-sans text-[9px] tracking-extreme text-muted leading-relaxed">
          All prints are produced to order.<br />
          Production time: 2–3 weeks.<br />
          Each piece ships with a certificate of authenticity.
        </p>
      </div>

      {/* Back to work */}
      <div className="flex flex-col items-center py-20 gap-6">
        <div className="w-px h-12 bg-text-dark/20" />
        <p className="font-sans text-[9px] tracking-extreme text-muted">BACK TO THE WORK</p>
        <CTAButton href="/">VIEW PORTFOLIO</CTAButton>
      </div>
    </div>
  )
}

function PrintCard({ print, full = false }: { print: any; full?: boolean }) {
  const editionSize = print.editionSize ?? 10
  const editionsSold = Math.min(print.editionsSold ?? 0, editionSize)
  const editionsLeft = editionSize - editionsSold
  const isSoldOut = editionsLeft === 0
  const photoTitle = print.photo?.title ?? 'Fine Art Print'
  const contactUrl = `/contact?print=${encodeURIComponent(photoTitle)}`

  const imageSource = print.photo?.image
    ? urlFor(print.photo.image).width(full ? 1800 : 900).url()
    : null

  if (!imageSource) return null

  return (
    <div data-flip-id={print._id} className={`group ${full ? 'mb-2' : ''}`}>
      <div className="relative overflow-hidden" data-cursor="photo">
        <Image
          src={imageSource}
          alt={print.photo?.altText ?? photoTitle}
          width={full ? 1800 : 900}
          height={full ? 1200 : 1200}
          placeholder="blur"
          blurDataURL={getBlurDataURL(print.photo?.image?.asset?.metadata?.lqip)}
          className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-dark/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <p className="font-serif text-xl text-text-light">{photoTitle}</p>
        </div>
      </div>
      <div className="py-4">
        <div className="h-px w-full bg-text-dark/10 mb-3" />
        <div className="flex justify-between items-baseline">
          <div>
            <p className="font-sans text-[9px] tracking-extreme text-text-dark">{photoTitle}</p>
            <p className="font-sans text-[9px] tracking-extreme text-muted mt-1">
              Edition of {editionSize} · {print.dimensions ?? '—'} · {print.paper ?? '—'}
            </p>
            <p className="font-sans text-[9px] tracking-extreme text-muted mt-0.5">
              {isSoldOut ? 'Sold out' : `${editionsLeft} of ${editionSize} remaining`}
            </p>
          </div>
          {isSoldOut ? (
            <span className="font-sans text-[9px] tracking-extreme text-muted">SOLD OUT</span>
          ) : (
            <Link href={contactUrl} className="font-sans text-[9px] tracking-extreme hover:opacity-60 transition-opacity" data-cursor="link">
              INQUIRE →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
