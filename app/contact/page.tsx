// app/contact/page.tsx
import { client } from '@/lib/sanity/client'
import { CONTACT_QUERY } from '@/lib/sanity/queries'
import { ContactForm } from '@/components/contact/ContactForm'
import { CornerUI } from '@/components/ui/CornerUI'

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
    <div className="min-h-screen bg-dark text-text-light pt-20">
      <CornerUI topLeft="CONTACT" bottomLeft="Алиса Волосникова" bottomRight="© 2026" />

      <div className="max-w-screen-xl mx-auto px-8 py-20">
        {/* Opening statement */}
        <div className="text-center mb-20">
          <h1 className="font-serif text-5xl md:text-7xl mb-6">
            Every great image<br />begins with a conversation.
          </h1>
          <p className="font-sans text-[9px] tracking-extreme text-muted">
            AVAILABLE FOR COMMISSIONED WORK · EXHIBITIONS · EDITORIAL
          </p>
        </div>

        {/* Form + Direct channels */}
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-[60%]">
            <ContactForm defaultPrintName={print} />
          </div>
          <div className="md:w-[40%] flex flex-col items-end justify-start gap-8 pt-4">
            {data?.instagram && (
              <div className="text-right">
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-1">INSTAGRAM</p>
                <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener" className="font-sans text-sm text-text-light hover:opacity-70 transition-opacity" data-cursor="link">
                  @{data.instagram} →
                </a>
              </div>
            )}
            {data?.email && (
              <div className="text-right">
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-1">EMAIL</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(data.email); }}
                  className="font-sans text-sm text-text-light hover:opacity-70 transition-opacity"
                  data-cursor="link"
                >
                  {data.email} →
                </button>
              </div>
            )}
            {data?.location && (
              <div className="text-right">
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-1">LOCATION</p>
                <p className="font-sans text-sm">{data.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
