'use client'

import { t, type Locale } from '@/lib/i18n'
import { posisiSepakat, type BandingPosisi as Banding } from '@/lib/trace/posisi'

/**
 * A3 — the reading the app rejected, priced.
 *
 * The contradiction ledger has always recorded that this rule is reported both
 * ways in public. It recorded it in prose, which leaves a reader adjudicating two
 * documents on the strength of a website's assertion. Two numbers side by side
 * make the stakes legible, and make the app's own choice checkable rather than
 * merely asserted — which is the strongest form of the citation ethos available
 * without a server.
 *
 * Invariant 12: the disagreement is recorded, not silently resolved. Invariant
 * 13: these are figures. Nothing here argues for a reading, and the used one is
 * marked as used rather than as correct.
 */
export function BandingPosisi({
  banding,
  locale,
}: {
  readonly banding: readonly Banding[]
  readonly locale: Locale
}) {
  if (banding.length === 0) return null

  const sepakat = posisiSepakat(banding)
  const nilai = banding.map((b) => b.sisaHari)
  const selisih = Math.max(...nilai) - Math.min(...nilai)

  return (
    <section className="kartu p-ruang-lg" aria-labelledby="judul-banding">
      <h2 id="judul-banding" className="poster text-xl">
        {t('bandingJudul', locale)}
      </h2>
      <p className="mt-ruang-md text-sm leading-relaxed text-inkSedang">{t('bandingPenjelasan', locale)}</p>

      <ul className="mt-ruang-lg space-y-ruang-sm">
        {banding.map((b) => (
          <li
            key={`${b.kontradiksiId}-${b.posisiId}`}
            className={`flex items-baseline justify-between gap-ruang-md border-l-4 px-ruang-md py-ruang-sm ${
              b.dipakai ? 'border-cutiPribadi bg-cutiPribadiLembut/40' : 'border-garisTebal bg-kertasGelap/40'
            }`}
          >
            <span className="min-w-0 text-sm leading-snug text-inkSedang">
              {b.posisiJudul}
              {b.dipakai && (
                <span className="label-bagian ml-ruang-sm text-cutiPribadiTeks">{t('bandingDipakai', locale)}</span>
              )}
            </span>
            <span className="shrink-0 whitespace-nowrap">
              <span className={`angka-sebaris ${b.dipakai ? 'text-cutiPribadiTeks' : 'text-inkPudar'}`}>
                {b.sisaHari}
              </span>{' '}
              <span className="text-xs text-inkPudar">{t('ringkasHari', locale)}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Most readers are not affected by this dispute at all, and saying so is
          better than letting a panel of numbers imply that they are. */}
      <p className="teks-catatan mt-ruang-md text-sm">
        {sepakat
          ? t('bandingSepakat', locale)
          : t('bandingSelisih', locale).replace('%s', String(selisih))}
      </p>
    </section>
  )
}
