import type { Metadata } from 'next'
import { LOCALES, LOCALE_DEFAULT, t, type Locale } from '@/lib/i18n'

/**
 * Per-route, per-locale metadata, composed from the same dictionary the pages render.
 *
 * All six locale routes previously shared one title and one description, both written
 * out by hand in Indonesian in the root layout — so the English pages were indexed as
 * Indonesian, the year sheet and the plan and the rules pages were indistinguishable to
 * a search engine, and every shared link previewed identically whichever page was
 * shared. None of them carried a canonical or an hreflang alternate either.
 *
 * The fix has to come from `lib/i18n` rather than from a second set of strings. A
 * hand-maintained description drifts from the page it describes, and a description that
 * has drifted is worse than none — so each route's title and description are taken from
 * the headings and paragraphs that route actually shows. Change the copy and the
 * metadata follows.
 */

/** `basePath` is a build-time value Next does not apply to metadata URLs. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Absolute origin for social cards and canonicals. Without it Next resolves og:image
 * against localhost and every shared link ships a broken preview — which matters here,
 * because the PNG of the year sheet is the distribution mechanism (PRD §5.6).
 */
export const SITUS = process.env.SITE_URL ?? 'https://andifathulms.github.io'

export type Halaman = 'tahun' | 'rencana' | 'aturan'

/** Open Graph wants a full locale, not a bare language tag. */
const OG_LOCALE: Record<Locale, string> = { id: 'id_ID', en: 'en_US' }

/**
 * A description has to fit the ~160 characters search engines show. Truncating at a
 * word boundary keeps this derived from the page copy rather than a second draft of it.
 */
function ringkas(teks: string, maks = 158): string {
  if (teks.length <= maks) return teks
  const potong = teks.slice(0, maks)
  const spasi = potong.lastIndexOf(' ')
  return `${potong.slice(0, spasi > 0 ? spasi : maks).replace(/[,.;:—-]$/, '')}…`
}

/** The heading and the lead paragraph each route puts on the page. */
function isiHalaman(halaman: Halaman, locale: Locale): { judul: string; ringkasan: string } {
  switch (halaman) {
    case 'tahun':
      // The hero's own heading and its opening paragraph.
      return { judul: t('heroJudul', locale).replace(/\.$/, ''), ringkasan: t('heroTeks', locale) }
    case 'rencana':
      return { judul: t('saranJudul', locale), ringkasan: t('saranPenjelasan', locale) }
    case 'aturan':
      return { judul: t('aturanJudul', locale), ringkasan: t('tidakMenghitung', locale) }
    default:
      return exhaustive(halaman)
  }
}

export function alamat(locale: Locale, halaman: Halaman): string {
  return `${SITUS}${BASE}/${locale}/${halaman}/`
}

export function metadataHalaman(locale: Locale, halaman: Halaman): Metadata {
  const { judul, ringkasan } = isiHalaman(halaman, locale)
  const title = `${judul} — ${t('judul', locale)}`
  const description = ringkas(ringkasan)
  const url = alamat(locale, halaman)

  // Reciprocal hreflang, plus x-default, so the two locales are understood as
  // translations of one another rather than as duplicates.
  const languages: Record<string, string> = { 'x-default': alamat(LOCALE_DEFAULT, halaman) }
  for (const l of LOCALES) languages[l] = alamat(l, halaman)

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'website',
      siteName: t('judul', locale),
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url,
      title,
      description,
      images: [{ url: `${BASE}/og.png`, width: 1200, height: 630, alt: t('judul', locale) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE}/og.png`],
    },
  }
}

function exhaustive(value: never): never {
  throw new Error(`Halaman tidak dikenal: ${String(value)}`)
}
