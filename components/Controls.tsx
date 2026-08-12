'use client'

import type { WorkPattern } from '@/lib/day/pattern'
import { t, type Locale } from '@/lib/i18n'
import type { Status } from '@/lib/status'

/**
 * The secondary inputs — year, working week, entitlement size.
 *
 * Employment status used to live here as a four-option radio group and is now
 * its own step (`StatusPicker`), because it is the question that changes the
 * answer most and it needed room to explain itself. What is left is genuinely
 * settings-shaped, so it reads as a compact rail rather than a form to fill in
 * before anything happens.
 *
 * Work pattern is a segmented control rather than a select: two options, both
 * worth seeing at once, and it is not a setting most planners even offer.
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
  function gantiJatah(jatahHari: number) {
    onStatus(
      status.type === 'asn'
        ? { type: 'asn', jatahHari, tidakDiberikanHari: status.tidakDiberikanHari }
        : { type: status.type, jatahHari },
    )
  }

  return (
    <section className="kartu p-ruang-lg">
      <h2 className="label-bagian">{locale === 'id' ? 'Pengaturan' : 'Settings'}</h2>

      <div className="mt-ruang-md space-y-ruang-lg">
        {tahunTersedia.length > 1 && (
          <label className="block">
            <span className="text-xs font-semibold text-inkSedang">{t('navTahun', locale)}</span>
            <select
              value={tahun}
              onChange={(e) => onTahun(Number(e.target.value))}
              className="angka mt-1 w-full border border-garisTebal bg-kertas px-ruang-sm py-1.5 text-sm"
            >
              {tahunTersedia.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset>
          <legend className="text-xs font-semibold text-inkSedang">{t('polaJudul', locale)}</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-0 border border-garisTebal">
            {(['lima-hari', 'enam-hari'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPattern(p)}
                aria-pressed={pattern === p}
                title={t(p === 'lima-hari' ? 'polaLima' : 'polaEnam', locale)}
                className={`px-ruang-sm py-ruang-sm text-xs ${
                  pattern === p ? 'bg-ink font-semibold text-kertas' : 'bg-kertas text-inkSedang hover:bg-kertasGelap'
                }`}
              >
                {t(p === 'lima-hari' ? 'polaLimaRingkas' : 'polaEnamRingkas', locale)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-inkPudar">{t('polaKeterangan', locale)}</p>
        </fieldset>

        <label className="block">
          <span className="text-xs font-semibold text-inkSedang">{t('jatahJudul', locale)}</span>
          <div className="mt-1 flex items-center gap-ruang-sm">
            <input
              type="number"
              min={0}
              max={365}
              value={status.jatahHari}
              onChange={(e) => gantiJatah(Math.max(0, Math.min(365, Number(e.target.value) || 0)))}
              className="angka w-20 border border-garisTebal bg-kertas px-ruang-sm py-1.5 text-sm"
            />
            <span className="text-xs text-inkPudar">{t('jatahSatuan', locale)}</span>
          </div>
        </label>

        {status.type === 'asn' && (
          <label className="block">
            <span className="text-xs font-semibold text-inkSedang">{t('tidakDiberikanJudul', locale)}</span>
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
              className="angka mt-1 w-20 border border-garisTebal bg-kertas px-ruang-sm py-1.5 text-sm"
            />
            <span className="mt-1 block text-sm leading-relaxed text-inkPudar">
              {t('tidakDiberikanBantu', locale)}
            </span>
          </label>
        )}
      </div>
    </section>
  )
}
