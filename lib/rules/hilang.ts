import { fromIsoDate } from '@/lib/day'
import { akhirPekanOf, isAkhirPekan, WORK_PATTERNS, type WorkPattern } from '@/lib/day/pattern'
import type { RulePack } from './schema'

/**
 * What the calendar's colour hides: a libur nasional that falls on a day you
 * were off anyway is coloured like a gift and worth nothing.
 *
 * This is the purest case in the whole dataset of the app's one idea — a day
 * off has a value, and the value is not the same for everybody. The same red
 * square is a genuine gain to somebody who works Saturdays and worth zero to
 * somebody who does not, and no rule changed between the two readers. Only who
 * they are.
 *
 * Nothing here is computed in the sense invariant 3 forbids. Every date is
 * still transcribed from the SKB; this only asks which weekday each transcribed
 * date landed on, which is arithmetic on a day number.
 *
 * No `Date`, no clock — the year arrives inside the pack (invariants 1 and 2).
 */

export type RingkasanHilang = {
  readonly pattern: WorkPattern
  /** Libur nasional entries in the pack. */
  readonly liburNasionalHari: number
  /** Of those, the ones falling on a day already off under this pattern. */
  readonly liburNasionalDiAkhirPekanHari: number
  /** Of those, the ones that genuinely add a day off. The two sum to the total. */
  readonly liburNasionalMenambahHari: number
  /** Cuti bersama entries in the pack. */
  readonly cutiBersamaHari: number
  /**
   * Cuti bersama falling on a day already off. These cost nobody anything —
   * which is why `cutiBersamaHariKerjaHari`, not the raw pack count, is what a
   * deducting employer takes out of an entitlement.
   */
  readonly cutiBersamaDiAkhirPekanHari: number
  /**
   * The same count under the other working week. The asymmetry is the point:
   * a holiday on a Saturday is nothing to a five-day worker and a real day off
   * to a six-day one (invariant 10, PRD §5.3).
   */
  readonly polaLain: WorkPattern
  readonly liburNasionalDiAkhirPekanPolaLainHari: number
}

/** The other of the two working weeks. */
export function polaLainnya(pattern: WorkPattern): WorkPattern {
  const lain = WORK_PATTERNS.find((p) => p !== pattern)
  if (lain === undefined) throw new Error(`Tidak ada pola kerja lain selain ${pattern}`)
  return lain
}

export function hitungHilang(pack: RulePack, pattern: WorkPattern): RingkasanHilang {
  const polaLain = polaLainnya(pattern)

  let liburNasionalHari = 0
  let liburNasionalDiAkhirPekanHari = 0
  let liburNasionalDiAkhirPekanPolaLainHari = 0
  let cutiBersamaHari = 0
  let cutiBersamaDiAkhirPekanHari = 0

  for (const entri of pack.hari) {
    const hari = fromIsoDate(entri.tanggal)
    switch (entri.jenis) {
      case 'liburNasional': {
        liburNasionalHari += 1
        if (isAkhirPekan(hari, pattern)) liburNasionalDiAkhirPekanHari += 1
        if (isAkhirPekan(hari, polaLain)) liburNasionalDiAkhirPekanPolaLainHari += 1
        break
      }
      case 'cutiBersama': {
        cutiBersamaHari += 1
        if (isAkhirPekan(hari, pattern)) cutiBersamaDiAkhirPekanHari += 1
        break
      }
      default:
        return exhaustive(entri.jenis)
    }
  }

  return {
    pattern,
    liburNasionalHari,
    liburNasionalDiAkhirPekanHari,
    liburNasionalMenambahHari: liburNasionalHari - liburNasionalDiAkhirPekanHari,
    cutiBersamaHari,
    cutiBersamaDiAkhirPekanHari,
    polaLain,
    liburNasionalDiAkhirPekanPolaLainHari,
  }
}

/**
 * Whether this pattern is the one that loses more holidays to days already off.
 * Six-day weeks have only Sunday off, so they can never lose more than a
 * five-day week does over the same pack — asserted, not assumed.
 */
export function kehilanganLebihBanyak(ringkasan: RingkasanHilang): boolean {
  return ringkasan.liburNasionalDiAkhirPekanHari > ringkasan.liburNasionalDiAkhirPekanPolaLainHari
}

/** Days of the week not worked, for the copy that names them. */
export function jumlahHariAkhirPekan(pattern: WorkPattern): number {
  return akhirPekanOf(pattern).length
}

function exhaustive(value: never): never {
  throw new Error(`Jenis hari tidak dikenal: ${String(value)}`)
}
