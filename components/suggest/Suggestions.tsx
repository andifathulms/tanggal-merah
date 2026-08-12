'use client'

import type { DayNumber } from '@/lib/day'
import type { Jembatan } from '@/lib/optimise'
import type { LeaveTrace } from '@/lib/trace'
import { t, tanggalPanjang, type Locale } from '@/lib/i18n'

/**
 * Ranked bridges with the arithmetic visible (PRD §5.4) — "1 hari → 4 hari
 * libur", set large enough that the trade is readable at a glance.
 *
 * Invariant 13: no advice. This ranks by leverage arithmetic and nothing else.
 * It never recommends taking leave and never says a plan is good. The copy
 * beneath the heading says so out loud, because a ranked list invites being
 * read as a recommendation and it is not one.
 */
export type SuggestionsProps = {
  readonly trace: LeaveTrace
  readonly locale: Locale
  readonly dipilihSendiri: ReadonlySet<DayNumber>
  readonly onAmbil: (jembatan: Jembatan) => void
  readonly onTerapkanOptimal: () => void
  /** Cap the list on the overview; the plan page shows everything. */
  readonly batas?: number
}

export function Suggestions({
  trace,
  locale,
  dipilihSendiri,
  onAmbil,
  onTerapkanOptimal,
  batas,
}: SuggestionsProps) {
  const { rencanaOptimal, saran } = trace
  const tampil = batas === undefined ? saran : saran.slice(0, batas)

  return (
    <section aria-labelledby="judul-saran">
      <span className="label-bagian">{t('langkahTiga', locale)}</span>
      <h2 id="judul-saran" className="poster mt-0.5 text-poster-md">
        {batas === undefined ? t('saranJudul', locale) : t('saranTeratas', locale)}
      </h2>
      <p className="mt-2 max-w-prosa text-[13px] leading-relaxed text-inkPudar">{t('saranPenjelasan', locale)}</p>

      {rencanaOptimal.dipilih.length > 0 && (
        <div className="mt-4 border-2 border-cutiPribadi bg-cutiPribadiLembut/50 p-4">
          <span className="label-bagian text-cutiPribadiTeks">{t('optimalJudul', locale)}</span>
          <p className="mt-1 text-[15px] leading-snug">
            <span className="angka text-2xl text-cutiPribadiTeks">{rencanaOptimal.biayaHari}</span>{' '}
            <span className="text-inkSedang">{t('saranHariCuti', locale)}</span>{' '}
            <span className="text-inkPudar">→</span>{' '}
            <span className="angka text-2xl text-liburMerahTeks">{rencanaOptimal.nilaiHari}</span>{' '}
            <span className="text-inkSedang">{t('optimalNilai', locale)}</span>
          </p>
          {/* The plan's value sums the stretches it joins. Calling that a
              single run would be a confidently wrong claim about someone's
              time off, which is the one thing this project must not do. */}
          {rencanaOptimal.dipilih.length > 1 && (
            <p className="mt-1 text-[11px] text-inkPudar">{t('optimalCatatanRentetan', locale)}</p>
          )}
          <p className="mt-1 text-[11px] text-inkPudar">{t('optimalEksak', locale)}</p>
          <button
            type="button"
            onClick={onTerapkanOptimal}
            className="mt-3 bg-cutiPribadi px-4 py-1.5 text-sm font-semibold text-kertas hover:bg-cutiPribadiTeks"
          >
            {t('optimalTerapkan', locale)}
          </button>
        </div>
      )}

      {tampil.length === 0 ? (
        <p className="mt-4 text-sm text-inkPudar">{t('saranKosong', locale)}</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tampil.map((b) => (
            <KartuJembatan
              key={`${b.mulai}-${b.selesai}`}
              jembatan={b}
              locale={locale}
              sudahDiambil={b.hari.every((d) => dipilihSendiri.has(d))}
              onAmbil={onAmbil}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function KartuJembatan({
  jembatan,
  locale,
  sudahDiambil,
  onAmbil,
}: {
  readonly jembatan: Jembatan
  readonly locale: Locale
  readonly sudahDiambil: boolean
  readonly onAmbil: (jembatan: Jembatan) => void
}) {
  const rentang =
    jembatan.biayaHari === 1
      ? tanggalPanjang(jembatan.mulai, locale)
      : `${tanggalPanjang(jembatan.mulai, locale)} – ${tanggalPanjang(jembatan.selesai, locale)}`

  return (
    <li
      className={`flex items-center justify-between gap-3 border p-3 ${
        sudahDiambil ? 'border-cutiPribadi bg-cutiPribadiLembut/40' : 'border-garis bg-kertas'
      }`}
    >
      <div className="min-w-0">
        {/* The trade, set at a size that reads before the date does. */}
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="angka text-xl text-cutiPribadiTeks">{jembatan.biayaHari}</span>
          <span className="text-[11px] text-inkPudar">{t('saranHariCuti', locale)}</span>
          <span className="text-inkSamar" aria-hidden>
            →
          </span>
          <span className="angka text-xl text-liburMerahTeks">{jembatan.hasilHari}</span>
          <span className="text-[11px] text-inkPudar">{locale === 'id' ? 'hari libur' : 'days off'}</span>
        </p>
        <p className="mt-0.5 truncate text-[12px] text-inkSedang">{rentang}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="angka text-[11px] text-inkPudar" title={t('saranLeverage', locale)}>
          ×{jembatan.leverage.toFixed(1)}
        </span>
        <button
          type="button"
          onClick={() => onAmbil(jembatan)}
          className={`border px-2.5 py-1 text-xs font-semibold ${
            sudahDiambil
              ? 'border-garisTebal text-inkSedang hover:bg-kertasGelap'
              : 'border-cutiPribadi text-cutiPribadiTeks hover:bg-cutiPribadi hover:text-kertas'
          }`}
        >
          {sudahDiambil ? t('saranBatal', locale) : t('saranAmbil', locale)}
        </button>
      </div>
    </li>
  )
}
