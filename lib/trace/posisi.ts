import type { Kontradiksi } from '@/lib/rules/contradiction'
import { posisiDipakai, posisiLain } from '@/lib/rules/contradiction'
import { hitungEntitlementPosisi } from '@/lib/status/posisi'
import type { Status } from '@/lib/status'

/**
 * What each rival position on the disputed rule would leave this reader.
 *
 * The ledger has always recorded that the cuti bersama entitlement rule is
 * reported both ways in public. It recorded it in prose, which asks a reader to
 * adjudicate two documents on the strength of a website's assertion. Stating the
 * numbers makes the stakes legible and, more usefully, makes the app's own choice
 * falsifiable in the reader's hands.
 *
 * It is also honest about the common case: for a private-sector reader both
 * positions give the same answer, because the dispute is about ASN. Saying so is
 * better than implying everyone is affected.
 *
 * Invariant 12: the disagreement is recorded, not resolved silently. Invariant
 * 13: these are figures, not an argument for either reading.
 */
export type BandingPosisi = {
  readonly kontradiksiId: string
  readonly judul: string
  readonly posisiId: string
  readonly posisiJudul: string
  readonly dipakai: boolean
  /** Leave days remaining under this position. */
  readonly sisaHari: number
  /** Days this position charges to the entitlement. */
  readonly dipotongHari: number
}

export function bandingkanPosisi(
  kontradiksi: readonly Kontradiksi[],
  status: Status,
  cutiBersamaHariKerja: number,
): readonly BandingPosisi[] {
  const out: BandingPosisi[] = []

  for (const k of kontradiksi) {
    const dipakai = posisiDipakai(k)
    if (dipakai === undefined) continue

    for (const posisi of [dipakai, ...posisiLain(k)]) {
      const hasil = hitungEntitlementPosisi(status, cutiBersamaHariKerja, posisi.efek)
      out.push({
        kontradiksiId: k.id,
        judul: k.judul,
        posisiId: posisi.id,
        posisiJudul: posisi.judul,
        dipakai: posisi.id === dipakai.id,
        sisaHari: hasil.sisaHari,
        dipotongHari: hasil.dipotongCutiBersamaHari,
      })
    }
  }

  return out
}

/** True when every position lands on the same number for this reader. */
export function posisiSepakat(banding: readonly BandingPosisi[]): boolean {
  if (banding.length === 0) return true
  const pertama = banding[0]
  if (pertama === undefined) return true
  return banding.every((b) => b.sisaHari === pertama.sisaHari)
}
