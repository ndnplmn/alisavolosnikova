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

// Full-viewport dark closing panel — the next series teases itself as background
export function NextSection({ label, href, title, coverImage }: NextSectionProps) {
  const lqip = coverImage?.asset?.metadata?.lqip

  return (
    <Link
      href={href}
      data-cursor="link"
      className="group relative flex items-center justify-center w-full overflow-hidden no-underline"
      style={{ height: '100vh' }}
    >
      {/* Background — cover image at low opacity, darkened */}
      <div className="absolute inset-0 bg-dark">
        {coverImage?.asset?.url && (
          <>
            <Image
              src={urlFor(coverImage).width(1600).url()}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover opacity-30 transition-opacity duration-700 group-hover:opacity-50"
              {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
            />
            {/* Gradient vignette so title reads cleanly */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-dark/60" />
          </>
        )}
      </div>

      {/* Content — centered */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        <p className="font-sans text-text-light/35" style={{ fontSize: '9px', letterSpacing: '0.22em' }}>
          {label}
        </p>

        <h2
          className="font-serif italic text-text-light transition-opacity duration-300 group-hover:opacity-75"
          style={{
            fontSize: 'clamp(3rem, 9vw, 11rem)',
            fontWeight: 300,
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h2>

        <p
          className="font-sans text-text-light/35 mt-2 transition-opacity duration-300 group-hover:text-text-light/60"
          style={{ fontSize: '9px', letterSpacing: '0.22em' }}
        >
          →
        </p>
      </div>
    </Link>
  )
}
