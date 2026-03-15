// components/about/AboutContent.tsx
'use client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PortableText } from '@portabletext/react'
import { TransitionLink } from '@/components/ui/PageTransition'
import { PageHero } from '@/components/ui/PageHero'
import { Marquee } from './Marquee'
import { PortraitReveal } from './PortraitReveal'
import { StatsGrid } from './StatsGrid'
import { DisciplineList } from './DisciplineList'

gsap.registerPlugin(ScrollTrigger)

export function AboutContent({ data }: { data: any }) {

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
    <div>

      {/* ── Zone 1: Statement — ink background ─────────────────────────────────── */}
      <PageHero
        label="ABOUT"
        headline={data.statement ?? ''}
        bottom={
          <div className="flex items-center gap-4">
            <div className="w-8 h-px" style={{ background: 'rgba(245,245,245,0.2)' }} />
            <span className="font-sans" style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(245,245,245,0.35)' }}>
              SCROLL
            </span>
          </div>
        }
      />

      {/* ── Zones 2-6: light background ──────────────────────────────────────── */}
      <div className="bg-light text-text-dark">

        {/* Zone 2: Velocity-linked double-rail marquee */}
        <Marquee row1Items={row1Items} row2Items={row2Items} />

        {/* Zone 3: Editorial bio — two-column asymmetric (only when bio exists) */}
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

        {/* Zone 4: Portrait — clip-path reveal */}
        {data.portrait && (
          <PortraitReveal portrait={data.portrait} pullQuote={data.pullQuote} />
        )}

        {/* Zone 5: Stats grid — 4 editorial columns */}
        {data.practice && <StatsGrid practice={data.practice} />}

        {/* Zone 6: Discipline list — rows with hover thumbnail */}
        {data.practice?.vision?.length > 0 && (
          <DisciplineList
            items={data.practice.vision}
            thumbnail={data.portrait?.asset?.url}
          />
        )}

      </div>

      {/* ── Zone 7: CTA — ink background, mirrors home Statement section ──────── */}
      <div
        className="bg-ink text-text-light"
        style={{
          padding: 'clamp(4rem, 8vh, 8rem) clamp(1.5rem, 5vw, 5rem)',
          borderTop: '1px solid rgba(245,245,245,0.08)',
        }}
      >
        {/* Clients sentence */}
        {clientsSentence && (
          <p
            className="font-serif italic mb-20 md:mb-32"
            style={{
              fontSize: 'clamp(0.9rem, 1.1vw, 1.1rem)',
              lineHeight: 1.85,
              maxWidth: '58ch',
              color: 'rgba(245,245,245,0.4)',
            }}
          >
            {clientsSentence}
          </p>
        )}

        {/* CTA */}
        <TransitionLink href="/contact" className="group block no-underline">
          <p
            className="font-serif italic text-text-light transition-opacity duration-500 group-hover:opacity-45"
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
          {/* Mobile tap affordance */}
          <p
            className="md:hidden font-sans text-[9px] tracking-extreme mt-6"
            style={{ color: 'rgba(245,245,245,0.4)' }}
          >
            GET IN TOUCH →
          </p>
        </TransitionLink>
      </div>
    </div>
  )
}
