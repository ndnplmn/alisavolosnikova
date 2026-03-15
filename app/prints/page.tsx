// app/prints/page.tsx
import { client }           from '@/lib/sanity/client'
import { ALL_PRINTS_QUERY } from '@/lib/sanity/queries'
import { PrintGrid }        from '@/components/prints/PrintGrid'
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

  // Compute total available editions server-side
  const availableEditions = prints.reduce((sum: number, p: any) => {
    const size = p.editionSize ?? 10
    const sold = Math.min(p.editionsSold ?? 0, size)
    return sum + (size - sold)
  }, 0)

  return (
    <div className="min-h-screen bg-light text-text-dark">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 md:px-16 pt-16 pb-0">
        <p className="font-sans text-[9px] tracking-extreme text-muted mb-10">
          FINE ART PRINTS
        </p>
        <h1
          className="font-serif italic text-text-dark"
          style={{
            fontSize:      'clamp(4rem, 9vw, 12rem)',
            fontWeight:    300,
            lineHeight:    0.88,
            letterSpacing: '-0.03em',
          }}
        >
          Limited<br />Editions.
        </h1>
        <div
          className="flex flex-wrap items-center justify-between gap-4 mt-10 pt-6"
          style={{ borderTop: '1px solid rgba(10,10,10,0.1)' }}
        >
          <p className="font-sans text-[9px] tracking-extreme text-muted">
            ARCHIVAL PIGMENT · SIGNED &amp; NUMBERED · PRODUCED TO ORDER
          </p>
          {availableEditions > 0 && (
            <p className="font-sans text-[9px] tracking-extreme text-muted">
              {availableEditions} EDITION{availableEditions !== 1 ? 'S' : ''} AVAILABLE
            </p>
          )}
        </div>
      </div>

      <PrintGrid prints={prints} />
    </div>
  )
}
