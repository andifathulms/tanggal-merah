import type { DayNumber } from '@/lib/day'
import type { Jembatan } from '@/lib/optimise'
import type { KlasifikasiHari } from '@/lib/rules/resolve'
import type { Run } from '@/lib/runs'
import type { LeaveTrace } from './index'

/**
 * One harpitnas, taken apart, so a newcomer can follow the arithmetic instead of
 * being handed its result.
 *
 * The app could state that two leave days produce a twelve-day stretch, and could
 * name the date, and could rank every candidate by leverage — but nowhere did it
 * show the middle of the calculation. A reader had no way to see that the twelve
 * days are a block they already had, plus the days they bought, plus another block
 * they already had. Which is the whole mechanism.
 *
 * This returns the stretch day by day with each day's part in it, so the
 * explanation can be the real dates rather than a diagram of imaginary ones.
 *
 * Invariant 15: the arithmetic is here, not in the component that draws it. And
 * nothing new is computed about the calendar — the runs and the classification both
 * arrive already resolved on the trace.
 */

export type PeranHari = 'blokKiri' | 'dibeli' | 'blokKanan'

export type HariContoh = {
  readonly hari: DayNumber
  readonly peran: PeranHari
  readonly klasifikasi: KlasifikasiHari
}

export type Contoh = {
  readonly jembatan: Jembatan
  /** Every day of the resulting stretch, ascending. */
  readonly hari: readonly HariContoh[]
  /** Days off already held on the left of the gap. */
  readonly blokKiriHari: number
  /** Days off already held on the right. */
  readonly blokKananHari: number
  /** Working days bought. Equals `jembatan.biayaHari`. */
  readonly dibeliHari: number
  /**
   * Days off before buying anything — the two blocks, still separate. The point of
   * the example is that this is nearly the same as the total: what changes is that
   * they join.
   */
  readonly sebelumHari: number
  /** Length of the joined stretch. Equals `jembatan.hasilHari`. */
  readonly sesudahHari: number
}

/**
 * The year's highest-leverage harpitnas, taken apart. Undefined when there is no
 * candidate, or when the blocks either side cannot be found — in which case there is
 * nothing honest to draw and the caller shows nothing.
 */
export function contohJembatan(trace: LeaveTrace): Contoh | undefined {
  const jembatan = trace.saran[0]
  if (jembatan === undefined) return undefined

  const kiri = trace.runDasar.find((r: Run) => r.selesai === jembatan.mulai - 1)
  const kanan = trace.runDasar.find((r: Run) => r.mulai === jembatan.selesai + 1)
  if (kiri === undefined || kanan === undefined) return undefined

  const peta = new Map<DayNumber, KlasifikasiHari>(trace.terselesaikan.hari.map((h) => [h.hari, h]))

  const hari: HariContoh[] = []
  for (let d = kiri.mulai; d <= kanan.selesai; d += 1) {
    const klasifikasi = peta.get(d)
    // A day inside the stretch with no classification would mean the stretch left
    // the year, which cannot happen — but drawing a partial example would be worse
    // than drawing none.
    if (klasifikasi === undefined) return undefined
    const peran: PeranHari = d < jembatan.mulai ? 'blokKiri' : d > jembatan.selesai ? 'blokKanan' : 'dibeli'
    hari.push({ hari: d, peran, klasifikasi })
  }

  return {
    jembatan,
    hari,
    blokKiriHari: kiri.panjangHari,
    blokKananHari: kanan.panjangHari,
    dibeliHari: jembatan.biayaHari,
    sebelumHari: kiri.panjangHari + kanan.panjangHari,
    sesudahHari: jembatan.hasilHari,
  }
}
