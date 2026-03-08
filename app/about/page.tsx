// app/about/page.tsx
import { client } from '@/lib/sanity/client'
import { ABOUT_QUERY } from '@/lib/sanity/queries'
import { AboutContent } from '@/components/about/AboutContent'
import { CornerUI } from '@/components/ui/CornerUI'

export const revalidate = 3600

export default async function AboutPage() {
  let data: any = {}
  try {
    data = await client.fetch(ABOUT_QUERY)
  } catch {
    // Sanity not configured yet
  }
  return (
    <>
      <CornerUI topLeft="ABOUT" bottomLeft="PHOTOGRAPHER" bottomRight="MOSCOW · 2026" />
      <AboutContent data={data ?? {}} />
    </>
  )
}
