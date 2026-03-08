import { createClient } from 'next-sanity'

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

// Use a valid placeholder when the env var is not yet configured
const isConfigured = rawProjectId && /^[a-z0-9-]+$/.test(rawProjectId)
const projectId = isConfigured ? rawProjectId : 'placeholder'

const config = {
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-03-07',
}

if (!isConfigured && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('Sanity is not configured — data fetching will be skipped.')
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
