// app/contact/page.tsx
import { client } from '@/lib/sanity/client'
import { CONTACT_QUERY } from '@/lib/sanity/queries'
import { ContactForm } from '@/components/contact/ContactForm'
import { CopyButton } from '@/components/contact/CopyButton'
export const revalidate = 3600

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ print?: string }> }) {
  const { print } = await searchParams
  let data: any = null
  try {
    data = await client.fetch(CONTACT_QUERY)
  } catch {
    // Sanity not configured yet
  }

  return (
    <div>
      {/* ── Header — ink background ─────────────────────────────── */}
      <div className="bg-ink text-text-light px-6 md:px-16 pt-24 pb-20">
        <p className="font-sans text-[9px] tracking-extreme mb-10" style={{ color: 'rgba(245,245,245,0.35)' }}>
          CONTACT
        </p>
        <h1
          className="font-serif italic text-text-light"
          style={{
            fontSize:      'clamp(2.8rem, 6vw, 8rem)',
            fontWeight:    300,
            lineHeight:    0.95,
            letterSpacing: '-0.025em',
            maxWidth:      '18ch',
          }}
        >
          Every great image begins with a conversation.
        </h1>
        <p
          className="font-sans text-[9px] tracking-extreme mt-10"
          style={{ color: 'rgba(245,245,245,0.35)' }}
        >
          AVAILABLE FOR COMMISSIONED WORK · EXHIBITIONS · EDITORIAL
        </p>
      </div>

      {/* ── Form — light background ──────────────────────────────── */}
      <div className="bg-light text-text-dark px-6 md:px-16 pt-16 pb-32">

        {/* Two-column: form left (60%) + channels right (40%) on desktop */}
        <div className="grid md:grid-cols-[3fr_2fr] gap-16 md:gap-24 items-start">

          {/* Form */}
          <ContactForm defaultPrintName={print} />

          {/* Direct channels */}
          <div className="flex flex-col gap-10 md:pt-2">
            {data?.instagram && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-3">INSTAGRAM</p>
                <a
                  href={`https://instagram.com/${data.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-text-dark hover:opacity-50 transition-opacity duration-300"
                >
                  @{data.instagram} →
                </a>
              </div>
            )}
            {data?.email && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-3">EMAIL</p>
                <CopyButton email={data.email} />
              </div>
            )}
            {data?.location && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-3">LOCATION</p>
                <p className="font-sans text-sm text-text-dark">{data.location}</p>
              </div>
            )}

            {/* Fallback when no Sanity data */}
            {!data && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-3">LOCATION</p>
                <p className="font-sans text-sm text-text-dark">Yekaterinburg · Available Worldwide</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
