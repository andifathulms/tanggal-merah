'use client'

import type { DayNumber } from '@/lib/day'
import type { KlasifikasiHari } from '@/lib/rules/resolve'
import { namaBulan, namaHariPendek, type Locale } from '@/lib/i18n'
import type { BlokBulan } from '@/lib/sheet/layout'
import { DayCell, type PosisiRun } from './DayCell'

export type MonthBlockProps = {
  readonly blok: BlokBulan
  readonly tahun: number
  readonly locale: Locale
  readonly klasifikasi: ReadonlyMap<DayNumber, KlasifikasiHari>
  readonly dipilihSendiri: ReadonlySet<DayNumber>
  readonly disarankan: ReadonlySet<DayNumber>
  readonly posisiRun: ReadonlyMap<DayNumber, PosisiRun>
  readonly onToggle: (hari: DayNumber) => void
}

export function MonthBlock({
  blok,
  tahun,
  locale,
  klasifikasi,
  dipilihSendiri,
  disarankan,
  posisiRun,
  onToggle,
}: MonthBlockProps) {
  return (
    <section className="border border-ink/15 bg-newsprint" aria-label={`${namaBulan(blok.month, locale)} ${tahun}`}>
      <h3 className="poster border-b border-ink/15 px-2 py-1 text-lg leading-none text-ink">
        {namaBulan(blok.month, locale)}
      </h3>

      <div className="grid grid-cols-7 border-b border-ink/10">
        {[0, 1, 2, 3, 4, 5, 6].map((w) => (
          <div
            key={w}
            className={`px-1 py-1 text-center text-[9px] uppercase tracking-wide ${
              w === 0 ? 'text-liburMerah' : 'text-ink/50'
            }`}
          >
            {namaHariPendek(w, locale)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {blok.minggu.flat().map((sel, i) => {
          if (sel.hari === null) return <div key={`kosong-${i}`} className="min-h-[46px]" />
          const k = klasifikasi.get(sel.hari)
          if (k === undefined) return <div key={`kosong-${i}`} className="min-h-[46px]" />
          return (
            <DayCell
              key={sel.hari}
              hari={sel.hari}
              klasifikasi={k}
              dipilihSendiri={dipilihSendiri.has(sel.hari)}
              disarankan={disarankan.has(sel.hari)}
              posisiRun={posisiRun.get(sel.hari) ?? 'tidak'}
              locale={locale}
              onToggle={onToggle}
            />
          )
        })}
      </div>
    </section>
  )
}
