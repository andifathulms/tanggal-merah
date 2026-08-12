import type { MetadataRoute } from 'next'
import { SITUS } from '@/lib/metadata'

/**
 * Nothing here is private, so everything is crawlable. This exists mainly to point at
 * the sitemap, which is how a crawler finds the locale routes without having to guess
 * past the redirect at the root.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITUS}${BASE}/sitemap.xml`,
  }
}
