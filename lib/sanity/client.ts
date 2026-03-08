import { createClient } from 'next-sanity'

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-03-07',
}

if (!config.projectId && process.env.NODE_ENV === 'production') {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
}

// Public client — CDN-cached, for production page rendering
export const client = createClient({
  ...config,
  useCdn: process.env.NODE_ENV === 'production',
})

// Preview client — bypasses CDN, for draft/preview mode
export const previewClient = createClient({
  ...config,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
