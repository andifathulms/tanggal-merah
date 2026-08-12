'use client'

import { useMemo } from 'react'
import type { DayNumber } from '@/lib/day'
import type { LeaveTrace } from '@/lib/trace'
import { t, type Locale } from '@/lib/i18n'
import { posisiRunHari, tataLetakTahun } from '@/lib/sheet/layout'
import type { PosisiRun } from './DayCell'
import { MonthBlock } from './MonthBlock'

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
 */
export function YearSheet({ trace, locale, disarankan, onToggle }: YearSheetProps) {
  const blok = useMemo(() => tataLetakTahun(trace.tahun), [trace.tahun])

  const klasifikasi = useMemo(
    () => new Map(trace.terselesaikan.hari.map((h) => [h.hari, h])),
    [trace.terselesaikan],
  )

  const dipilihSendiri = useMemo(() => new Set(trace.dipilihSendiri), [trace.dipilihSendiri])

  const posisiRun = useMemo(() => {
    const libur = new Set<DayNumber>([...trace.terselesaikan.liburHari, ...trace.dipilihSendiri])
    const peta = new Map<DayNumber, PosisiRun>()
    for (const hari of libur) peta.set(hari, posisiRunHari(hari, libur))
    return peta
  }, [trace.terselesaikan, trace.dipilihSendiri])

  return (
    <div>
      <Legenda locale={locale} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          />
        ))}
      </div>
    </div>
  )
}

function Legenda({ locale }: { readonly locale: Locale }) {
  const butir: readonly (readonly [string, string])[] = [
    ['bg-liburMerah', t('legendaLibur', locale)],
    ['bg-cutiBersama', t('legendaCutiBersama', locale)],
    ['bg-cutiPribadi', t('legendaCutiPribadi', locale)],
    ['bg-akhirPekan border border-ink/20', t('legendaAkhirPekan', locale)],
    ['bg-runBar border border-liburMerah/30', t('legendaRun', locale)],
  ]

  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
      {butir.map(([warna, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 ${warna}`} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  )
}
