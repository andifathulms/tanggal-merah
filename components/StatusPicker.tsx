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
    /* A fieldset, because this is one question with four mutually exclusive
       answers. It used to be four buttons carrying `aria-pressed`, which
       announces independent on/off state — a reader heard "not pressed" with no
       idea how many options existed or which was current (WCAG 4.1.2). Native
       radios announce "3 of 4, selected" and bring arrow-key navigation for free.

       The heading lives inside the legend rather than beside it, so the group is
       named once. A <section aria-labelledby> around a <fieldset> with a <legend>
       would have named the same question twice. */
    <fieldset>
      {/* <legend> permits heading content, so the h2 stays inside it: the group
          gets its accessible name and the page keeps the heading a reader
          navigating by heading was using to find this step. */}
      <legend className="mb-ruang-lg">
        <span className="label-bagian">{t('langkahSatu', locale)}</span>
        <h2 className="poster mt-0.5 text-2xl text-ink">{t('statusPertanyaan', locale)}</h2>
      </legend>

      <div className="grid gap-ruang-md sm:grid-cols-2 xl:grid-cols-4">
        {pratinjau.map((p) => {
          const terpilih = status.type === p.jenis
          return (
            <label key={p.jenis} className="block cursor-pointer">
              <input
                type="radio"
                name="status-kepegawaian"
                value={p.jenis}
                checked={terpilih}
                onChange={() => pilih(p.jenis)}
                className="peer sr-only"
              />
              <span
                className={`kartu-pilihan flex h-full flex-col justify-between gap-ruang-md border-2 p-ruang-lg text-left transition-shadow ${
                  terpilih
                    ? 'border-ink bg-kertas shadow-angkat'
                    : 'border-garis bg-newsprint hover:border-garisTebal hover:shadow-kartu'
                }`}
              >
                <span className="text-sm font-semibold leading-snug">{t(RINGKAS[p.jenis], locale)}</span>

                <span className="block">
                  <span
                    className={`angka-bagian ${
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
              </span>
            </label>
          )
        })}
      </div>

      {/* Not redundant with the radio labels, which carry only the short form.
          This is what the selected status actually means, in full. */}
      <p className="teks-catatan mt-ruang-md text-base">
        <span className="sr-only">{t(PANJANG[status.type], locale)}. </span>
        {t('statusTidakYakin', locale)}
      </p>
    </fieldset>
  )
}
