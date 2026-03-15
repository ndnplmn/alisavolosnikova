'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getBlurDataURL } from '@/lib/sanity/image'

gsap.registerPlugin(ScrollTrigger)

interface Photo {
  _id: string
  title?: string
  year?: number
  altText?: string
  image: {
    asset: {
      url: string
      metadata: { lqip: string; dimensions: { width: number; height: number } }
    }
  }
}

export function FullBleedPhoto({ photo }: { photo: Photo }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = containerRef.current
    const meta = metaRef.current
    if (!el || !meta) return

    // Caption fades in as image enters viewport
    const metaAnim = gsap.fromTo(
      meta,
      { opacity: 0, y: 10 },
      {
        opacity: 0.55,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 65%' },
      }
    )

    return () => { metaAnim.scrollTrigger?.kill() }
  }, [])

  const lqip = photo.image?.asset?.metadata?.lqip

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: '85vh' }}
    >
      <Image
        src={photo.image.asset.url}
        alt={photo.altText ?? photo.title ?? ''}
        fill
        sizes="100vw"
        className="object-cover"
        {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
      />

      {/* Caption — bottom-left, fades in on scroll enter */}
      {(photo.title || photo.year) && (
        <p
          ref={metaRef}
          className="absolute bottom-0 left-0 font-sans text-text-light pointer-events-none"
          style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', fontSize: '9px', letterSpacing: '0.22em', opacity: 0 }}
        >
          {[photo.title, photo.year].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}
