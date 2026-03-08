import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/ui/CTAButton'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'

interface SeriesItem {
  _id: string
  title: string
  slug: string
  coverImage: {
    asset: { url: string; metadata: { lqip: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
}

interface FeaturedWorkProps {
  series: SeriesItem[]
}

export function FeaturedWork({ series }: FeaturedWorkProps) {
  const [main, ...rest] = series

  if (!main) {
    return null
  }

  return (
    <section className="bg-light px-6 py-20">
      <div className="flex flex-col md:flex-row gap-3 max-w-screen-xl mx-auto">
        {/* Main large photo */}
        <Link
          href={`/work/${main.slug}`}
          className="relative flex-[6] overflow-hidden group min-h-64 md:min-h-96"
          data-cursor="photo"
          data-cursor-label={main.title}
        >
          <Image
            src={urlFor(main.coverImage).width(1200).url()}
            alt={main.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            placeholder="blur"
            blurDataURL={getBlurDataURL(main.coverImage?.asset?.metadata?.lqip)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {/* Two stacked photos */}
        {rest.length > 0 && (
          <div className="flex flex-col gap-3 flex-[4]">
            {rest.map(s => (
              <Link
                key={s._id}
                href={`/work/${s.slug}`}
                className="relative overflow-hidden group flex-1 min-h-44"
                data-cursor="photo"
                data-cursor-label={s.title}
              >
                <Image
                  src={urlFor(s.coverImage).width(800).url()}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL(s.coverImage?.asset?.metadata?.lqip)}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-12">
        <CTAButton href="/work">VIEW ALL WORK</CTAButton>
      </div>
    </section>
  )
}
