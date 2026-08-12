import { dayNumberOf, daysInMonth, weekdayOf, type DayNumber, type Month } from '@/lib/day'
import { hitungRun } from '@/lib/runs'
import type { PosisiRun } from '@/components/sheet/DayCell'

/**
 * Grid arithmetic for the year sheet.
 *
 * Invariant 15: nothing is computed in a component, and that includes working
 * out which cell a date lands in and where a run bar's rounded ends fall.
 *
 * The week starts on Sunday, as on an Indonesian wall calendar (PRD §8).
 */

export type Sel = { readonly hari: DayNumber | null }
export type BlokBulan = {
  readonly month: Month
  readonly minggu: readonly (readonly Sel[])[]
}

export function tataLetakTahun(tahun: number): readonly BlokBulan[] {
  const blok: BlokBulan[] = []

  for (let m = 1; m <= 12; m += 1) {
    const month = m as Month
    const pertama = dayNumberOf(tahun, month, 1)
    const jumlah = daysInMonth(tahun, month)
    const kosongDepan = weekdayOf(pertama)

    const sel: Sel[] = []
    for (let i = 0; i < kosongDepan; i += 1) sel.push({ hari: null })
    for (let d = 0; d < jumlah; d += 1) sel.push({ hari: pertama + d })
    while (sel.length % 7 !== 0) sel.push({ hari: null })

    const minggu: Sel[][] = []
    for (let i = 0; i < sel.length; i += 7) minggu.push(sel.slice(i, i + 7))

    blok.push({ month, minggu })
  }

  return blok
}

/**
 * Days belonging to a run long enough to be worth drawing a bar under.
 *
 * An ordinary two-day weekend is a run, but marking it makes the bar
 * meaningless: every Saturday and Sunday column lights up and the signal is
 * gone. The bar exists to show a stretch you would not otherwise have had, so
 * it starts at three days — one day longer than the weekend everybody already
 * gets.
 */
export function hariRentetanPanjang(
  libur: Iterable<DayNumber>,
  minHari = 3,
): ReadonlySet<DayNumber> {
  const out = new Set<DayNumber>()
  for (const run of hitungRun(libur)) {
    if (run.panjangHari < minHari) continue
    for (let d = run.mulai; d <= run.selesai; d += 1) out.add(d)
  }
  return out
}

/**
 * Where this day sits in its run bar.
 *
 * `dalamRentetan` is the set from `hariRentetanPanjang`, not every day off.
 * Bars cap at the ends of a week row, because a grid row break is a visual
 * break: the bar cannot be drawn across it.
 */
export function posisiRunHari(hari: DayNumber, dalamRentetan: ReadonlySet<DayNumber>): PosisiRun {
  const libur = dalamRentetan
  if (!libur.has(hari)) return 'tidak'

  const sebelum = libur.has(hari - 1)
  const sesudah = libur.has(hari + 1)
  if (!sebelum && !sesudah) return 'tidak'

  const weekday = weekdayOf(hari)
  const awal = !sebelum || weekday === 0
  const akhir = !sesudah || weekday === 6

  if (awal && akhir) return 'tunggal'
  if (awal) return 'awal'
  if (akhir) return 'akhir'
  return 'tengah'
}
