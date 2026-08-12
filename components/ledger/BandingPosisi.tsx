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
    <section className="border-t border-garis p-ruang-lg" aria-labelledby="judul-banding">
      <h3 id="judul-banding" className="label-bagian">
        {t('bandingJudul', locale)}
      </h3>
      <p className="mt-ruang-md text-sm leading-relaxed text-inkSedang">{t('bandingPenjelasan', locale)}</p>

      {/* For all three private-sector branches every position lands on the same
          number, because the dispute is about ASN. A two-row table of one value
          against itself, followed by a sentence explaining that the rows are
          identical, promises a difference it does not contain — so when the
          positions agree the figure is stated once and the sentence carries the
          rest. The disagreement is still recorded; it is Aturan's job to set out
          both readings in full, and it does. */}
      {sepakat ? (
        <p className="mt-ruang-lg flex flex-wrap items-baseline gap-x-ruang-sm">
          <span className="angka-sebaris text-cutiPribadiTeks">{nilai[0]}</span>
          <span className="text-sm text-inkSedang">{t('bandingSisa', locale)}</span>
        </p>
      ) : (
        <ul className="mt-ruang-lg space-y-ruang-sm">
          {banding.map((b) => (
            <li
              key={`${b.kontradiksiId}-${b.posisiId}`}
              className={`flex items-baseline justify-between gap-ruang-md border-l-4 px-ruang-md py-ruang-sm ${
                b.dipakai ? 'border-cutiPribadi bg-cutiPribadiLembut' : 'border-garisTebal bg-kertasGelap'
              }`}
            >
              <span className="min-w-0 text-sm leading-snug text-inkSedang">
                {b.posisiJudul}
                {b.dipakai && (
                  <span className="label-bagian ml-ruang-sm text-cutiPribadiTeks">
                    {t('bandingDipakai', locale)}
                  </span>
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
      )}

      <p className="teks-catatan mt-ruang-md text-sm">
        {sepakat
          ? t('bandingSepakat', locale)
          : t('bandingSelisih', locale).replace('%s', String(selisih))}
      </p>
    </section>
  )
}
