import { describe, expect, it } from 'vitest'
import { hitungRun, runTerpanjang, runYangMemuat, totalHariLibur, type Run } from '@/lib/runs'
import { daysOfYear, fromIsoDate, type DayNumber } from '@/lib/day'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import type { WorkPattern } from '@/lib/day/pattern'
import type { Status } from '@/lib/status'
import { hariRentetanPanjang } from '@/lib/sheet/layout'

/** Naive day-by-day scan. Deliberately dumb; it is the thing we trust. */
function runsNaif(liburHari: readonly DayNumber[], dari: DayNumber, sampai: DayNumber): Run[] {
  const libur = new Set(liburHari)
  const runs: Run[] = []
  let mulai: DayNumber | null = null
  for (let d = dari; d <= sampai + 1; d += 1) {
    if (libur.has(d)) {
      if (mulai === null) mulai = d
    } else if (mulai !== null) {
      runs.push({ mulai, selesai: d - 1, panjangHari: d - mulai })
      mulai = null
    }
  }
  return runs
}

const STATUSES: readonly Status[] = [
  { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 },
  { type: 'swastaTanpaCutiBersama', jatahHari: 12 },
  { type: 'swastaCutiBersamaDipotong', jatahHari: 12 },
]
const PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']

describe('run computation', () => {
  it('joins adjacent days and separates non-adjacent ones', () => {
    expect(hitungRun([1, 2, 3, 7, 8, 20])).toEqual([
      { mulai: 1, selesai: 3, panjangHari: 3 },
      { mulai: 7, selesai: 8, panjangHari: 2 },
      { mulai: 20, selesai: 20, panjangHari: 1 },
    ])
  })

  it('tolerates unsorted and duplicated input', () => {
    expect(hitungRun([8, 1, 2, 2, 3, 7, 8])).toEqual(hitungRun([1, 2, 3, 7, 8]))
  })

  it('returns nothing for no days off', () => {
    expect(hitungRun([])).toEqual([])
  })

  it('matches a naive scan across the whole year, under both work patterns', () => {
    const pack = packTahun(2026)
    if (pack === undefined) throw new Error('pack 2026 tidak termuat')
    const days = daysOfYear(2026)
    const dari = days[0]!
    const sampai = days[days.length - 1]!

    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const tahun = resolveTahun(pack, pattern, status)
        expect(hitungRun(tahun.liburHari)).toEqual(runsNaif(tahun.liburHari, dari, sampai))
      }
    }
  })

  it('never produces touching runs', () => {
    const runs = hitungRun([1, 2, 4, 5, 6, 9])
    for (let i = 1; i < runs.length; i += 1) {
      expect(runs[i]!.mulai).toBeGreaterThan(runs[i - 1]!.selesai + 1)
    }
  })

  it('accounts for every day off exactly once', () => {
    const hari = [3, 4, 5, 10, 11, 40]
    expect(totalHariLibur(hitungRun(hari))).toBe(hari.length)
  })

  it('finds the run containing a day, and nothing for a worked day', () => {
    const runs = hitungRun([10, 11, 12])
    expect(runYangMemuat(runs, 11)?.panjangHari).toBe(3)
    expect(runYangMemuat(runs, 13)).toBeUndefined()
  })

  it('picks out the longest stretch of the year', () => {
    const pack = packTahun(2026)
    if (pack === undefined) throw new Error('pack 2026 tidak termuat')
    const tahun = resolveTahun(pack, 'lima-hari', { type: 'swastaCutiBersamaDipotong', jatahHari: 12 })
    const terpanjang = runTerpanjang(hitungRun(tahun.liburHari))

    // The Idulfitri block is the long one in this pack, and it is long only
    // because cuti bersama is taken — which is the whole point of §1.
    expect(terpanjang).toBeDefined()
    expect(terpanjang!.mulai).toBeLessThanOrEqual(fromIsoDate('2026-03-20'))
    expect(terpanjang!.selesai).toBeGreaterThanOrEqual(fromIsoDate('2026-03-21'))
  })
})

describe('run bars on the sheet', () => {
  it('ignores an ordinary two-day weekend', () => {
    // Sat–Sun alone is a run, but marking it would light up every weekend
    // column and leave the bar meaning nothing.
    expect(hariRentetanPanjang([10, 11]).size).toBe(0)
  })

  it('marks every day of a three-day stretch', () => {
    expect([...hariRentetanPanjang([10, 11, 12])].sort((a, b) => a - b)).toEqual([10, 11, 12])
  })

  it('marks the long stretch and leaves the short one alone', () => {
    expect([...hariRentetanPanjang([1, 2, 10, 11, 12, 13])].sort((a, b) => a - b)).toEqual([10, 11, 12, 13])
  })

  it('agrees with the runs it is derived from', () => {
    const pack = packTahun(2026)
    if (pack === undefined) throw new Error('pack 2026 tidak termuat')
    for (const pattern of PATTERNS) {
      const tahun = resolveTahun(pack, pattern, STATUSES[2]!)
      const ditandai = hariRentetanPanjang(tahun.liburHari)
      const panjang = hitungRun(tahun.liburHari).filter((r) => r.panjangHari >= 3)
      expect(ditandai.size).toBe(panjang.reduce((n, r) => n + r.panjangHari, 0))
      for (const r of panjang) for (let d = r.mulai; d <= r.selesai; d += 1) expect(ditandai.has(d)).toBe(true)
    }
  })
})
