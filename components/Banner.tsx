'use client'

import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'

/**
 * The site's legal framing — a personal project, not employment-law advice —
 * now lives in `SiteFooter`, which renders it once per page instead of once
 * per component that happened to want it.
 *
 * This note stays because Aturan opens with it, directly under the heading,
 * where it introduces the citations rather than closing the page.
 */
export function CatatanTidakMenghitung({ locale }: { readonly locale: Locale }) {
  return <p className="text-sm leading-relaxed text-inkPudar">{t('tidakMenghitung', locale)}</p>
}

/**
 * Shown whenever the year's pack is a draft transcription. A reader must not
 * be able to mistake unverified dates for cited ones — that is the whole
 * failure mode this project is built around.
 *
 * It used to be the second thing on the page, 46 words of decree vocabulary
 * ending in "see UPDATING.md", read before the visitor knew what the site was.
 * The effect was "this site is broken" rather than "this figure is provisional".
 * So it now sits below the hero, leads with a line that needs no prior
 * knowledge, names the year it applies to, and links to Aturan — where a reader
 * can check every date against the decree it claims to come from.
 */
export function BannerDraf({ locale, tahun }: { readonly locale: Locale; readonly tahun: number }) {
  return (
    <div role="alert" className="border-l-4 border-cutiBersama bg-cutiBersamaLembut px-ruang-lg py-ruang-md">
      <p className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold text-cutiBersamaTeks">
        <span className="angka border border-cutiBersama/40 px-1.5 text-sm">{tahun}</span>
        {t('bannerDrafJudul', locale)}
      </p>
      <p className="teks-jelas mt-ruang-sm text-sm">{t('bannerDraf', locale)}</p>
      <Link
        href={`/${locale}/aturan/`}
        className="mt-ruang-sm inline-block text-sm font-semibold text-cutiBersamaTeks underline underline-offset-4"
      >
        {t('bannerDrafTautan', locale)} →
      </Link>
    </div>
  )
}
