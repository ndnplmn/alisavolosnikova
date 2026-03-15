'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getBlurDataURL } from '@/lib/sanity/image'

gsap.registerPlugin(ScrollTrigger)

interface PortraitRevealProps {
  portrait: {
    asset: {
      url: string
      metadata: { lqip: string | null; dimensions: { width: number; height: number } }
    }
  }
  pullQuote?: string
}

export function PortraitReveal({ portrait, pullQuote }: PortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    const frame = frameRef.current
    const quote = quoteRef.current
    if (!el || !frame) return

    // Start: thin horizontal band at 43% inset top + bottom (14% visible strip)
    gsap.set(frame, { clipPath: 'inset(43% 0 43% 0)' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=180vh',
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Clip-path opens from horizontal slice → full frame
    tl.to(frame, {
      clipPath: 'inset(0% 0 0% 0)',
      ease: 'power1.inOut',
    })

    // Pull quote fades in at 60% of the animation progress
    if (quote) {
      tl.fromTo(
        quote,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.6
      )
    }

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  const lqip = portrait?.asset?.metadata?.lqip

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '100vh' }}>
      {/* Portrait — clip-path controlled by GSAP */}
      <div ref={frameRef} className="absolute inset-0">
        <Image
          src={portrait.asset.url}
          alt="Алиса Волосникова"
          fill
          sizes="100vw"
          className="object-cover"
          {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
        />
        {/* Bottom gradient so quote text reads over any image */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/55 via-transparent to-transparent" />
      </div>

      {/* Pull quote — bottom-left, appears mid-reveal */}
      {pullQuote && (
        <div
          ref={quoteRef}
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{ padding: 'clamp(2rem, 4vw, 4rem)', opacity: 0 }}
        >
          <p
            className="font-serif italic text-text-light"
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.7rem)',
              lineHeight: 1.62,
              maxWidth: '34ch',
            }}
          >
            &ldquo;{pullQuote}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
