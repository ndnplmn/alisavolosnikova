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

interface SplitPhotoProps {
  photo: Photo
  /** Which side the image sits on */
  direction: 'left' | 'right'
  /** Display index for the giant number fallback */
  index: number
  caption?: string
}

export function SplitPhoto({ photo, direction, index, caption }: SplitPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    const text = textRef.current
    if (!el || !text) return

    // Text column fades + rises in
    const textAnim = gsap.fromTo(
      text,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%' },
      }
    )

    return () => { textAnim.scrollTrigger?.kill() }
  }, [])

  const lqip = photo.image?.asset?.metadata?.lqip
  const isLeft = direction === 'left'

  const imageBlock = (
    <div
      className={`relative overflow-hidden h-[55vw] md:h-[70vh] ${isLeft ? 'md:order-1' : 'md:order-2'} md:w-[65%]`}
    >
      <Image
        src={photo.image.asset.url}
        alt={photo.altText ?? photo.title ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, 65vw"
        className="object-cover"
        {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
      />
    </div>
  )

  const textBlock = (
    <div
      ref={textRef}
      className={`flex flex-col justify-end px-8 pb-8 md:px-12 md:pb-14 md:w-[35%] ${isLeft ? 'md:order-2' : 'md:order-1'}`}
      style={{ minHeight: '160px', opacity: 0 }}
    >
      {caption ? (
        <p
          className="font-serif italic text-text-dark/65"
          style={{ fontSize: 'clamp(1rem, 1.6vw, 1.5rem)', lineHeight: 1.65 }}
        >
          {caption}
        </p>
      ) : (
        <span
          className="font-serif italic text-text-dark select-none"
          style={{
            fontSize: 'clamp(4rem, 9vw, 11rem)',
            fontWeight: 300,
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            opacity: 0.08,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      {(photo.title || photo.year) && (
        <p
          className="font-sans text-muted mt-5"
          style={{ fontSize: '9px', letterSpacing: '0.22em' }}
        >
          {[photo.title, photo.year].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row">
      {imageBlock}
      {textBlock}
    </div>
  )
}
