'use client'

import { t, type Locale } from '@/lib/i18n'
import type { JenisStatus, Status } from '@/lib/status'
import type { PratinjauStatus } from '@/lib/trace/pratinjau'

/**
 * The status question, asked so that it can actually be answered.
 *
 * Each option carries the number it produces, so a reader who has never heard
 * of the cuti bersama rule can still see what is at stake: three cards say
 * "12 hari" and one says "4 hari". The difference explains itself, which is
 * something no amount of body copy achieves.
 *
 * Invariant 11 still holds — the app is asking, not assuming. And invariant 13:
 * the cards state arithmetic, never a recommendation. Nothing here marks an
 * option as the good one.
 */
export type StatusPickerProps = {
  readonly locale: Locale
  readonly status: Status
  readonly pratinjau: readonly PratinjauStatus[]
  readonly onStatus: (status: Status) => void
}

const RINGKAS: Record<JenisStatus, Parameters<typeof t>[0]> = {
  asn: 'statusAsnRingkas',
  swastaTanpaCutiBersama: 'statusSwastaTanpaRingkas',
  swastaCutiBersamaTanpaPotong: 'statusSwastaTanpaPotongRingkas',
  swastaCutiBersamaDipotong: 'statusSwastaDipotongRingkas',
}

const PANJANG: Record<JenisStatus, Parameters<typeof t>[0]> = {
  asn: 'statusAsn',
  swastaTanpaCutiBersama: 'statusSwastaTanpa',
  swastaCutiBersamaTanpaPotong: 'statusSwastaTanpaPotong',
  swastaCutiBersamaDipotong: 'statusSwastaDipotong',
}

export function StatusPicker({ locale, status, pratinjau, onStatus }: StatusPickerProps) {
  function pilih(jenis: JenisStatus) {
    onStatus(
      jenis === 'asn'
        ? { type: 'asn', jatahHari: status.jatahHari, tidakDiberikanHari: 0 }
        : { type: jenis, jatahHari: status.jatahHari },
    )
  }

  return (
    <section aria-labelledby="judul-status">
      <span className="label-bagian">{t('langkahSatu', locale)}</span>
      <h2 id="judul-status" className="poster mt-0.5 text-2xl">
        {t('statusPertanyaan', locale)}
      </h2>

      <div className="mt-ruang-lg grid gap-ruang-md sm:grid-cols-2 xl:grid-cols-4">
        {pratinjau.map((p) => {
          const terpilih = status.type === p.jenis
          return (
            <button
              key={p.jenis}
              type="button"
              onClick={() => pilih(p.jenis)}
              aria-pressed={terpilih}
              className={`flex flex-col justify-between gap-ruang-md border-2 p-ruang-lg text-left transition-shadow ${
                terpilih
                  ? 'border-ink bg-kertas shadow-angkat'
                  : 'border-garis bg-kertas/60 hover:border-garisTebal hover:shadow-kartu'
              }`}
            >
              <span className="text-sm font-semibold leading-snug">{t(RINGKAS[p.jenis], locale)}</span>

              <span className="block">
                <span
                  className={`angka text-3xl leading-none ${
                    p.dipotongHari > 0 ? 'text-cutiBersamaTeks' : 'text-cutiPribadiTeks'
                  }`}
                >
                  {p.sisaHari}
                </span>{' '}
                <span className="text-xs text-inkPudar">{t('statusSisaJadi', locale)}</span>
                <span className="mt-1 block text-xs leading-snug text-inkPudar">
                  {p.dipotongHari > 0
                    ? `${t('statusDipotongOleh', locale)} −${p.dipotongHari}`
                    : t('statusTidakDipotong', locale)}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="teks-catatan mt-ruang-md text-base">
        <span className="sr-only">{t(PANJANG[status.type], locale)}. </span>
        {t('statusTidakYakin', locale)}
      </p>
    </section>
  )
}
