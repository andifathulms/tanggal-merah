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
          {/* Two mutually exclusive answers, so radios rather than a pair of
              `aria-pressed` buttons. The full description was in a `title`, which
              is mouse-only and inconsistently announced; it is the radio's own
              label now, with the short form shown. */}
          <div className="mt-1.5 grid grid-cols-2 border border-garisTebal">
            {(['lima-hari', 'enam-hari'] as const).map((p) => (
              <label key={p} className="block cursor-pointer">
                <input
                  type="radio"
                  name="pola-kerja"
                  value={p}
                  checked={pattern === p}
                  onChange={() => onPattern(p)}
                  className="peer sr-only"
                />
                <span
                  className={`kartu-pilihan block px-ruang-sm py-ruang-sm text-center text-xs ${
                    pattern === p
                      ? 'bg-ink font-semibold text-kertas'
                      : 'bg-kertas text-inkSedang hover:bg-kertasGelap'
                  }`}
                >
                  <span className="sr-only">{t(p === 'lima-hari' ? 'polaLima' : 'polaEnam', locale)}</span>
                  <span aria-hidden>{t(p === 'lima-hari' ? 'polaLimaRingkas' : 'polaEnamRingkas', locale)}</span>
                </span>
              </label>
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
