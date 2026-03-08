import { client }     from '@/lib/sanity/client'
import { ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { SeriesGrid } from '@/components/portfolio/SeriesGrid'

export const revalidate = 3600

const PLACEHOLDER_SERIES = [
  {
    _id: '1', title: 'Silence', slug: 'silence', year: 2024, photoCount: 8, mode: 'dark' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
  {
    _id: '2', title: 'Urban Ghosts', slug: 'urban-ghosts', year: 2023, photoCount: 12, mode: 'dark' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
  {
    _id: '3', title: 'Raw Light', slug: 'raw-light', year: 2025, photoCount: 6, mode: 'light' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
  {
    _id: '4', title: 'Solitude', slug: 'solitude', year: 2022, photoCount: 9, mode: 'dark' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
  {
    _id: '5', title: 'Chromatic', slug: 'chromatic', year: 2025, photoCount: 14, mode: 'light' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
  {
    _id: '6', title: 'In Between', slug: 'in-between', year: 2021, photoCount: 7, mode: 'dark' as const,
    coverImage: { asset: { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900', metadata: { lqip: '', dimensions: { width: 900, height: 1200 } } } },
  },
]

export default async function WorkPage() {
  let series: any[] = []

  try {
    if (
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
    ) {
      series = await client.fetch(ALL_SERIES_QUERY)
    }
  } catch { /* Sanity not configured */ }

  if (series.length === 0) series = PLACEHOLDER_SERIES

  return (
    <div className="min-h-screen bg-light">
      <SeriesGrid series={series} />
    </div>
  )
}
