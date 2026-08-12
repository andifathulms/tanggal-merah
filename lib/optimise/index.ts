import type { DayNumber } from '@/lib/day'
import { nilaiPilihan, rentetanPilihan, type Jembatan, type PetaJembatan } from './gaps'
import { TUJUAN_BAWAAN, type Tujuan } from './tujuan'

export { petakanJembatan, nilaiPilihan, rentetanPilihan } from './gaps'
export type { Jembatan, PetaJembatan } from './gaps'
export { SEMUA_TUJUAN, TUJUAN_BAWAAN, isTujuan } from './tujuan'
export type { Tujuan } from './tujuan'

/**
 * Exact bridge selection under a leave budget.
 *
 * Invariant 8: this reports the true optimum, not a greedy approximation, and
 * it is verified against `brute.ts` at every realistic budget. If a heuristic
 * is ever needed for performance it must be labelled as such in the output —
 * at realistic budgets it is not needed, and `heuristik` below is always
 * false.
 *
 * Bridges compound: closing two gaps in a row merges three blocks into one
 * stretch, so both objectives decide on maximal runs of consecutive bridges
 * rather than one gap at a time. That compounding is the only reason a greedy
 * pass would get this wrong.
 *
 * `totalHariLibur` is a dynamic program over the block sequence, because several
 * separate stretches all contribute and the choices interact through the budget.
 * `rentetanTerpanjang` needs no DP at all: its optimum is a single contiguous
 * group, so it is a direct scan. See `rentetanTerpanjangTerbaik`.
 */

export type Rencana = {
  readonly dipilih: readonly Jembatan[]
  /** Which question this plan is the answer to. */
  readonly tujuan: Tujuan
  /**
   * What the plan achieved, read according to `tujuan`: for `totalHariLibur`,
   * the days off across every stretch the plan created or extended; for
   * `rentetanTerpanjang`, the length of its single longest stretch.
   */
  readonly nilaiHari: number
  /** Leave days spent. Never more than the budget. */
  readonly biayaHari: number
  /** `nilaiHari / biayaHari`, or 0 when nothing is bought. Always ≥ 1. */
  readonly leverage: number
  /** Always false. Present so a future heuristic could not hide (invariant 8). */
  readonly heuristik: false
}

export function rencanaKosong(tujuan: Tujuan = TUJUAN_BAWAAN): Rencana {
  return { dipilih: [], tujuan, nilaiHari: 0, biayaHari: 0, leverage: 0, heuristik: false }
}

export function pilihJembatan(
  peta: PetaJembatan,
  anggaranHari: number,
  tujuan: Tujuan = TUJUAN_BAWAAN,
): Rencana {
  const j = peta.jembatan
  const n = j.length
  if (n === 0 || anggaranHari <= 0) return rencanaKosong(tujuan)

  // Two bridges compound only when the block between them is shared, so
  // precompute which bridges are contiguous in the block sequence.
  const menyambung: boolean[] = []
  for (let i = 0; i + 1 < n; i += 1) {
    const blokAntara = peta.blok.find((b) => b.mulai === j[i]!.selesai + 1)
    menyambung.push(blokAntara !== undefined && blokAntara.selesai + 1 === j[i + 1]!.mulai)
  }

  if (tujuan === 'rentetanTerpanjang') {
    return rentetanTerpanjangTerbaik(peta, anggaranHari, menyambung)
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
      // Bridges i..k are contiguous, so they merge into exactly one stretch and
      // its length is the whole group's value under either objective.
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
    tujuan,
    nilaiHari: hasil.nilai,
    biayaHari: hasil.biaya,
    leverage: hasil.biaya === 0 ? 0 : hasil.nilai / hasil.biaya,
    heuristik: false,
  }
}

/**
 * The best single stretch buyable within the budget.
 *
 * For `rentetanTerpanjang` the optimum is always exactly one contiguous group of
 * bridges, and this is worth spelling out because the obvious implementation is
 * wrong. Reusing the additive DP and swapping its combination step for `max`
 * reports the right *number* — it agreed with the oracle — but returns the wrong
 * *plan*: each sub-problem maximises its own local stretch and, on a tie,
 * minimises only its own cost, so it cheerfully spends leave on a second stretch
 * that the reported figure never mentions. The reader would be told to buy days
 * that bought them nothing.
 *
 * Stated directly instead. Any set of bridges yields some collection of merged
 * stretches; the longest of them comes from one contiguous group, and discarding
 * every bridge outside that group leaves the same stretch for less leave. So the
 * optimum is the best affordable contiguous group, found by scanning them all.
 * Exact, and obviously so — no heuristic here either (invariant 8).
 */
function rentetanTerpanjangTerbaik(
  peta: PetaJembatan,
  anggaranHari: number,
  menyambung: readonly boolean[],
): Rencana {
  const j = peta.jembatan
  const n = j.length

  let terbaikNilai = 0
  let terbaikBiaya = 0
  let terbaikDipilih: readonly Jembatan[] = []

  for (let i = 0; i < n; i += 1) {
    let biaya = 0
    for (let k = i; k < n; k += 1) {
      if (k > i && !menyambung[k - 1]!) break
      biaya += j[k]!.biayaHari
      if (biaya > anggaranHari) break

      const kelompok = j.slice(i, k + 1)
      const nilai = nilaiPilihan(
        peta,
        kelompok.map((b) => b.indeks),
      ).nilai

      // Cost is the tie-break, so an equally long stretch bought for less leave
      // wins — the same preference the oracle applies.
      if (nilai > terbaikNilai || (nilai === terbaikNilai && biaya < terbaikBiaya)) {
        terbaikNilai = nilai
        terbaikBiaya = biaya
        terbaikDipilih = kelompok
      }
    }
  }

  return {
    dipilih: terbaikDipilih,
    tujuan: 'rentetanTerpanjang',
    nilaiHari: terbaikNilai,
    biayaHari: terbaikBiaya,
    leverage: terbaikBiaya === 0 ? 0 : terbaikNilai / terbaikBiaya,
    heuristik: false,
  }
}

/** The stretches a plan produces, longest first. Used to state what it bought. */
export function rentetanRencana(peta: PetaJembatan, rencana: Rencana): readonly number[] {
  return [...rentetanPilihan(peta, rencana.dipilih.map((b) => b.indeks)).panjang].sort((a, b) => b - a)
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
