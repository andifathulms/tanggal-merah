import { describe, expect, it } from 'vitest'
import { petakanJembatan, saringJembatan } from '@/lib/optimise/gaps'
import { pilihBruteForce } from '@/lib/optimise/brute'
import { anggaranJenuhHari, kurvaMarginal } from '@/lib/optimise/marginal'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import type { WorkPattern } from '@/lib/day/pattern'
import type { Status } from '@/lib/status'

/**
 * The marginal curve is only meaningful because the optimiser is exact, so every
 * step of it is checked against the brute-force oracle, not just the endpoint.
 * A greedy planner would produce a plausible-looking curve that was an artefact
 * of its own ordering.
 */

const PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']
const STATUSES: readonly Status[] = [
  { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 },
  { type: 'swastaCutiBersamaDipotong', jatahHari: 12 },
]

/** Filtered so the oracle stays enumerable, exactly as the optimiser tests do. */
function petaUntuk(pattern: WorkPattern, status: Status, maksBiayaHari = 3) {
  const pack = packTahun(2026)
  if (pack === undefined) throw new Error('pack 2026 tidak termuat')
  const tahun = resolveTahun(pack, pattern, status)
  return saringJembatan(petakanJembatan(tahun.liburHari, tahun.hariKerja), maksBiayaHari)
}

describe('kurvaMarginal', () => {
  it('agrees with brute force at every budget on the curve', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const peta = petaUntuk(pattern, status)
        const kurva = kurvaMarginal(peta, 8)

        for (const langkah of kurva) {
          const oracle = pilihBruteForce(peta, langkah.anggaranHari)
          expect(langkah.nilaiHari, `${pattern} ${status.type} @${langkah.anggaranHari}`).toBe(oracle.nilai)
        }
      }
    }
  })

  it('never reports a negative marginal day', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const kurva = kurvaMarginal(petaUntuk(pattern, status), 12)
        for (const langkah of kurva) expect(langkah.tambahanHari).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('is non-decreasing in value, and the steps sum to the total', () => {
    const kurva = kurvaMarginal(petaUntuk('lima-hari', STATUSES[0]!), 10)
    let jumlah = 0
    for (let i = 0; i < kurva.length; i += 1) {
      const langkah = kurva[i]!
      jumlah += langkah.tambahanHari
      expect(langkah.nilaiHari).toBe(jumlah)
      if (i > 0) expect(langkah.nilaiHari).toBeGreaterThanOrEqual(kurva[i - 1]!.nilaiHari)
    }
  })

  it('spends no more than the budget at any point', () => {
    const kurva = kurvaMarginal(petaUntuk('lima-hari', STATUSES[1]!), 12)
    for (const langkah of kurva) expect(langkah.biayaHari).toBeLessThanOrEqual(langkah.anggaranHari)
  })

  it('has one entry per budget from 1, and none for a zero budget', () => {
    const peta = petaUntuk('lima-hari', STATUSES[0]!)
    expect(kurvaMarginal(peta, 0)).toEqual([])
    expect(kurvaMarginal(peta, -3)).toEqual([])

    const kurva = kurvaMarginal(peta, 5)
    expect(kurva.map((l) => l.anggaranHari)).toEqual([1, 2, 3, 4, 5])
  })

  it('finds the budget past which nothing more can be bought', () => {
    // A map with no bridges at all saturates at the first day.
    const kosong = petakanJembatan([1, 2, 3], [])
    const kurva = kurvaMarginal(kosong, 4)
    expect(kurva.every((l) => l.tambahanHari === 0)).toBe(true)
    expect(anggaranJenuhHari(kurva)).toBe(1)

    // A real year with a generous budget eventually runs out of gaps to close.
    const nyata = kurvaMarginal(petaUntuk('lima-hari', STATUSES[0]!, 2), 20)
    const jenuh = anggaranJenuhHari(nyata)
    expect(jenuh).toBeDefined()
    if (jenuh !== undefined) {
      for (const l of nyata.filter((x) => x.anggaranHari >= jenuh)) expect(l.tambahanHari).toBe(0)
    }
  })
})
