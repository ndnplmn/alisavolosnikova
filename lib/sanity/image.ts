import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'
import type { SanityImageSource } from '@sanity/image-url'

const builder = imageUrlBuilder(client)

// A lightweight proxy that mimics the builder API for plain-URL fallback images
class DirectUrlBuilder {
  private _url: string
  constructor(url: string) {
    this._url = url
  }
  width(_w: number) { return this }
  height(_h: number) { return this }
  fit(_f: string) { return this }
  quality(_q: number) { return this }
  format(_f: string) { return this }
  url() { return this._url }
}

export function urlFor(source: SanityImageSource) {
  // When placeholder data passes an object with asset.url but no asset._ref,
  // skip the Sanity builder to avoid "Malformed asset _ref" errors.
  if (
    source &&
    typeof source === 'object' &&
    'asset' in source &&
    source.asset &&
    typeof source.asset === 'object' &&
    'url' in source.asset &&
    !('_ref' in source.asset)
  ) {
    return new DirectUrlBuilder((source.asset as { url: string }).url) as unknown as ReturnType<typeof builder.image>
  }
  return builder.image(source)
}

export function getBlurDataURL(lqip?: string): string {
  return lqip ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
}
