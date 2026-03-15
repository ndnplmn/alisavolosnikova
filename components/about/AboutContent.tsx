// components/about/AboutContent.tsx
'use client'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
// @ts-ignore
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PortableText } from '@portabletext/react'
import { TransitionLink } from '@/components/ui/PageTransition'
import { Marquee } from './Marquee'
import { PortraitReveal } from './PortraitReveal'
import { StatsGrid } from './StatsGrid'
import { DisciplineList } from './DisciplineList'

gsap.registerPlugin(SplitText, ScrollTrigger)

export function AboutContent({ data }: { data: any }) {
  const statementRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = statementRef.current
    if (!el) return

    // Page-load mask reveal — words rise from below overflow:hidden clip
    const split = new SplitText(el, { type: 'words' })
    gsap.set(split.words, { yPercent: 110, opacity: 0 })
    const anim = gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 1.05,
      ease: 'power3.out',
      stagger: 0.055,
      delay: 0.15,
    })

    return () => {
      split.revert()
      anim.kill()
    }
  }, [])

  // Marquee content from practice + clients
  const row1Items = [
    ...(data.practice?.vision ?? ['Photography', 'Film']),
    'Editorial',
    'Fine Art',
  ]
  const row2Items = ['Available Worldwide', ...(data.clients ?? ["Harper's Bazaar", 'ELLE'])]

  // Literary clients sentence
  const clientsSentence = (() => {
    const c: string[] = data.clients ?? []
    if (!c.length) return null
    if (c.length === 1) return `Shot for ${c[0]}.`
    return `Shot for ${c.slice(0, -1).join(', ')}, and ${c[c.length - 1]}, among others.`
  })()

  return (
    <div className="min-h-screen bg-light text-text-dark">

      {/* ── Zone 1: Statement — full viewport display type, page-load reveal ─── */}
      {data.statement && (
        <div
          className="min-h-screen flex flex-col justify-end"
          style={{
            padding: 'clamp(2rem, 5vw, 5rem)',
            paddingBottom: 'clamp(3rem, 10vh, 8rem)',
          }}
        >
          <p
            ref={statementRef}
            className="font-serif text-text-dark"
            style={{
              fontSize: 'clamp(2.2rem, 7vw, 10rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
              maxWidth: '20ch',
            }}
          >
            {data.statement}
          </p>

          {/* Scroll hint */}
          <div className="flex items-center gap-4 mt-14">
            <div className="w-8 h-px bg-text-dark/25" />
            <span
              className="font-sans text-muted"
              style={{ fontSize: '9px', letterSpacing: '0.22em' }}
            >
              SCROLL
            </span>
          </div>
        </div>
      )}

      {/* ── Zone 2: Velocity-linked double-rail marquee ───────────────────────── */}
      <Marquee row1Items={row1Items} row2Items={row2Items} />

      {/* ── Zone 3: Editorial bio — two-column asymmetric (only when bio exists) */}
      {data.bio && (
        <div className="py-28 md:py-40 px-6 md:px-16 border-b border-text-dark/10">
          <div className="grid md:grid-cols-[1fr_2.5fr] gap-8 md:gap-20">
            <div className="pt-1">
              <p
                className="font-sans text-muted"
                style={{ fontSize: '9px', letterSpacing: '0.22em' }}
              >
                STATEMENT
              </p>
            </div>
            <div
              className="font-serif italic text-text-dark/70"
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.25rem)',
                lineHeight: 1.75,
                maxWidth: '52ch',
              }}
            >
              <PortableText value={data.bio} />
            </div>
          </div>
        </div>
      )}

      {/* ── Zone 4: Portrait — clip-path reveal, pinned for 180vh of scroll ───── */}
      {data.portrait && (
        <PortraitReveal portrait={data.portrait} pullQuote={data.pullQuote} />
      )}

      {/* ── Zone 5: Stats grid — 4 editorial columns, bloom on scroll ────────── */}
      {data.practice && <StatsGrid practice={data.practice} />}

      {/* ── Zone 6: Discipline list — rows with hover thumbnail reveal ────────── */}
      {data.practice?.vision?.length > 0 && (
        <DisciplineList
          items={data.practice.vision}
          thumbnail={data.portrait?.asset?.url}
        />
      )}

      {/* ── Zone 7: Literary clients + typographic CTA (no button) ───────────── */}
      <div
        className="border-t border-text-dark/10"
        style={{
          padding: 'clamp(4rem, 8vh, 8rem) clamp(1.5rem, 5vw, 5rem)',
        }}
      >
        {/* Clients — like the acknowledgements page of a photo monograph */}
        {clientsSentence && (
          <p
            className="font-serif italic text-text-dark/40 mb-20 md:mb-32"
            style={{
              fontSize: 'clamp(0.9rem, 1.1vw, 1.1rem)',
              lineHeight: 1.85,
              maxWidth: '58ch',
            }}
          >
            {clientsSentence}
          </p>
        )}

        {/* CTA — the entire block is the link; no button, pure display typography */}
        <TransitionLink href="/contact" className="group block no-underline">
          <p
            className="font-serif italic text-text-dark transition-opacity duration-500 group-hover:opacity-45"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 8.5rem)',
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: '-0.025em',
            }}
          >
            Every great image
            <br />
            begins with a
            <br />
            conversation.&nbsp;→
          </p>
        </TransitionLink>
      </div>
    </div>
  )
}
