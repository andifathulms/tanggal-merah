'use client'

import type { DayNumber } from '@/lib/day'
import type { Jembatan } from '@/lib/optimise'
import type { LeaveTrace } from '@/lib/trace'
import { t, tanggalPanjang, type Locale } from '@/lib/i18n'

/**
 * Ranked bridges with the arithmetic visible (PRD §5.4) — "1 hari → 4 hari
 * libur", and the leverage figure beside it.
 *
 * Invariant 13: no advice. This ranks by leverage arithmetic and nothing else.
 * It never recommends taking leave and never says a plan is good.
 */
export type SuggestionsProps = {
  readonly trace: LeaveTrace
  readonly locale: Locale
  readonly dipilihSendiri: ReadonlySet<DayNumber>
  readonly onAmbil: (jembatan: Jembatan) => void
  readonly onTerapkanOptimal: () => void
}

export function Suggestions({ trace, locale, dipilihSendiri, onAmbil, onTerapkanOptimal }: SuggestionsProps) {
  const { rencanaOptimal, saran } = trace

  return (
    <div className="space-y-4">
      <section className="border border-ink/20 bg-newsprint p-4" aria-label={t('optimalJudul', locale)}>
        <h2 className="poster text-xl leading-none">{t('optimalJudul', locale)}</h2>

        {rencanaOptimal.dipilih.length === 0 ? (
          <p className="mt-2 text-sm text-ink/70">{t('optimalKosong', locale)}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-ink/80">
              <span className="angka">{rencanaOptimal.biayaHari}</span> {t('saranHariCuti', locale)}{' '}
              {t('saranJadi', locale)} <span className="angka">{rencanaOptimal.nilaiHari}</span>{' '}
              {t('saranHariLibur', locale)}.
            </p>
            <p className="mt-1 text-xs text-ink/55">{t('optimalEksak', locale)}</p>
            <button
              type="button"
              onClick={onTerapkanOptimal}
              className="mt-3 border border-cutiPribadi px-3 py-1 text-sm text-cutiPribadi hover:bg-cutiPribadi hover:text-newsprint focus:outline-none focus-visible:ring-2 focus-visible:ring-cutiPribadi"
            >
              {t('optimalTerapkan', locale)}
            </button>
          </>
        )}
      </section>

      <section className="border border-ink/20 bg-newsprint p-4" aria-label={t('saranJudul', locale)}>
        <h2 className="poster text-xl leading-none">{t('saranJudul', locale)}</h2>

        {saran.length === 0 ? (
          <p className="mt-2 text-sm text-ink/70">{t('saranKosong', locale)}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {saran.slice(0, 12).map((b) => (
              <BarisJembatan
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
    </div>
  )
}

function BarisJembatan({
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
    <li className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink/20 pb-2">
      <div className="min-w-0">
        <p className="text-sm">
          <span className="angka text-cutiPribadi">{jembatan.biayaHari}</span>{' '}
          <span className="text-ink/70">{t('saranHariCuti', locale)}</span>{' '}
          <span className="text-ink/50">→</span>{' '}
          <span className="angka text-liburMerah">{jembatan.hasilHari}</span>{' '}
          <span className="text-ink/70">{t('saranHariLibur', locale)}</span>
        </p>
        <p className="text-xs text-ink/55">{rentang}</p>
      </div>

      <div className="flex shrink-0 items-baseline gap-3">
        <span className="angka text-xs text-ink/60" title={t('saranLeverage', locale)}>
          ×{jembatan.leverage.toFixed(1)}
        </span>
        <button
          type="button"
          onClick={() => onAmbil(jembatan)}
          className={`border px-2 py-0.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-cutiPribadi ${
            sudahDiambil
              ? 'border-ink/30 text-ink/60 hover:bg-ink/5'
              : 'border-cutiPribadi text-cutiPribadi hover:bg-cutiPribadi hover:text-newsprint'
          }`}
        >
          {sudahDiambil ? t('saranBatal', locale) : t('saranAmbil', locale)}
        </button>
      </div>
    </li>
  )
}
