'use client'

import { t, type Locale } from '@/lib/i18n'

/**
 * The framing the site states plainly: a personal project, not employment-law
 * advice; company policy governs cuti bersama in the private sector; confirm
 * with HR. No government branding anywhere.
 */
export function Penafian({ locale }: { readonly locale: Locale }) {
  return (
    <p className="border-t border-garis pt-3 text-xs leading-relaxed text-inkPudar">
      {t('penafian', locale)}
    </p>
  )
}

export function CatatanTidakMenghitung({ locale }: { readonly locale: Locale }) {
  return <p className="text-xs leading-relaxed text-inkPudar">{t('tidakMenghitung', locale)}</p>
}

/**
 * Shown whenever the year's pack is a draft transcription. A reader must not
 * be able to mistake unverified dates for cited ones — that is the whole
 * failure mode this project is built around.
 */
export function BannerDraf({ locale }: { readonly locale: Locale }) {
  return (
    <div role="alert" className="border-l-4 border-cutiBersama bg-cutiBersamaLembut px-4 py-3 text-sm leading-relaxed text-inkSedang">
      <span className="font-semibold text-cutiBersamaTeks">
        {locale === 'id' ? 'Data belum diverifikasi. ' : 'Data not verified. '}
      </span>
      {t('bannerDraf', locale)}
    </div>
  )
}
