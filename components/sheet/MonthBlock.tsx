'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { DayNumber } from '@/lib/day'
import type { KlasifikasiHari } from '@/lib/rules/resolve'
import { namaBulan, namaHariPendek, type Locale } from '@/lib/i18n'
import type { BlokBulan } from '@/lib/sheet/layout'
import { DayCell, type PosisiRun } from './DayCell'

/**
 * One month of the wall calendar, as a keyboard-navigable grid.
 *
 * It used to be twenty-odd plain tab stops. Twelve of these on a page meant a
 * keyboard user pressed Tab 264 times to cross the sheet — and every control in
 * the settings rail sits *after* all of it in focus order, so switching from a
 * five- to a six-day week meant traversing the entire year to get there.
 *
 * This is the composite-widget pattern: one tab stop per month, arrow keys inside
 * it. Tab moves month to month, Left/Right move a day, Up/Down move a week, Home
 * and End go to the ends of the printed week, Ctrl+Home and Ctrl+End to the ends of
 * the month. A roving `tabIndex` keeps exactly one cell of this month in the tab
 * sequence.
 *
 * `role="grid"`/`row`/`columnheader`/`gridcell` is the one place in this app where
 * a role earns its keep. There is no native element for a calendar grid, and a
 * <table> of buttons would still be one tab stop per button. The role is what tells
 * a screen reader that arrow keys mean something here, and it supplies the row and
 * column position that says where in the month the reader has got to — which the
 * weekday column heads could never do, because nothing associated them with the
 * cells.
 *
 * Invariant 15 holds. The month's shape arrives from `lib/sheet/layout`; what is
 * worked out here is which cell holds focus, which is view state and not domain
 * arithmetic.
 */

export type MonthBlockProps = {
  readonly blok: BlokBulan
  readonly tahun: number
  readonly locale: Locale
  readonly klasifikasi: ReadonlyMap<DayNumber, KlasifikasiHari>
  readonly dipilihSendiri: ReadonlySet<DayNumber>
  readonly disarankan: ReadonlySet<DayNumber>
  readonly posisiRun: ReadonlyMap<DayNumber, PosisiRun>
  readonly onToggle: (hari: DayNumber) => void
  readonly onPeriksa: (hari: DayNumber) => void
  /** The instruction saying what the cells do, described to the grid as a whole. */
  readonly petunjukId: string
}

const HARI_MINGGU = [0, 1, 2, 3, 4, 5, 6] as const

export function MonthBlock({
  blok,
  tahun,
  locale,
  klasifikasi,
  dipilihSendiri,
  disarankan,
  posisiRun,
  onToggle,
  onPeriksa,
  petunjukId,
}: MonthBlockProps) {
  const idJudul = `bulan-${tahun}-${blok.month}`
  const gridRef = useRef<HTMLDivElement>(null)

  /**
   * Every real day of the month in reading order, and where each sits in its
   * printed week. The leading blanks matter: Home has to mean the start of the
   * week as drawn, not the seventh day back.
   */
  const sel = useMemo(() => {
    const out: { readonly hari: DayNumber; readonly kolom: number }[] = []
    for (const minggu of blok.minggu) {
      for (let k = 0; k < minggu.length; k += 1) {
        const h = minggu[k]?.hari
        if (h !== null && h !== undefined) out.push({ hari: h, kolom: k })
      }
    }
    return out
  }, [blok])

  // Which cell holds this month's single tab stop. Null until the reader moves, so
  // the month opens on its first day.
  const [aktif, setAktif] = useState<DayNumber | null>(null)
  const aktifSekarang = aktif ?? sel[0]?.hari ?? null

  const pindah = useCallback((ke: DayNumber | undefined) => {
    if (ke === undefined) return
    setAktif(ke)
    // A cell is a button on an actionable day and a plain gridcell otherwise, so
    // it is found by the day it carries rather than by element type.
    gridRef.current?.querySelector<HTMLElement>(`[data-hari="${ke}"]`)?.focus()
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (aktifSekarang === null) return
      const i = sel.findIndex((s) => s.hari === aktifSekarang)
      if (i === -1) return

      const kolom = sel[i]?.kolom ?? 0
      const akhir = sel.length - 1

      const tujuan: Record<string, () => DayNumber | undefined> = {
        ArrowRight: () => sel[i + 1]?.hari,
        ArrowLeft: () => sel[i - 1]?.hari,
        ArrowDown: () => sel[i + 7]?.hari,
        ArrowUp: () => sel[i - 7]?.hari,
        Home: () => (e.ctrlKey ? sel[0]?.hari : sel[Math.max(0, i - kolom)]?.hari),
        End: () => (e.ctrlKey ? sel[akhir]?.hari : sel[Math.min(akhir, i + (6 - kolom))]?.hari),
        PageUp: () => sel[0]?.hari,
        PageDown: () => sel[akhir]?.hari,
      }

      const cari = tujuan[e.key]
      if (cari === undefined) return
      const ke = cari()
      // Only swallow the key once it has somewhere to go, so an arrow at the edge
      // of a month still scrolls the page rather than dying silently.
      if (ke === undefined || ke === aktifSekarang) return
      e.preventDefault()
      pindah(ke)
    },
    [aktifSekarang, sel, pindah],
  )

  return (
    <section className="kartu overflow-hidden" aria-labelledby={idJudul}>
      {/* The heading names the region and the grid, so the `aria-label` that used
          to sit on the section — repeating the month — is gone. The year is on the
          sheet's own heading above. */}
      <h3
        id={idJudul}
        className="poster border-b border-garis bg-kertasGelap px-ruang-sm py-1.5 text-xl text-ink"
      >
        {namaBulan(blok.month, locale)}
      </h3>

      <div
        ref={gridRef}
        role="grid"
        aria-labelledby={idJudul}
        aria-describedby={petunjukId}
        onKeyDown={onKeyDown}
      >
        <div role="row" className="grid grid-cols-7 border-b border-garis">
          {HARI_MINGGU.map((w) => (
            <div
              key={w}
              role="columnheader"
              className={`px-1 py-1.5 text-center text-2xs font-semibold uppercase tracking-[0.06em] ${
                w === 0 ? 'text-liburMerahTeks' : 'text-inkPudar'
              }`}
            >
              {namaHariPendek(w, locale)}
            </div>
          ))}
        </div>

        {blok.minggu.map((minggu, m) => (
          <div key={`minggu-${m}`} role="row" className="grid grid-cols-7">
            {minggu.map((s, i) => {
              const k = s.hari === null ? undefined : klasifikasi.get(s.hari)
              if (s.hari === null || k === undefined) {
                return <div key={`kosong-${m}-${i}`} role="gridcell" className="min-h-sel" />
              }
              return (
                <DayCell
                  key={s.hari}
                  hari={s.hari}
                  klasifikasi={k}
                  dipilihSendiri={dipilihSendiri.has(s.hari)}
                  disarankan={disarankan.has(s.hari)}
                  posisiRun={posisiRun.get(s.hari) ?? 'tidak'}
                  locale={locale}
                  onToggle={onToggle}
                  onPeriksa={onPeriksa}
                  tabIndex={s.hari === aktifSekarang ? 0 : -1}
                  onFokus={setAktif}
                />
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
