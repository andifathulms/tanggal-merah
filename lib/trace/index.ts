import type { DayNumber } from '@/lib/day'
import type { WorkPattern } from '@/lib/day/pattern'
import { packTahun, kontradiksiTahun, tahunTersedia } from '@/lib/rules/loader'
import { resolveTahun, type TahunTerselesaikan } from '@/lib/rules/resolve'
import { hitungHilang, type RingkasanHilang } from '@/lib/rules/hilang'
import type { Penolakan } from '@/lib/rules/refusal'
import type { Kontradiksi } from '@/lib/rules/contradiction'
import { hitungEntitlement, type Entitlement, type Status } from '@/lib/status'
import { hitungRun, runTerpanjang, type Run } from '@/lib/runs'
import {
  hariLiburSetelah,
  peringkatJembatan,
  petakanJembatan,
  pilihJembatan,
  type Jembatan,
  type Rencana,
} from '@/lib/optimise'

/**
 * The engine. Pure: `(tahun, status, pola, pilihan) → LeaveTrace`.
 *
 * Invariant 2: the year is always an explicit argument. Nothing here reads the
 * clock — "this year" is resolved in the UI and passed in.
 *
 * Invariant 15: nothing is computed in a component. Everything the sheet, the
 * ledger, and the suggestion list render comes out of here.
 *
 * Invariant 13: no advice. This produces arithmetic — days, stretches, and
 * leverage. It never says a plan is good.
 */

export type PermintaanTrace = {
  readonly tahun: number
  readonly status: Status
  readonly pattern: WorkPattern
  /** Leave days the user has already picked by hand, as day numbers. */
  readonly dipilihSendiri?: readonly DayNumber[]
}

export type Ledger = {
  readonly entitlement: Entitlement
  /** Cuti bersama days landing on a day this person would have worked. */
  readonly cutiBersamaHariKerjaHari: number
  /** Leave days the user has spent on bridges and hand-picked days. */
  readonly terpakaiHari: number
  /** What is left. Never negative. */
  readonly sisaHari: number
  /** Both readings of the entitlement rule, and which one is used. */
  readonly kontradiksi: readonly Kontradiksi[]
}

export type LeaveTrace = {
  readonly type: 'terhitung'
  readonly tahun: number
  readonly pattern: WorkPattern
  readonly status: Status
  readonly terselesaikan: TahunTerselesaikan
  /** Runs before any leave is spent. */
  readonly runDasar: readonly Run[]
  /** Runs after the user's chosen days are added. */
  readonly run: readonly Run[]
  readonly runTerpanjangHari: number
  readonly ledger: Ledger
  /** Bridges ranked by leverage, filtered to what the remaining budget buys. */
  readonly saran: readonly Jembatan[]
  /** The exact optimum for the remaining budget. */
  readonly rencanaOptimal: Rencana
  /**
   * How many of the year's decreed days off land on a day this person was off
   * anyway — the value the calendar's colour hides.
   */
  readonly hilang: RingkasanHilang
  /** Day numbers the user has chosen, ascending. */
  readonly dipilihSendiri: readonly DayNumber[]
  /** True when the pack is a draft transcription — the UI must say so. */
  readonly perluVerifikasi: boolean
}

export type HasilTrace = LeaveTrace | ({ readonly type: 'ditolak' } & { readonly penolakan: Penolakan })

export function hitungTrace(permintaan: PermintaanTrace): HasilTrace {
  const pack = packTahun(permintaan.tahun)

  // Invariant 7: refuse rather than project. No extrapolation from last year,
  // no fixed-date fallback.
  if (pack === undefined) {
    return {
      type: 'ditolak',
      penolakan: {
        type: 'skbBelumTerbit',
        tahun: permintaan.tahun,
        tahunTersedia: tahunTersedia(),
      },
    }
  }

  const terselesaikan = resolveTahun(pack, permintaan.pattern, permintaan.status)
  const entitlement = hitungEntitlement(permintaan.status, terselesaikan.cutiBersamaHariKerjaHari)

  const bisaDibeli = new Set(terselesaikan.hariKerja)
  const dipilihSendiri = [...new Set(permintaan.dipilihSendiri ?? [])]
    .filter((d) => bisaDibeli.has(d))
    .sort((a, b) => a - b)

  const liburDenganPilihan = [...terselesaikan.liburHari, ...dipilihSendiri]
  const sisaSetelahPilihan = Math.max(0, entitlement.sisaHari - dipilihSendiri.length)

  // Bridges are enumerated against the state *including* the user's own
  // choices, so a hand-picked day that already shortened a gap is reflected
  // in what the suggestions cost.
  const sisaHariKerja = terselesaikan.hariKerja.filter((d) => !dipilihSendiri.includes(d))
  const peta = petakanJembatan(liburDenganPilihan, sisaHariKerja)

  const runDasar = hitungRun(terselesaikan.liburHari)
  const run = hitungRun(liburDenganPilihan)
  const rencanaOptimal = pilihJembatan(peta, sisaSetelahPilihan)

  return {
    type: 'terhitung',
    tahun: permintaan.tahun,
    pattern: permintaan.pattern,
    status: permintaan.status,
    terselesaikan,
    runDasar,
    run,
    runTerpanjangHari: runTerpanjang(run)?.panjangHari ?? 0,
    ledger: {
      entitlement,
      cutiBersamaHariKerjaHari: terselesaikan.cutiBersamaHariKerjaHari,
      terpakaiHari: dipilihSendiri.length,
      sisaHari: sisaSetelahPilihan,
      kontradiksi: kontradiksiTahun(permintaan.tahun),
    },
    saran: peringkatJembatan(peta, sisaSetelahPilihan),
    rencanaOptimal,
    hilang: hitungHilang(pack, permintaan.pattern),
    dipilihSendiri,
    perluVerifikasi: pack.status === 'perluVerifikasi',
  }
}

/** Days off once a plan's bridges are added to the user's own choices. */
export function hariLiburDenganRencana(trace: LeaveTrace, rencana: Rencana): readonly DayNumber[] {
  return hariLiburSetelah([...trace.terselesaikan.liburHari, ...trace.dipilihSendiri], rencana)
}
