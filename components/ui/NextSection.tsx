import Link from 'next/link'
import Image from 'next/image'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'

interface NextSectionProps {
  label: string
  href: string
  title: string
  coverImage?: {
    asset: { url: string; metadata: { lqip: string } }
    hotspot?: { x: number; y: number }
  }
}

export function NextSection({ label, href, title, coverImage }: NextSectionProps) {
  return (
    <div className="flex flex-col items-center py-24 gap-6">
      <div className="w-px h-14 bg-current opacity-20" />
      <p className="font-sans text-[9px] tracking-extreme opacity-40">{label}</p>
      <Link
        href={href}
        data-cursor="link"
        className="group flex flex-col items-center gap-5 no-underline"
      >
        <p className="font-serif text-3xl md:text-5xl text-center group-hover:opacity-70 transition-opacity duration-300">
          {title}
        </p>
        {coverImage?.asset?.url && (
          <div className="relative w-40 overflow-hidden">
            <Image
              src={urlFor(coverImage).width(320).url()}
              alt={title}
              width={320}
              height={420}
              placeholder="blur"
              blurDataURL={getBlurDataURL(coverImage.asset.metadata?.lqip)}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        )}
      </Link>
    </div>
  )
}
