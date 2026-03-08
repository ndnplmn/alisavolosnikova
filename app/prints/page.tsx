// app/prints/page.tsx
import { client } from '@/lib/sanity/client'
import { ALL_PRINTS_QUERY } from '@/lib/sanity/queries'
import { PrintGrid } from '@/components/prints/PrintGrid'
import { CornerUI } from '@/components/ui/CornerUI'

export const revalidate = 3600

export default async function PrintsPage() {
  let prints: any[] = []
  try {
    prints = await client.fetch(ALL_PRINTS_QUERY) ?? []
  } catch {
    // Sanity not configured yet
  }

  return (
    <div className="min-h-screen bg-light text-text-dark pt-20">
      <CornerUI topLeft="PRINTS" bottomLeft="FINE ART PRINTS" bottomRight="LIMITED EDITIONS" />

      <div className="px-6 py-16">
        <p className="font-sans text-[9px] tracking-extreme text-muted mb-6">
          FINE ART PRINTS · LIMITED EDITIONS · ARCHIVAL QUALITY
        </p>
        <p className="font-serif text-2xl max-w-lg">
          Each print is produced on archival paper, signed and numbered by Alisa.
        </p>
        <div className="h-px w-full bg-text-dark/10 mt-8" />
      </div>

      <PrintGrid prints={prints} />
    </div>
  )
}
