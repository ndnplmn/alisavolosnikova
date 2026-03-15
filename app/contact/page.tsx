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
    <div className="min-h-screen bg-light text-text-dark">
      <div className="interior">
        {/* Opening statement */}
        <div className="mb-16">
          <h1 className="font-serif text-4xl leading-tight mb-8">
            Every great image<br />begins with a conversation.
          </h1>
          <p className="font-sans text-[9px] tracking-extreme text-muted">
            AVAILABLE FOR COMMISSIONED WORK · EXHIBITIONS · EDITORIAL
          </p>
        </div>

        {/* Form */}
        <ContactForm defaultPrintName={print} />

        {/* Direct channels */}
        {(data?.instagram || data?.email || data?.location) && (
          <div className="flex flex-col gap-8 mt-16 pt-16 border-t border-text-dark/10">
            {data?.instagram && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-2">INSTAGRAM</p>
                <a href={`https://instagram.com/${data.instagram}`} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-text-dark hover:opacity-70 transition-opacity">
                  @{data.instagram} →
                </a>
              </div>
            )}
            {data?.email && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-2">EMAIL</p>
                <CopyButton email={data.email} />
              </div>
            )}
            {data?.location && (
              <div>
                <p className="font-sans text-[9px] tracking-extreme text-muted mb-2">LOCATION</p>
                <p className="font-sans text-sm">{data.location}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
