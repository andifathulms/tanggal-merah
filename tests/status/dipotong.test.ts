import { describe, expect, it } from 'vitest'
import { WORK_PATTERNS } from '@/lib/day/pattern'
import { packTahun, tahunTersedia } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import { cutiBersamaMemotong, hitungEntitlement, SEMUA_STATUS, type Status } from '@/lib/status'

/**
 * The ledger says how many cuti bersama days were charged. The sheet marks which
 * ones. Those two must never be able to disagree, so the per-day flag is
 * asserted against the entitlement total in both directions — a day marked as
 * charged for a status that charges nothing would be a lie told on the grid.
 */

function statusOf(jenis: (typeof SEMUA_STATUS)[number], jatahHari: number): Status {
  return jenis === 'asn' ? { type: 'asn', jatahHari, tidakDiberikanHari: 0 } : { type: jenis, jatahHari }
}

describe('cuti bersama charged per day', () => {
  it('marks exactly as many days as the ledger deducts', () => {
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      expect(pack).toBeDefined()
      if (pack === undefined) continue

      for (const pattern of WORK_PATTERNS) {
        for (const jenis of SEMUA_STATUS) {
          const status = statusOf(jenis, 12)
          const terselesaikan = resolveTahun(pack, pattern, status)
          const entitlement = hitungEntitlement(status, terselesaikan.cutiBersamaHariKerjaHari)

          const ditandai = terselesaikan.hari.filter((h) => h.type === 'cutiBersama' && h.dipotong).length

          expect(ditandai, `${tahun} ${pattern} ${jenis}`).toBe(entitlement.dipotongCutiBersamaHari)
        }
      }
    }
  })

  it('marks nothing for the three branches that deduct nothing', () => {
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      if (pack === undefined) continue

      for (const jenis of SEMUA_STATUS) {
        if (cutiBersamaMemotong(statusOf(jenis, 12))) continue
        const terselesaikan = resolveTahun(pack, 'lima-hari', statusOf(jenis, 12))
        expect(terselesaikan.hari.some((h) => h.type === 'cutiBersama' && h.dipotong)).toBe(false)
      }
    }
  })

  it('marks every working-day cuti bersama for the deducting branch', () => {
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      if (pack === undefined) continue

      for (const pattern of WORK_PATTERNS) {
        const terselesaikan = resolveTahun(pack, pattern, statusOf('swastaCutiBersamaDipotong', 12))
        const semua = terselesaikan.hari.filter((h) => h.type === 'cutiBersama')
        expect(semua.length).toBe(terselesaikan.cutiBersamaHariKerjaHari)
        expect(semua.every((h) => h.type === 'cutiBersama' && h.dipotong)).toBe(true)
      }
    }
  })

  it('only the deducting branch charges anything', () => {
    expect(cutiBersamaMemotong({ type: 'swastaCutiBersamaDipotong', jatahHari: 12 })).toBe(true)
    expect(cutiBersamaMemotong({ type: 'swastaCutiBersamaTanpaPotong', jatahHari: 12 })).toBe(false)
    expect(cutiBersamaMemotong({ type: 'swastaTanpaCutiBersama', jatahHari: 12 })).toBe(false)
    expect(cutiBersamaMemotong({ type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 })).toBe(false)
  })
})
