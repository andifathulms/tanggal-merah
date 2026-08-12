import type { DayNumber } from '@/lib/day'
import { nilaiPilihan, petakanJembatan, type Jembatan, type PetaJembatan } from './gaps'

export { petakanJembatan, nilaiPilihan } from './gaps'
export type { Jembatan, PetaJembatan } from './gaps'

/**
 * Exact bridge selection under a leave budget.
 *
 * Invariant 8: this reports the true optimum, not a greedy approximation, and
 * it is verified against `brute.ts` at every realistic budget. If a heuristic
 * is ever needed for performance it must be labelled as such in the output —
 * at realistic budgets it is not needed, and `heuristik` below is always
 * false.
 *
 * The problem is a dynamic program over the block sequence. Bridges compound:
 * closing two gaps in a row merges three blocks into one stretch, so the DP
 * decides on maximal runs of consecutive bridges rather than one gap at a
 * time. That compounding is the only reason a greedy pass would get this
 * wrong.
 */

export type Rencana = {
  readonly dipilih: readonly Jembatan[]
  /** Days off that end up inside a stretch this plan created or extended. */
  readonly nilaiHari: number
  /** Leave days spent. Never more than the budget. */
  readonly biayaHari: number
  /** `nilaiHari / biayaHari`, or 0 when nothing is bought. Always ≥ 1. */
  readonly leverage: number
  /** Always false. Present so a future heuristic could not hide (invariant 8). */
  readonly heuristik: false
}

export function rencanaKosong(): Rencana {
  return { dipilih: [], nilaiHari: 0, biayaHari: 0, leverage: 0, heuristik: false }
}

export function pilihJembatan(peta: PetaJembatan, anggaranHari: number): Rencana {
  const j = peta.jembatan
  const n = j.length
  if (n === 0 || anggaranHari <= 0) return rencanaKosong()

  // Two bridges compound only when the block between them is shared, so
  // precompute which bridges are contiguous in the block sequence.
  const menyambung: boolean[] = []
  for (let i = 0; i + 1 < n; i += 1) {
    const blokAntara = peta.blok.find((b) => b.mulai === j[i]!.selesai + 1)
    menyambung.push(blokAntara !== undefined && blokAntara.selesai + 1 === j[i + 1]!.mulai)
  }

  type Simpul = { nilai: number; biaya: number; dipilih: number[] }
  const memo = new Map<string, Simpul>()

  function terbaik(i: number, sisa: number): Simpul {
    if (i >= n) return { nilai: 0, biaya: 0, dipilih: [] }
    const kunci = `${i}|${sisa}`
    const tersimpan = memo.get(kunci)
    if (tersimpan !== undefined) return tersimpan

    // Skip this bridge entirely.
    let hasil = terbaik(i + 1, sisa)

    // Or start a merged stretch here and extend it through k.
    let biaya = 0
    for (let k = i; k < n; k += 1) {
      if (k > i && !menyambung[k - 1]!) break
      biaya += j[k]!.biayaHari
      if (biaya > sisa) break

      const dipilih = []
      for (let t = i; t <= k; t += 1) dipilih.push(j[t]!.indeks)
      const nilai = nilaiPilihan(peta, dipilih).nilai

      // If bridge k + 1 is adjacent to this stretch, it must not be chosen
      // separately: it would claim the block between them a second time. The
      // case where it is taken is already covered by extending the stretch to
      // k + 1 on the next turn of this loop, so skip past it here.
      const lanjut = k + 1 < n && menyambung[k] === true ? k + 2 : k + 1
      const sisanya = terbaik(lanjut, sisa - biaya)
      const kandidat: Simpul = {
        nilai: nilai + sisanya.nilai,
        biaya: biaya + sisanya.biaya,
        dipilih: [...dipilih, ...sisanya.dipilih],
      }
      if (kandidat.nilai > hasil.nilai || (kandidat.nilai === hasil.nilai && kandidat.biaya < hasil.biaya)) {
        hasil = kandidat
      }
    }

    memo.set(kunci, hasil)
    return hasil
  }

  const hasil = terbaik(0, anggaranHari)
  const byIndeks = new Map(j.map((b) => [b.indeks, b]))
  const dipilih = [...hasil.dipilih].sort((a, b) => a - b).map((i) => byIndeks.get(i)!)

  return {
    dipilih,
    nilaiHari: hasil.nilai,
    biayaHari: hasil.biaya,
    leverage: hasil.biaya === 0 ? 0 : hasil.nilai / hasil.biaya,
    heuristik: false,
  }
}

/**
 * Individual bridges ranked by leverage, for the suggestion list (PRD §5.4).
 * This is a ranking for a reader to look at, not the optimiser's answer —
 * `pilihJembatan` is what actually solves the budget.
 *
 * Invariant 13: no advice. This ranks by leverage arithmetic and nothing else.
 * It never says a plan is good.
 */
export function peringkatJembatan(peta: PetaJembatan, anggaranHari: number): readonly Jembatan[] {
  return peta.jembatan
    .filter((b) => b.biayaHari <= anggaranHari)
    .slice()
    .sort((a, b) => b.leverage - a.leverage || a.biayaHari - b.biayaHari || a.mulai - b.mulai)
}

/** Days off after a plan is bought: the ones already off, plus the days bought. */
export function hariLiburSetelah(liburHari: Iterable<DayNumber>, rencana: Rencana): readonly DayNumber[] {
  const out = new Set(liburHari)
  for (const b of rencana.dipilih) for (const d of b.hari) out.add(d)
  return [...out].sort((a, b) => a - b)
}
