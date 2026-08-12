import type { DayNumber } from '@/lib/day'
import { hitungRun, type Run } from '@/lib/runs'

/**
 * Bridge enumeration.
 *
 * A bridge is a gap of working days sitting between two blocks of days off.
 * Buying every working day in the gap joins the two blocks into one stretch —
 * this is the *harpitnas* arithmetic, made exact.
 *
 * Gaps at the edges of the year are not bridges: they have a block on one side
 * only, so buying them joins nothing. Every candidate here genuinely joins two
 * blocks that were separate without it (PRD §7, asserted as a property).
 */

export type Jembatan = {
  /** Index into the gap list, ascending by date. */
  readonly indeks: number
  readonly mulai: DayNumber
  readonly selesai: DayNumber
  /** Working days that must be bought to close this gap. */
  readonly hari: readonly DayNumber[]
  /** Leave days spent. Equals `hari.length`. */
  readonly biayaHari: number
  /** The stretch produced if this bridge alone is bought. */
  readonly hasilHari: number
  /** Consecutive days off gained per leave day spent. Always at least 1. */
  readonly leverage: number
}

export type PetaJembatan = {
  readonly blok: readonly Run[]
  readonly jembatan: readonly Jembatan[]
}

/**
 * Blocks of days off and the bridgeable gaps between them.
 *
 * `liburHari` are the days already off — holidays, cuti bersama if taken, and
 * weekends. `hariKerjaTersedia` are the days the user may actually buy; a day
 * inside a gap that is not available makes that gap unbridgeable.
 */
export function petakanJembatan(
  liburHari: Iterable<DayNumber>,
  hariKerjaTersedia: Iterable<DayNumber>,
): PetaJembatan {
  const blok = hitungRun(liburHari)
  const tersedia = new Set(hariKerjaTersedia)
  const jembatan: Jembatan[] = []

  for (let i = 0; i + 1 < blok.length; i += 1) {
    const kiri = blok[i]!
    const kanan = blok[i + 1]!
    const mulai = kiri.selesai + 1
    const selesai = kanan.mulai - 1

    const hari: DayNumber[] = []
    let bisa = true
    for (let d = mulai; d <= selesai; d += 1) {
      if (!tersedia.has(d)) {
        bisa = false
        break
      }
      hari.push(d)
    }
    if (!bisa || hari.length === 0) continue

    const biayaHari = hari.length
    const hasilHari = kiri.panjangHari + biayaHari + kanan.panjangHari
    jembatan.push({
      indeks: jembatan.length,
      mulai,
      selesai,
      hari,
      biayaHari,
      hasilHari,
      leverage: hasilHari / biayaHari,
    })
  }

  return { blok, jembatan }
}

/**
 * Bridges costing no more than `maksBiayaHari`.
 *
 * A five-day working week puts a five-workday gap between every pair of
 * weekends, so a year holds around fifty gaps — too many to enumerate
 * exhaustively. Filtering to the bridges a real budget could buy gives an
 * instance the brute-force oracle can check, and both algorithms are run on
 * the same filtered map so the comparison stays honest.
 *
 * Adjacency is recomputed from dates downstream, so filtering never changes
 * which bridges compound.
 */
export function saringJembatan(peta: PetaJembatan, maksBiayaHari: number): PetaJembatan {
  return { blok: peta.blok, jembatan: peta.jembatan.filter((b) => b.biayaHari <= maksBiayaHari) }
}

/**
 * Value of buying a set of bridges.
 *
 * Bridges that sit either side of a shared block compound: closing two gaps in
 * a row merges three blocks into one stretch. The value is the total number of
 * days off that end up inside a stretch the purchase created or extended —
 * every block touched, plus every day bought.
 *
 * A merged stretch is counted once, so two adjacent bridges do not both claim
 * the block between them.
 */
export function nilaiPilihan(peta: PetaJembatan, dipilih: Iterable<number>): { nilai: number; biaya: number } {
  const pilih = new Set(dipilih)
  if (pilih.size === 0) return { nilai: 0, biaya: 0 }

  // Bridge index i in the bridge list corresponds to the gap between block
  // `blokKiri(i)` and the next block. Adjacency in the *block* sequence, not
  // in the bridge list, is what makes two bridges compound.
  const urut = [...pilih].sort((a, b) => a - b)
  const byIndeks = new Map(peta.jembatan.map((j) => [j.indeks, j]))

  let nilai = 0
  let biaya = 0
  let i = 0
  while (i < urut.length) {
    const awal = urut[i]!
    const jAwal = byIndeks.get(awal)
    if (jAwal === undefined) throw new Error(`Jembatan ${awal} tidak ada`)

    // Extend while the next selected bridge starts exactly where this stretch
    // ends — i.e. the blocks are contiguous through the merged run.
    let akhir = i
    while (akhir + 1 < urut.length) {
      const sekarang = byIndeks.get(urut[akhir]!)!
      const berikut = byIndeks.get(urut[akhir + 1]!)!
      const blokAntara = peta.blok.find((b) => b.mulai === sekarang.selesai + 1)
      if (blokAntara === undefined || blokAntara.selesai + 1 !== berikut.mulai) break
      akhir += 1
    }

    const pertama = byIndeks.get(urut[i]!)!
    const terakhir = byIndeks.get(urut[akhir]!)!
    const blokKiri = peta.blok.find((b) => b.selesai + 1 === pertama.mulai)!
    const blokKanan = peta.blok.find((b) => b.mulai === terakhir.selesai + 1)!

    // The merged stretch runs from the left block's start to the right
    // block's end, counting every day in between exactly once.
    nilai += blokKanan.selesai - blokKiri.mulai + 1
    for (let k = i; k <= akhir; k += 1) biaya += byIndeks.get(urut[k]!)!.biayaHari

    i = akhir + 1
  }

  return { nilai, biaya }
}
