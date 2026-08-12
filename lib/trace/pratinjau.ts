import type { WorkPattern } from '@/lib/day/pattern'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import { hitungEntitlement, SEMUA_STATUS, type JenisStatus, type Status } from '@/lib/status'

/**
 * What each employment status would leave you, before you choose one.
 *
 * The status question is the single hardest thing to explain: a reader who
 * does not already know the rule cannot tell why "ASN or swasta" should change
 * a calendar. Showing the consequence on the choice itself is what makes it
 * answerable — the option carries its own explanation.
 *
 * Invariant 15 still holds: the arithmetic is here, not in the component that
 * renders the cards.
 */

export type PratinjauStatus = {
  readonly jenis: JenisStatus
  /** Leave days left after cuti bersama is accounted for. */
  readonly sisaHari: number
  /** Days deducted under this status. Zero for three of the four. */
  readonly dipotongHari: number
  /** Cuti bersama days that land on a working day this year. */
  readonly cutiBersamaHariKerjaHari: number
}

export function pratinjauStatus(
  tahun: number,
  pattern: WorkPattern,
  jatahHari: number,
  tidakDiberikanHari: number,
): readonly PratinjauStatus[] {
  const pack = packTahun(tahun)
  if (pack === undefined) return []

  return SEMUA_STATUS.map((jenis) => {
    const status: Status =
      jenis === 'asn' ? { type: 'asn', jatahHari, tidakDiberikanHari } : { type: jenis, jatahHari }

    const terselesaikan = resolveTahun(pack, pattern, status)
    const entitlement = hitungEntitlement(status, terselesaikan.cutiBersamaHariKerjaHari)

    return {
      jenis,
      sisaHari: entitlement.sisaHari,
      dipotongHari: entitlement.dipotongCutiBersamaHari,
      cutiBersamaHariKerjaHari: terselesaikan.cutiBersamaHariKerjaHari,
    }
  })
}
