import { client } from '@/lib/sanity/client'
import { ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { SeriesGrid } from '@/components/portfolio/SeriesGrid'
import { CornerUI } from '@/components/ui/CornerUI'

export const revalidate = 3600

export default async function WorkPage() {
  let series: any[] = []

  try {
    if (
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
    ) {
      series = await client.fetch(ALL_SERIES_QUERY)
    }
  } catch {
    // Sanity not configured yet
  }

  // Placeholder data for development
  if (series.length === 0) {
    series = [
      {
        _id: '1',
        title: 'Silence',
        slug: 'silence',
        year: 2024,
        photoCount: 8,
        mode: 'dark',
        coverImage: { asset: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640', metadata: { lqip: '', dimensions: { width: 640, height: 853 } } } },
      },
      {
        _id: '2',
        title: 'Urban Ghosts',
        slug: 'urban-ghosts',
        year: 2023,
        photoCount: 12,
        mode: 'dark',
        coverImage: { asset: { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640', metadata: { lqip: '', dimensions: { width: 640, height: 853 } } } },
      },
      {
        _id: '3',
        title: 'Raw Light',
        slug: 'raw-light',
        year: 2025,
        photoCount: 6,
        mode: 'light',
        coverImage: { asset: { url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=640', metadata: { lqip: '', dimensions: { width: 640, height: 853 } } } },
      },
    ]
  }

  return (
    <div className="min-h-screen bg-light pt-16">
      <CornerUI
        topLeft="WORK"
        bottomLeft="PHOTOGRAPHY"
      />
      <SeriesGrid series={series} />
    </div>
  )
}
