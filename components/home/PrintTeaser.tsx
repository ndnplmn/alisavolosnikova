import Image from 'next/image'
import { CTAButton } from '@/components/ui/CTAButton'
import { getBlurDataURL } from '@/lib/sanity/image'

interface PrintTeaserProps {
  imageUrl?: string
  imageAlt?: string
  blurDataURL?: string
}

export function PrintTeaser({ imageUrl, imageAlt = 'Fine art print', blurDataURL }: PrintTeaserProps) {
  if (!imageUrl) return null

  return (
    <section className="bg-dark">
      {/* Full-bleed editorial image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurDataURL ?? getBlurDataURL()}
          className="object-cover"
        />
        {/* Overlay text — bottom-left editorial positioning */}
        <div className="absolute inset-0 bg-dark/30" />
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-[9px] tracking-[0.25em] text-text-light/50 uppercase mb-2">
              Fine Art Prints
            </p>
            <p className="font-serif italic text-4xl md:text-6xl text-text-light leading-tight max-w-lg">
              Limited editions,<br />archival quality.
            </p>
          </div>
          <CTAButton href="/prints">VIEW PRINTS</CTAButton>
        </div>
      </div>
    </section>
  )
}
