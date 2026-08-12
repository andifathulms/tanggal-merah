import { daysOfYear, fromIsoDate, type DayNumber } from '@/lib/day'
import { isAkhirPekan, type WorkPattern } from '@/lib/day/pattern'
import { cutiBersamaLibur, type Status } from '@/lib/status'
import type { HariLibur, RulePack } from './schema'

/**
 * Resolves a rule pack, a work pattern, and an employment status into a
 * classification for every day of the year.
 *
 * Invariant 4: `liburNasional` and `cutiBersama` stay distinct all the way
 * through. A cuti bersama is a day off for some people and an ordinary working
 * day for others, and it is never rendered as a national holiday.
 *
 * Precedence where a date carries more than one meaning: libur nasional beats
 * cuti bersama beats weekend beats working day. A cuti bersama on a Sunday is
 * reported as a weekend because it costs nothing.
 */

export type KlasifikasiHari =
  | { readonly type: 'liburNasional'; readonly hari: DayNumber; readonly entri: HariLibur; readonly libur: true }
  | {
      readonly type: 'cutiBersama'
      readonly hari: DayNumber
      readonly entri: HariLibur
      /** False when the person's employer does not take cuti bersama. */
      readonly libur: boolean
    }
  | { readonly type: 'akhirPekan'; readonly hari: DayNumber; readonly libur: true }
  | { readonly type: 'hariKerja'; readonly hari: DayNumber; readonly libur: false }

export type TahunTerselesaikan = {
  readonly tahun: number
  readonly pack: RulePack
  readonly pattern: WorkPattern
  readonly hari: readonly KlasifikasiHari[]
  /** Days that are off before the user spends any leave, ascending. */
  readonly liburHari: readonly DayNumber[]
  /** Working days available to buy as bridges, ascending. */
  readonly hariKerja: readonly DayNumber[]
  /**
   * Cuti bersama days that fall on a day this person would otherwise have
   * worked. This — not the raw count of pack entries — is what a deducting
   * employer takes out of the annual leave entitlement.
   */
  readonly cutiBersamaHariKerjaHari: number
}

export function resolveTahun(pack: RulePack, pattern: WorkPattern, status: Status): TahunTerselesaikan {
  const liburNasional = new Map<DayNumber, HariLibur>()
  const cutiBersama = new Map<DayNumber, HariLibur>()

  for (const entri of pack.hari) {
    const hari = fromIsoDate(entri.tanggal)
    switch (entri.jenis) {
      case 'liburNasional':
        liburNasional.set(hari, entri)
        break
      case 'cutiBersama':
        cutiBersama.set(hari, entri)
        break
      default:
        exhaustive(entri.jenis)
    }
  }

  const cutiBersamaIkut = cutiBersamaLibur(status)
  const hari: KlasifikasiHari[] = []
  const liburHari: DayNumber[] = []
  const hariKerja: DayNumber[] = []
  let cutiBersamaHariKerjaHari = 0

  for (const d of daysOfYear(pack.tahun)) {
    const nasional = liburNasional.get(d)
    if (nasional !== undefined) {
      hari.push({ type: 'liburNasional', hari: d, entri: nasional, libur: true })
      liburHari.push(d)
      continue
    }

    const bersama = cutiBersama.get(d)
    const akhirPekan = isAkhirPekan(d, pattern)

    if (bersama !== undefined && !akhirPekan) {
      // Only a cuti bersama landing on a working day costs anything.
      cutiBersamaHariKerjaHari += 1
      hari.push({ type: 'cutiBersama', hari: d, entri: bersama, libur: cutiBersamaIkut })
      if (cutiBersamaIkut) liburHari.push(d)
      else hariKerja.push(d)
      continue
    }

    if (akhirPekan) {
      hari.push({ type: 'akhirPekan', hari: d, libur: true })
      liburHari.push(d)
      continue
    }

    hari.push({ type: 'hariKerja', hari: d, libur: false })
    hariKerja.push(d)
  }

  return {
    tahun: pack.tahun,
    pack,
    pattern,
    hari,
    liburHari,
    hariKerja,
    cutiBersamaHariKerjaHari,
  }
}

function exhaustive(value: never): never {
  throw new Error(`Jenis hari tidak dikenal: ${String(value)}`)
}
