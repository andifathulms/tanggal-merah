'use client'

import { t, type Locale } from '@/lib/i18n'
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
    pattern,
  } = hilang

  const samaSaja = liburNasionalDiAkhirPekanHari === liburNasionalDiAkhirPekanPolaLainHari

  return (
    <section className="kartu p-ruang-lg" aria-labelledby="judul-hilang">
      <h2 id="judul-hilang" className="poster text-xl">
        {t('hilangJudul', locale)}
      </h2>

      <p className="mt-ruang-md text-sm leading-relaxed text-inkSedang">
        {t('hilangDari', locale)}{' '}
        <span className="angka font-semibold text-ink">{liburNasionalHari}</span>{' '}
        {t('hilangLiburNasional', locale)},{' '}
        <span className="angka text-lg font-semibold text-inkPudar">{liburNasionalDiAkhirPekanHari}</span>{' '}
        {t('hilangJatuhAkhirPekan', locale)}
      </p>

      {/* The figure that survives, stated as a figure rather than left as a
          subtraction for the reader to do. */}
      <p className="mt-ruang-md flex flex-wrap items-baseline gap-x-ruang-sm border-t border-garis pt-ruang-md">
        <span className="angka text-3xl leading-none text-liburMerahTeks">{liburNasionalMenambahHari}</span>
        <span className="text-sm text-inkSedang">{t('hilangMenambah', locale)}</span>
      </p>

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
