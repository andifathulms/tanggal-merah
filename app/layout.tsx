import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Manrope, Overpass_Mono } from 'next/font/google'
import { SITUS } from '@/lib/metadata'
import { t, LOCALE_DEFAULT } from '@/lib/i18n'
import './globals.css'

/** The site's own name and tagline, from the dictionary the masthead renders. */
const JUDUL_SITUS = t('judul', LOCALE_DEFAULT)
const TAGLINE = t('subjudul', LOCALE_DEFAULT)

/**
 * Fonts self-hosted via next/font — downloaded at build time, served from the
 * same origin. There is no runtime network (PRD §11).
 *
 * Bebas Neue is the poster-condensed register of a printed wall calendar;
 * Manrope carries prose and controls; Overpass Mono with tabular figures
 * carries every count and leverage readout (PRD §8).
 */
const poster = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-poster', display: 'swap' })
const prose = Manrope({ subsets: ['latin'], variable: '--font-prose', display: 'swap' })
const mono = Overpass_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

/**
 * Icon and social paths are prefixed by hand: `basePath` is a build-time value
 * and Next does not apply it to metadata URLs. An unprefixed path 404s on
 * Pages without failing the build.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Site-wide metadata only.
 *
 * Title, description, canonical, og:url and the hreflang alternates are per route and
 * per locale, and are built in `lib/metadata` from the same dictionary the pages render
 * — a root layout cannot see the `[locale]` param, which is how six URLs came to share
 * one hand-written Indonesian title in the first place. What is left here is what is
 * genuinely true of every page.
 *
 * The `title.default` is the fallback for the routes that have no metadata of their own:
 * the root redirect and the 404.
 */
export const metadata: Metadata = {
  title: {
    default: `${JUDUL_SITUS} — ${TAGLINE}`,
    // Routes supply their own full title, so nothing is appended to it.
    template: '%s',
  },
  description: TAGLINE,
  applicationName: JUDUL_SITUS,
  metadataBase: new URL(SITUS),
  // `manifest` is deliberately not set here: Next strips basePath from it, and
  // the emitted href then 404s on Pages. The link is rendered by hand below.
  icons: {
    // SVG first for browsers that take it — it is 400 bytes and stays crisp.
    icon: [
      { url: `${BASE}/favicon.svg`, type: 'image/svg+xml' },
      { url: `${BASE}/icon-32.png`, sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: `${BASE}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  // The page ground, so a phone's browser chrome matches the newsprint rather
  // than framing it in white.
  themeColor: '#EFEDE6',
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poster.variable} ${prose.variable} ${mono.variable}`}>
      <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
      <body>{children}</body>
    </html>
  )
}
