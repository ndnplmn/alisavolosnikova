// app/prints/page.tsx
import { client } from '@/lib/sanity/client'
import { ALL_PRINTS_QUERY } from '@/lib/sanity/queries'
import { PrintGrid } from '@/components/prints/PrintGrid'
import { CornerUI } from '@/components/ui/CornerUI'

export const revalidate = 3600

const PLACEHOLDER_PRINTS = [
  {
    _id: 'print-1',
    editionSize: 10,
    editionsSold: 3,
    dimensions: '60 × 80 cm',
    paper: 'Hahnemühle Photo Rag',
    colorMode: 'bw',
    format: 'large',
    photo: {
      title: 'Silence No. 1',
      altText: 'Misty mountain landscape in black and white',
      image: { asset: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-2',
    editionSize: 15,
    editionsSold: 15,
    dimensions: '40 × 50 cm',
    paper: 'Baryta Photographique',
    colorMode: 'bw',
    format: 'small',
    photo: {
      title: 'Urban Ghost III',
      altText: 'Blurred figure in a city street',
      image: { asset: { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-3',
    editionSize: 8,
    editionsSold: 2,
    dimensions: '50 × 70 cm',
    paper: 'Hahnemühle Photo Rag',
    colorMode: 'color',
    format: 'large',
    photo: {
      title: 'Raw Light II',
      altText: 'Forest light study in color',
      image: { asset: { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900', metadata: { lqip: null } } },
    },
  },
  {
    _id: 'print-4',
    editionSize: 12,
    editionsSold: 4,
    dimensions: '30 × 40 cm',
    paper: 'Hahnemühle German Etching',
    colorMode: 'bw',
    format: 'small',
    photo: {
      title: 'Solitude',
      altText: 'Lone figure on empty street',
      image: { asset: { url: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=900', metadata: { lqip: null } } },
    },
  },
]

export default async function PrintsPage() {
  let prints: any[] = []
  try {
    prints = await client.fetch(ALL_PRINTS_QUERY) ?? []
  } catch {
    // Sanity not configured yet
  }

  if (prints.length === 0) prints = PLACEHOLDER_PRINTS

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
