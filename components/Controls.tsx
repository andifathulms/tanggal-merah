'use client'

import type { WorkPattern } from '@/lib/day/pattern'
import { t, type Locale } from '@/lib/i18n'
import type { JenisStatus, Status } from '@/lib/status'

/**
 * Employment status is asked up front because it changes the arithmetic more
 * than anything else (PRD §5.2), and work pattern because many Indonesians
 * work Saturdays and every long-weekend calculation changes if they do (§5.3).
 *
 * Invariant 11: company policy is user-stated, never assumed.
 */
export type ControlsProps = {
  readonly locale: Locale
  readonly tahun: number
  readonly tahunTersedia: readonly number[]
  readonly status: Status
  readonly pattern: WorkPattern
  readonly onTahun: (tahun: number) => void
  readonly onStatus: (status: Status) => void
  readonly onPattern: (pattern: WorkPattern) => void
}

const PILIHAN_STATUS: readonly (readonly [JenisStatus, Parameters<typeof t>[0]])[] = [
  ['asn', 'statusAsn'],
  ['swastaTanpaCutiBersama', 'statusSwastaTanpa'],
  ['swastaCutiBersamaTanpaPotong', 'statusSwastaTanpaPotong'],
  ['swastaCutiBersamaDipotong', 'statusSwastaDipotong'],
]

export function Controls({
  locale,
  tahun,
  tahunTersedia,
  status,
  pattern,
  onTahun,
  onStatus,
  onPattern,
}: ControlsProps) {
  function gantiJenis(jenis: JenisStatus) {
    onStatus(
      jenis === 'asn'
        ? { type: 'asn', jatahHari: status.jatahHari, tidakDiberikanHari: 0 }
        : { type: jenis, jatahHari: status.jatahHari },
    )
  }

  function gantiJatah(jatahHari: number) {
    onStatus(
      status.type === 'asn'
        ? { type: 'asn', jatahHari, tidakDiberikanHari: status.tidakDiberikanHari }
        : { type: status.type, jatahHari },
    )
  }

  return (
    <section className="border border-ink/20 bg-newsprint p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
            {t('navTahun', locale)}
          </span>
          <select
            value={tahun}
            onChange={(e) => onTahun(Number(e.target.value))}
            className="angka mt-1 w-full border border-ink/25 bg-newsprint px-2 py-1 text-sm"
          >
            {tahunTersedia.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
            {t('polaJudul', locale)}
          </span>
          <select
            value={pattern}
            onChange={(e) => onPattern(e.target.value as WorkPattern)}
            className="mt-1 w-full border border-ink/25 bg-newsprint px-2 py-1 text-sm"
          >
            <option value="lima-hari">{t('polaLima', locale)}</option>
            <option value="enam-hari">{t('polaEnam', locale)}</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink/60">
          {t('statusJudul', locale)}
        </legend>
        <p className="mt-1 text-xs text-ink/55">{t('statusTanya', locale)}</p>
        <div className="mt-2 space-y-1">
          {PILIHAN_STATUS.map(([jenis, kunci]) => (
            <label key={jenis} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value={jenis}
                checked={status.type === jenis}
                onChange={() => gantiJenis(jenis)}
                className="mt-1 accent-liburMerah"
              />
              <span>{t(kunci, locale)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
            {t('jatahJudul', locale)}
          </span>
          <input
            type="number"
            min={0}
            max={365}
            value={status.jatahHari}
            onChange={(e) => gantiJatah(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
            className="angka mt-1 w-full border border-ink/25 bg-newsprint px-2 py-1 text-sm"
          />
        </label>

        {status.type === 'asn' && (
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink/60">
              {t('tidakDiberikanJudul', locale)}
            </span>
            <input
              type="number"
              min={0}
              max={365}
              value={status.tidakDiberikanHari}
              onChange={(e) =>
                onStatus({
                  type: 'asn',
                  jatahHari: status.jatahHari,
                  tidakDiberikanHari: Math.max(0, Math.min(365, Number(e.target.value) || 0)),
                })
              }
              className="angka mt-1 w-full border border-ink/25 bg-newsprint px-2 py-1 text-sm"
            />
            <span className="mt-1 block text-xs text-ink/55">{t('tidakDiberikanBantu', locale)}</span>
          </label>
        )}
      </div>
    </section>
  )
}
