'use client'

import { useMemo, useState } from 'react'
import type { DayNumber } from '@/lib/day'
import type { LeaveTrace } from '@/lib/trace'
import { t, type Locale } from '@/lib/i18n'
import { hariRentetanPanjang, posisiRunHari, tataLetakTahun } from '@/lib/sheet/layout'
import type { PosisiRun } from './DayCell'
import { MonthBlock } from './MonthBlock'
import { Kutipan } from './Kutipan'

export type YearSheetProps = {
  readonly trace: LeaveTrace
  readonly locale: Locale
  readonly disarankan: ReadonlySet<DayNumber>
  readonly onToggle: (hari: DayNumber) => void
}

/**
 * Twelve months at a glance, in the layout of an Indonesian wall calendar
 * (PRD §5.1). Runs of consecutive days off draw as a continuous bar across the
 * grid — a bridge day is not one red square, it is the thing that joins two
 * blocks into one stretch.
 *
 * The instruction above the grid matters more than it looks: without it the
 * sheet reads as a picture, and the reader never discovers that the cells are
 * the control.
 */
export function YearSheet({ trace, locale, disarankan, onToggle }: YearSheetProps) {
  const blok = useMemo(() => tataLetakTahun(trace.tahun), [trace.tahun])

  // Which decreed day the reader last asked about. Deliberately not in the URL
  // hash: it is a question, not part of the plan being shared.
  const [diperiksa, setDiperiksa] = useState<DayNumber | null>(null)

  const klasifikasi = useMemo(
    () => new Map(trace.terselesaikan.hari.map((h) => [h.hari, h])),
    [trace.terselesaikan],
  )

  const dipilihSendiri = useMemo(() => new Set(trace.dipilihSendiri), [trace.dipilihSendiri])

  const posisiRun = useMemo(() => {
    const rentetan = hariRentetanPanjang([...trace.terselesaikan.liburHari, ...trace.dipilihSendiri])
    const peta = new Map<DayNumber, PosisiRun>()
    for (const hari of rentetan) peta.set(hari, posisiRunHari(hari, rentetan))
    return peta
  }, [trace.terselesaikan, trace.dipilihSendiri])

  return (
    <section aria-labelledby="judul-sheet">
      <div className="flex flex-wrap items-end justify-between gap-x-ruang-xl gap-y-ruang-sm">
        <div>
          <span className="label-bagian">{t('langkahTiga', locale)}</span>
          <h2 id="judul-sheet" className="poster mt-0.5 text-2xl">
            {t('sheetJudul', locale)} <span className="angka text-liburMerahTeks">{trace.tahun}</span>
          </h2>
        </div>
        <Legenda locale={locale} adaDipotong={trace.ledger.entitlement.dipotongCutiBersamaHari > 0} />
      </div>

      <p className="teks-jelas mt-ruang-sm">{t('sheetPetunjuk', locale)}</p>

      <div className="mt-ruang-lg grid grid-cols-1 gap-ruang-md sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {blok.map((b) => (
          <MonthBlock
            key={b.month}
            blok={b}
            tahun={trace.tahun}
            locale={locale}
            klasifikasi={klasifikasi}
            dipilihSendiri={dipilihSendiri}
            disarankan={disarankan}
            posisiRun={posisiRun}
            onToggle={onToggle}
            onPeriksa={setDiperiksa}
          />
        ))}
      </div>

      <Kutipan klasifikasi={diperiksa === null ? null : klasifikasi.get(diperiksa) ?? null} locale={locale} />
    </section>
  )
}

function Legenda({ locale, adaDipotong }: { readonly locale: Locale; readonly adaDipotong: boolean }) {
  const butir: readonly (readonly [string, string])[] = [
    ['bg-liburMerah', t('legendaLibur', locale)],
    ['bg-cutiBersama', t('legendaCutiBersama', locale)],
    // Only shown when this reader's status actually charges cuti bersama; for
    // the other three branches no cell carries the mark and a legend entry for
    // it would be describing something that is not on the page.
    ...(adaDipotong
      ? ([['bg-cutiBersamaTeks', t('legendaDipotong', locale)]] as const)
      : ([] as const)),
    ['bg-cutiPribadi', t('legendaCutiPribadi', locale)],
    ['bg-akhirPekan border border-garisTebal', t('legendaAkhirPekan', locale)],
    ['bg-runBarKuat border border-liburMerah', t('legendaRun', locale)],
  ]

  return (
    <ul className="flex flex-wrap gap-x-ruang-lg gap-y-1 text-sm text-inkSedang">
      {butir.map(([warna, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 shrink-0 ${warna}`} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  )
}
