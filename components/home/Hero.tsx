'use client'
import dynamic from 'next/dynamic'
import { CTAButton } from '@/components/ui/CTAButton'

// Three.js must not run on SSR
const HeroWebGL = dynamic(
  () => import('./HeroWebGL').then(m => ({ default: m.HeroWebGL })),
  { ssr: false }
)

interface HeroProps {
  imageUrl: string
  imageAlt?: string
}

export function Hero({ imageUrl, imageAlt }: HeroProps) {
  return (
    <section className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-dark">
      {/* WebGL canvas layer */}
      <HeroWebGL imageUrl={imageUrl} alt={imageAlt} />

      {/* Corner labels — positioned absolutely within hero */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top-left: artist name */}
        <div className="absolute top-6 left-6 font-sans text-[10px] tracking-extreme text-light opacity-70">
          Алиса Волосникова
        </div>

        {/* Bottom-left: descriptor */}
        <div className="absolute bottom-6 left-6 font-sans text-[10px] tracking-extreme text-light opacity-50">
          PHOTOGRAPHER
        </div>

        {/* Bottom-right: scroll cue */}
        <div className="absolute bottom-6 right-6 font-sans text-[10px] tracking-extreme text-light opacity-50">
          SCROLL ↓
        </div>
      </div>
    </section>
  )
}
