'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { urlFor } from '@/lib/sanity/image'

interface TrailSeries {
  _id: string
  coverImage: {
    asset: { url: string; metadata: { lqip: string } }
    hotspot?: { x: number; y: number }
  } | null
}

interface CursorImageTrailProps {
  series: TrailSeries[]
}

export function CursorImageTrail({ series }: CursorImageTrailProps) {
  const trailRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const trail = trailRef.current
    const img = imgRef.current
    if (!trail || !img) return

    // Touch device: skip
    if (window.matchMedia('(hover: none)').matches) return

    const xTo = gsap.quickTo(trail, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(trail, 'y', { duration: 0.45, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('mousemove', onMove)

    // Register hover on each list row
    const rows = document.querySelectorAll<HTMLElement>('[data-series-id]')
    const handlers: Array<{ el: HTMLElement; enter: () => void; leave: () => void }> = []

    rows.forEach(row => {
      const id = row.dataset.seriesId!
      const s = series.find(s => s._id === id)

      const onEnter = () => {
        const rawUrl = s?.coverImage?.asset?.url ?? ''
        if (rawUrl) {
          img.src = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
            ? rawUrl
            : urlFor(s!.coverImage!).width(280).url()
        }
        gsap.to(trail, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' })
      }
      const onLeave = () => {
        gsap.to(trail, { opacity: 0, scale: 0.88, duration: 0.25, ease: 'power2.out' })
      }

      row.addEventListener('mouseenter', onEnter)
      row.addEventListener('mouseleave', onLeave)
      handlers.push({ el: row, enter: onEnter, leave: onLeave })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      })
    }
  }, [series])

  return (
    <div
      ref={trailRef}
      className="fixed pointer-events-none z-50 opacity-0"
      style={{
        top: 0,
        left: 0,
        width: 180,
        transform: 'translate(-50%, calc(-100% - 12px)) rotate(-3deg)',
        scale: '0.88',
        willChange: 'transform, opacity',
      }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src=""
        alt=""
        className="w-full aspect-[3/4] object-cover"
      />
    </div>
  )
}
