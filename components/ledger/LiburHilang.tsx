'use client'

import { namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'
import { fromIsoDate } from '@/lib/day'
import type { RingkasanHilang } from '@/lib/rules/hilang'

/**
 * A1 — the value the calendar's colour hides.
 *
 * A libur nasional on a Sunday is coloured exactly like one on a Wednesday and
 * is worth nothing. The sheet cannot say that, because the sheet's job is to
 * show what the SKB decreed; this panel says what it came to.
 *
 * The second line is the one worth reading twice: the same pack loses a
 * different number of days depending on whether the reader works Saturdays. One
 * red square, two values, no rule changed between them — which is the app's
 * whole idea in a single figure.
 *
 * Invariant 15: every number arrives computed, from `lib/rules/hilang`.
 * Invariant 13: no advice, and no complaint either. It reports arithmetic.
 */
export function LiburHilang({
  hilang,
  locale,
}: {
  readonly hilang: RingkasanHilang
  readonly locale: Locale
}) {
  const {
    liburNasionalHari,
    liburNasionalDiAkhirPekanHari,
    liburNasionalMenambahHari,
    cutiBersamaDiAkhirPekanHari,
    liburNasionalDiAkhirPekanPolaLainHari,
    liburNasionalDiAkhirPekan,
    pattern,
  } = hilang

  const samaSaja = liburNasionalDiAkhirPekanHari === liburNasionalDiAkhirPekanPolaLainHari

  return (
    <section className="border-t border-garis p-ruang-lg" aria-labelledby="judul-hilang">
      <h3 id="judul-hilang" className="label-bagian">
        {t('hilangJudul', locale)}
      </h3>

      <p className="mt-ruang-md text-sm leading-relaxed text-inkSedang">
        {t('hilangDari', locale)}{' '}
        <span className="angka font-semibold text-ink">{liburNasionalHari}</span>{' '}
        {t('hilangLiburNasional', locale)},{' '}
        <span className="angka font-semibold text-inkSedang">{liburNasionalDiAkhirPekanHari}</span>{' '}
        {t('hilangJatuhAkhirPekan', locale)}
      </p>

      {/* The figure that survives, stated as a figure rather than left as a
          subtraction for the reader to do. */}
      <p className="mt-ruang-md flex flex-wrap items-baseline gap-x-ruang-sm border-t border-garis pt-ruang-md">
        <span className="angka-sebaris text-liburMerahTeks">{liburNasionalMenambahHari}</span>
        <span className="text-sm text-inkSedang">{t('hilangMenambah', locale)}</span>
      </p>

      {/* Named, not just counted. And the reason they cannot be found on the grid
          is said out loud: the resolver draws a holiday landing on a day already off
          as an ordinary weekend, so a reader who went looking for these would have
          come back empty-handed and reasonably concluded the number was wrong. */}
      {liburNasionalDiAkhirPekan.length > 0 && (
        <div className="mt-ruang-md">
          <span className="label-bagian">{t('hilangYangMana', locale)}</span>
          <ul className="mt-1 space-y-1 text-sm leading-snug text-inkSedang">
            {liburNasionalDiAkhirPekan.map((entri) => (
              <li key={entri.tanggal}>
                <span className="angka text-inkPudar">
                  {tanggalPanjang(fromIsoDate(entri.tanggal), locale)}
                </span>{' '}
                — {namaLibur(entri, locale)}
              </li>
            ))}
          </ul>
          <p className="mt-ruang-sm text-sm leading-relaxed text-inkPudar">
            {t('hilangTidakDitandai', locale)}
          </p>
        </div>
      )}

      {cutiBersamaDiAkhirPekanHari > 0 && (
        <p className="mt-ruang-md text-sm leading-relaxed text-cutiBersamaTeks">
          <span className="angka font-semibold">{cutiBersamaDiAkhirPekanHari}</span>{' '}
          {t('hilangCutiBersamaAkhirPekan', locale)}
        </p>
      )}

      {/* The asymmetry. Same dates, different working week, different answer. */}
      <p className="mt-ruang-md border-t border-garis pt-ruang-md text-sm leading-relaxed text-inkPudar">
        {samaSaja ? (
          t('hilangSamaSaja', locale)
        ) : (
          <>
            {t(pattern === 'lima-hari' ? 'hilangPolaLima' : 'hilangPolaEnam', locale)}{' '}
            <span className="angka font-semibold text-inkSedang">{liburNasionalDiAkhirPekanPolaLainHari}</span>{' '}
            {t('hilangPolaAkhiran', locale)}
          </>
        )}
      </p>
    </section>
  )
}
