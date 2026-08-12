'use client'

import { civilOf, type DayNumber } from '@/lib/day'
import type { KlasifikasiHari } from '@/lib/rules/resolve'
import { namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'

/**
 * One cell of the wall calendar.
 *
 * Invariant 15: nothing is computed here. The classification, whether the day
 * sits in a run, and where the run bar's ends fall all arrive as props.
 *
 * Invariant 14: red is the subject. Libur nasional at full strength; cuti
 * bersama in amber because it is a different thing with a different cost;
 * leave green for days the user chooses.
 *
 * The date numeral is set in the poster face at a size a wall calendar would
 * use — it is the thing you scan for. Holiday names sit beneath it in small
 * print, as they are on a real calendar, clamped to two lines so a long name
 * cannot push the grid out of alignment.
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
  /** Show this day's citation in the region below the grid. */
  readonly onPeriksa: (hari: DayNumber) => void
}

export function DayCell({
  hari,
  klasifikasi,
  dipilihSendiri,
  disarankan,
  posisiRun,
  locale,
  onToggle,
  onPeriksa,
}: DayCellProps) {
  const { day } = civilOf(hari)
  const bisaDipilih = klasifikasi.libur === false

  const warnaAngka = dipilihSendiri
    ? 'text-cutiPribadiTeks'
    : klasifikasi.type === 'liburNasional'
      ? 'text-liburMerahTeks'
      : klasifikasi.type === 'cutiBersama' && klasifikasi.libur
        ? 'text-cutiBersamaTeks'
        : klasifikasi.type === 'akhirPekan'
          ? 'text-inkPudar'
          : 'text-ink'

  const label =
    klasifikasi.type === 'liburNasional' || klasifikasi.type === 'cutiBersama'
      ? namaLibur(klasifikasi.entri, locale)
      : null

  const sudut =
    posisiRun === 'tunggal'
      ? 'rounded-bar'
      : posisiRun === 'awal'
        ? 'rounded-l-bar'
        : posisiRun === 'akhir'
          ? 'rounded-r-bar'
          : ''

  /**
   * This cuti bersama day was charged to the reader's annual leave. The ledger
   * already reports how many were charged; marking them here is what turns that
   * total into something they can point at. Under the three branches that
   * deduct nothing, no cell carries the mark.
   *
   * A cuti bersama landing on a Sunday never reaches this branch — the resolver
   * classifies it as a weekend, because it cost nobody anything. Those are
   * counted in the "eaten by the weekend" panel instead.
   */
  const dibebankan = klasifikasi.type === 'cutiBersama' && klasifikasi.dipotong

  const kelas = [
    'sel-hari relative flex min-h-sel flex-col px-1.5 pt-1 pb-1 text-left',
    klasifikasi.type === 'akhirPekan' && !dipilihSendiri ? 'bg-akhirPekan' : '',
    dipilihSendiri ? 'bg-cutiPribadiLembut' : '',
    posisiRun !== 'tidak' ? `bar-run bg-runBar ${sudut}` : '',
    disarankan && !dipilihSendiri ? 'ring-1 ring-inset ring-cutiPribadi/45' : '',
    // Border rather than a fill: a fill would race the run bar for the same
    // background property and the winner would depend on stylesheet order.
    dibebankan ? 'border-l-2 border-cutiBersama' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const isi = (
    <>
      <span className={`flex items-start gap-1 ${dibebankan ? 'justify-between' : 'justify-end'}`}>
        {dibebankan && (
          <span className="angka text-xs font-semibold leading-none text-cutiBersamaTeks">−1</span>
        )}
        <span className={`poster block text-right text-lg leading-none ${warnaAngka}`}>{day}</span>
      </span>
      {label !== null && (
        <span
          className={`mt-auto block overflow-hidden text-right text-2xs ${
            klasifikasi.type === 'liburNasional' ? 'text-liburMerahTeks' : 'text-cutiBersamaTeks'
          }`}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {label}
        </span>
      )}
      {dipilihSendiri && (
        <span className="mt-auto block text-right text-2xs font-semibold leading-none text-cutiPribadiTeks">
          {locale === 'id' ? 'cuti' : 'leave'}
        </span>
      )}
    </>
  )

  if (!bisaDipilih) {
    // A decreed day is not something you can buy, but it is something you can
    // ask about: clicking it names the instrument it came from, in the region
    // below the grid. That also gives the 10px holiday name a real accessible
    // name, which a plain div never had.
    if (label !== null) {
      return (
        <button
          type="button"
          onClick={() => onPeriksa(hari)}
          aria-label={
            dibebankan
              ? `${tanggalPanjang(hari, locale)} — ${label} — ${t('selDipotong', locale)}`
              : `${tanggalPanjang(hari, locale)} — ${label}`
          }
          title={label}
          className={`${kelas} w-full cursor-help text-left hover:bg-kertasGelap/60`}
        >
          {isi}
        </button>
      )
    }

    return <div className={kelas}>{isi}</div>
  }

  // Working days are the only cells you can spend leave on, and they say so on
  // hover: a faint green wash is the affordance that the sheet is something you
  // act on.
  return (
    <button
      type="button"
      onClick={() => onToggle(hari)}
      aria-pressed={dipilihSendiri}
      aria-label={tanggalPanjang(hari, locale)}
      className={`${kelas} w-full cursor-pointer hover:bg-cutiPribadiLembut/70`}
    >
      {isi}
    </button>
  )
}
