import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Tanggal Merah — libur nasional, cuti bersama, dan cuti tahunan',
  description:
    'Libur nasional dan cuti bersama Indonesia dari SKB yang disitasi, dan di mana cuti tahunan Anda menghasilkan rentetan libur terpanjang.',
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poster.variable} ${prose.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
