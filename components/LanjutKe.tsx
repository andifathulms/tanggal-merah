'use client'

import Link from 'next/link'
import { t, type Locale, type KunciTeks } from '@/lib/i18n'

/**
 * The link from one half of the planner to the other.
 *
 * The two routes are the split CLAUDE.md describes — `tahun/` is the year sheet,
 * `rencana/` is the budget and the suggestions — so completing a plan now crosses
 * between them, and the link that does it is load-bearing rather than a convenience.
 *
 * It therefore carries the URL hash. The old link did not, which meant a reader who had
 * chosen days, set a status and picked an objective lost all of it the moment they
 * followed it. That was a bug before the split and would have been a broken journey
 * after it: user state has to survive navigation, not just a refresh.
 */
export function LanjutKe({
  locale,
  ke,
  hash,
  judul,
  teks,
  tombol,
}: {
  readonly locale: Locale
  readonly ke: 'tahun' | 'rencana'
  /** The current settings, so the other half opens on the same plan. */
  readonly hash: string
  readonly judul: KunciTeks
  readonly teks: KunciTeks
  readonly tombol: KunciTeks
}) {
  return (
    <section className="border-l-4 border-liburMerah bg-kertas px-ruang-lg py-ruang-lg shadow-kartu">
      <h2 className="poster text-2xl">{t(judul, locale)}</h2>
      <p className="teks-jelas mt-ruang-sm">{t(teks, locale)}</p>
      <Link
        href={`/${locale}/${ke}/#${hash}`}
        className="mt-ruang-lg inline-block bg-liburMerah px-ruang-lg py-ruang-sm text-sm font-semibold text-kertas hover:bg-liburMerahTeks"
      >
        {t(tombol, locale)} →
      </Link>
    </section>
  )
}
