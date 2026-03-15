// app/page.tsx
import { client }           from '@/lib/sanity/client'
import { ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { Hero }          from '@/components/home/Hero'
import { Statement }     from '@/components/home/Statement'
import { FeaturedWork }  from '@/components/home/FeaturedWork'
import { SeriesCounter } from '@/components/home/SeriesCounter'
import { PrintTeaser }   from '@/components/home/PrintTeaser'

export const revalidate = 3600

export default async function HomePage() {
  let series: any[] = []
  try { series = await client.fetch(ALL_SERIES_QUERY) ?? [] } catch {}

  return (
    <main>
      <Hero />
      <Statement />
      <FeaturedWork series={series} />
      <SeriesCounter />
      <PrintTeaser />
    </main>
  )
}
