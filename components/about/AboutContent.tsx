// components/about/AboutContent.tsx
'use client'
import Image from 'next/image'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
// @ts-ignore
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'
import { CTAButton } from '@/components/ui/CTAButton'
import { PortableText } from '@portabletext/react'

gsap.registerPlugin(SplitText, ScrollTrigger)

export function AboutContent({ data }: { data: any }) {
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const cleanups: (() => void)[] = []
    ;[quoteRef, statementRef].forEach(ref => {
      const el = ref.current
      if (!el) return
      const split = new SplitText(el, { type: 'words' })
      gsap.set(split.words, { yPercent: 110, opacity: 0 })
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        onEnter: () => gsap.to(split.words, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }),
      })
      cleanups.push(() => { split.revert(); trigger.kill() })
    })
    return () => cleanups.forEach(fn => fn())
  }, [])

  return (
    <div className="min-h-screen bg-light text-text-dark pt-20">
      {/* Split hero */}
      <div className="flex flex-col md:flex-row min-h-[80vh]">
        {data.portrait && (
          <div className="relative md:w-[45%] h-96 md:h-auto md:min-h-[70vh]">
            <Image
              src={urlFor(data.portrait).width(900).url()}
              alt="Алиса Волосникова"
              fill
              placeholder="blur"
              blurDataURL={getBlurDataURL(data.portrait?.asset?.metadata?.lqip)}
              className="object-cover"
            />
          </div>
        )}
        <div className="md:w-[55%] flex flex-col justify-center px-8 md:px-16 py-16">
          {data.statement && (
            <p ref={statementRef} className="font-serif text-2xl md:text-4xl leading-relaxed mb-8">
              {data.statement}
            </p>
          )}
          {data.bio && (
            <div className="font-sans text-sm leading-relaxed text-text-dark/80 prose max-w-none">
              <PortableText value={data.bio} />
            </div>
          )}
        </div>
      </div>

      {/* Pull quote */}
      {data.pullQuote && (
        <div className="flex justify-center px-8 py-24">
          <p ref={quoteRef} className="font-serif text-3xl md:text-5xl text-center max-w-2xl">
            &ldquo;{data.pullQuote}&rdquo;
          </p>
        </div>
      )}

      {/* Practice table */}
      {data.practice && (
        <div className="flex flex-wrap justify-center gap-16 px-8 py-16 border-t border-text-dark/10">
          {[
            { label: 'VISION', items: data.practice.vision },
            { label: 'PROCESS', items: data.practice.process },
            { label: 'MEDIUM', items: data.practice.medium },
          ].map(({ label, items }) => items?.length > 0 && (
            <div key={label}>
              <p className="font-sans text-[9px] tracking-extreme text-muted mb-3">{label}</p>
              <div className="h-px w-full bg-text-dark/10 mb-3" />
              {items.map((item: string) => (
                <p key={item} className="font-sans text-sm text-text-dark py-1">{item}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Clients */}
      {data.clients?.length > 0 && (
        <div className="flex justify-center px-8 py-12 border-t border-text-dark/10">
          <p className="font-sans text-xs text-muted">
            {data.clients.join(' · ')}
          </p>
        </div>
      )}

      {/* CTA to contact */}
      <div className="flex flex-col items-center py-24 gap-8">
        <p className="font-serif text-4xl md:text-6xl text-center px-8">
          Want to work<br />together?
        </p>
        <CTAButton href="/contact">GET IN TOUCH</CTAButton>
      </div>
    </div>
  )
}
