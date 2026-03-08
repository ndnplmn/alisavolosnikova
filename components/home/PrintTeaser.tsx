import Image from 'next/image'
import { CTAButton } from '@/components/ui/CTAButton'
import { getBlurDataURL } from '@/lib/sanity/image'

interface PrintTeaserProps {
  imageUrl: string
  imageAlt?: string
  blurDataURL?: string
}

export function PrintTeaser({ imageUrl, imageAlt = 'Fine art print', blurDataURL }: PrintTeaserProps) {
  return (
    <section className="bg-dark flex flex-col items-center py-28 px-8">
      <div className="relative w-full max-w-lg mx-auto aspect-[3/4] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 512px"
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL ?? getBlurDataURL()}
          className="object-cover"
        />
      </div>

      <p className="font-sans text-[9px] tracking-extreme text-text-light/50 mt-12 mb-8">
        AVAILABLE AS FINE ART PRINTS
      </p>

      <CTAButton href="/prints">EXPLORE PRINTS</CTAButton>
    </section>
  )
}
