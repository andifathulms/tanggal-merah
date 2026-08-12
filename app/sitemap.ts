import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n'
import { alamat, type Halaman } from '@/lib/metadata'

/**
 * Every locale route, listed once, with its translations declared as alternates.
 *
 * There was no sitemap at all, and the site's entry point is a redirect — so a crawler
 * arriving at the root had nothing to follow and no list to fall back on. The URLs come
 * from `lib/metadata`, the same builder that writes the canonicals, so a sitemap entry
 * cannot point somewhere a canonical disagrees with.
 */
const HALAMAN: readonly Halaman[] = ['tahun', 'rencana', 'aturan']

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    HALAMAN.map((halaman) => ({
      url: alamat(locale, halaman),
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, alamat(l, halaman)])),
      },
      // The year sheet is the entry point; the rules page changes only when a new SKB
      // is transcribed. No `lastModified`: the app has no clock (invariant 2) and a
      // fabricated date is worse than none.
      priority: halaman === 'tahun' ? 1 : 0.8,
    })),
  )
}
