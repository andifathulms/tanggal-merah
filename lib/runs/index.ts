import type { DayNumber } from '@/lib/day'

/**
 * Consecutive-off blocks.
 *
 * A run is a maximal stretch of days off. This is the object the year sheet
 * draws as a continuous bar — the insight the app exists to show is that a
 * bridge day is not one red square, it is the thing that joins two blocks into
 * one stretch (PRD §5.1).
 *
 * Runs are computed from a set of day numbers. No Date, no clock.
 */

export type Run = {
  readonly mulai: DayNumber
  readonly selesai: DayNumber
  /** Inclusive length. `selesai - mulai + 1`. */
  readonly panjangHari: number
}

/**
 * Maximal consecutive blocks over the given days off. Input need not be sorted
 * or unique. Runs are returned ascending and never touch each other.
 */
export function hitungRun(liburHari: Iterable<DayNumber>): readonly Run[] {
  const hari = [...new Set(liburHari)].sort((a, b) => a - b)
  if (hari.length === 0) return []

  const runs: Run[] = []
  let mulai = hari[0]!
  let sebelumnya = hari[0]!

  for (let i = 1; i < hari.length; i += 1) {
    const d = hari[i]!
    if (d === sebelumnya + 1) {
      sebelumnya = d
      continue
    }
    runs.push({ mulai, selesai: sebelumnya, panjangHari: sebelumnya - mulai + 1 })
    mulai = d
    sebelumnya = d
  }
  runs.push({ mulai, selesai: sebelumnya, panjangHari: sebelumnya - mulai + 1 })

  return runs
}

/** The run containing this day, or undefined if the day is worked. */
export function runYangMemuat(runs: readonly Run[], hari: DayNumber): Run | undefined {
  return runs.find((r) => hari >= r.mulai && hari <= r.selesai)
}

export function runTerpanjang(runs: readonly Run[]): Run | undefined {
  let terpanjang: Run | undefined
  for (const r of runs) {
    if (terpanjang === undefined || r.panjangHari > terpanjang.panjangHari) terpanjang = r
  }
  return terpanjang
}

export function totalHariLibur(runs: readonly Run[]): number {
  return runs.reduce((n, r) => n + r.panjangHari, 0)
}
