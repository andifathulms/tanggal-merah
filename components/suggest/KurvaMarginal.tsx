'use client'

import { t, type Locale } from '@/lib/i18n'
import { anggaranJenuhHari, type LangkahMarginal } from '@/lib/optimise/marginal'

/**
 * A4 — what the nth leave day buys.
 *
 * The app answers for one budget, which hides the shape of the year: the first
 * leave day might buy three extra days off and the ninth buy nothing, because by
 * then there are no gaps left to close. A reader who has already committed six
 * days to a family trip cannot tell from a single answer whether the remaining
 * six are worth planning around.
 *
 * Framed as a price list. A curve that flattens implies "stop here", and
 * invariant 13 means this app does not imply — it states what each day costs and
 * what it buys, and leaves the decision to the reader.
 *
 * Invariant 15: the curve arrives computed, from `lib/optimise/marginal`.
 */
export function KurvaMarginal({
  kurva,
  locale,
}: {
  readonly kurva: readonly LangkahMarginal[]
  readonly locale: Locale
}) {
  const jenuh = anggaranJenuhHari(kurva)
  const puncak = kurva.reduce((n, l) => (l.tambahanHari > n ? l.tambahanHari : n), 0)

  // Rows past saturation are all zero and identical; showing thirty of them
  // says nothing the sentence beneath does not say better.
  const tampil = jenuh === undefined ? kurva : kurva.filter((l) => l.anggaranHari <= jenuh)

  return (
    <section aria-labelledby="judul-kurva">
      <h2 id="judul-kurva" className="poster text-2xl">
        {t('kurvaJudul', locale)}
      </h2>
      <p className="teks-jelas mt-ruang-sm">{t('kurvaPenjelasan', locale)}</p>
      <p className="teks-catatan mt-ruang-sm">{t('kurvaLompatan', locale)}</p>

      {kurva.length === 0 ? (
        <p className="teks-catatan mt-ruang-lg text-base">{t('kurvaKosong', locale)}</p>
      ) : (
        <>
          <ol className="mt-ruang-lg space-y-1">
            {tampil.map((langkah) => (
              <Baris key={langkah.anggaranHari} langkah={langkah} puncak={puncak} locale={locale} />
            ))}
          </ol>

          {jenuh !== undefined && (
            <p className="teks-catatan mt-ruang-md text-sm">
              {t('kurvaJenuh', locale).replace('%s', String(jenuh))}
            </p>
          )}
        </>
      )}
    </section>
  )
}

function Baris({
  langkah,
  puncak,
  locale,
}: {
  readonly langkah: LangkahMarginal
  readonly puncak: number
  readonly locale: Locale
}) {
  const kosong = langkah.tambahanHari === 0
  // Bar width is a share of the best day on the curve, so the shape is readable
  // without an axis. Percentage rather than a fixed pixel count: the rail this
  // sits in is fluid.
  const lebar = puncak === 0 ? 0 : Math.round((langkah.tambahanHari / puncak) * 100)

  return (
    <li className="flex items-center gap-ruang-md">
      <span className="angka w-16 shrink-0 text-sm text-inkPudar">
        {t('kurvaHariKe', locale)}
        {langkah.anggaranHari}
      </span>

      <span className="h-4 min-w-0 flex-1 bg-kertasGelap/60" aria-hidden>
        <span
          className="block h-full bg-liburMerah"
          style={{ width: `${lebar}%` }}
        />
      </span>

      <span className="w-28 shrink-0 text-right text-sm">
        {kosong ? (
          <span className="text-inkPudar">{t('kurvaTidakMenambah', locale)}</span>
        ) : (
          <>
            <span className="text-inkPudar">+</span>
            <span className="angka font-semibold text-liburMerahTeks">{langkah.tambahanHari}</span>{' '}
            <span className="text-inkPudar">{t('ringkasHari', locale)}</span>
          </>
        )}
      </span>
    </li>
  )
}
