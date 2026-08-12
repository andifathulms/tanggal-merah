'use client'

import { civilOf, type DayNumber } from '@/lib/day'
import type { KlasifikasiHari } from '@/lib/rules/resolve'
import { namaLibur, type Locale } from '@/lib/i18n'

/**
 * One cell of the wall calendar.
 *
 * Invariant 15: nothing is computed here. The classification, whether the day
 * sits in a run, and where the run bar's ends fall all arrive as props.
 *
 * Invariant 14: red is the subject. Libur nasional at full strength; cuti
 * bersama in amber because it is a different thing with a different cost;
 * leave green for days the user chooses.
 */

export type PosisiRun = 'tidak' | 'awal' | 'tengah' | 'akhir' | 'tunggal'

export type DayCellProps = {
  readonly hari: DayNumber
  readonly klasifikasi: KlasifikasiHari
  readonly dipilihSendiri: boolean
  readonly disarankan: boolean
  readonly posisiRun: PosisiRun
  readonly locale: Locale
  readonly onToggle: (hari: DayNumber) => void
}

export function DayCell({
  hari,
  klasifikasi,
  dipilihSendiri,
  disarankan,
  posisiRun,
  locale,
  onToggle,
}: DayCellProps) {
  const { day } = civilOf(hari)
  const bisaDipilih = klasifikasi.libur === false

  const warnaAngka = dipilihSendiri
    ? 'text-cutiPribadi'
    : klasifikasi.type === 'liburNasional'
      ? 'text-liburMerah'
      : klasifikasi.type === 'cutiBersama' && klasifikasi.libur
        ? 'text-cutiBersama'
        : klasifikasi.type === 'akhirPekan'
          ? 'text-ink/45'
          : 'text-ink'

  const label =
    klasifikasi.type === 'liburNasional' || klasifikasi.type === 'cutiBersama'
      ? namaLibur(klasifikasi.entri, locale)
      : null

  const isi = (
    <>
      <span className={`angka block text-right text-[13px] leading-none ${warnaAngka}`}>{day}</span>
      {label !== null && (
        <span
          className={`mt-0.5 block text-right text-[8px] leading-[1.15] ${
            klasifikasi.type === 'liburNasional' ? 'text-liburMerah/85' : 'text-cutiBersama/90'
          }`}
        >
          {label}
        </span>
      )}
      {dipilihSendiri && (
        <span className="mt-0.5 block text-right text-[8px] leading-none text-cutiPribadi">
          {locale === 'id' ? 'cuti' : 'leave'}
        </span>
      )}
    </>
  )

  const sudut =
    posisiRun === 'tunggal'
      ? 'rounded-[3px]'
      : posisiRun === 'awal'
        ? 'rounded-l-[3px]'
        : posisiRun === 'akhir'
          ? 'rounded-r-[3px]'
          : ''

  const kelas = [
    'bar-run relative min-h-[46px] px-1 pt-1 pb-0.5 text-left align-top',
    klasifikasi.type === 'akhirPekan' && !dipilihSendiri ? 'bg-akhirPekan/60' : '',
    posisiRun !== 'tidak' ? `bg-runBar ${sudut}` : '',
    dipilihSendiri ? 'ring-1 ring-inset ring-cutiPribadi/60' : '',
    disarankan && !dipilihSendiri ? 'ring-1 ring-inset ring-cutiPribadi/30' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!bisaDipilih) {
    return <div className={kelas}>{isi}</div>
  }

  return (
    <button
      type="button"
      onClick={() => onToggle(hari)}
      aria-pressed={dipilihSendiri}
      className={`${kelas} w-full cursor-pointer hover:bg-cutiPribadi/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cutiPribadi`}
    >
      {isi}
    </button>
  )
}
