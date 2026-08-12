import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Manrope, Overpass_Mono } from 'next/font/google'
import './globals.css'

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
 * Absolute origin for social cards. Without a `metadataBase`, Next resolves
 * og:image against `http://localhost:3000` and every shared link ships a
 * broken preview — which matters here, because the PNG of the year sheet is
 * the distribution mechanism (PRD §5.6).
 */
const SITUS = process.env.SITE_URL ?? 'https://andifathulms.github.io'

const JUDUL = 'Tanggal Merah — libur nasional, cuti bersama, dan cuti tahunan'
const RINGKAS =
  'Libur nasional dan cuti bersama Indonesia dari SKB yang disitasi, dan di mana cuti tahunan Anda menghasilkan rentetan libur terpanjang.'

export const metadata: Metadata = {
  title: JUDUL,
  description: RINGKAS,
  applicationName: 'Tanggal Merah',
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
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Tanggal Merah',
    title: JUDUL,
    description: RINGKAS,
    images: [{ url: `${BASE}/og.png`, width: 1200, height: 630, alt: 'Tanggal Merah' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: JUDUL,
    description: RINGKAS,
    images: [`${BASE}/og.png`],
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
