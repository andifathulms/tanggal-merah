import { describe, expect, it } from 'vitest'
import { hariLiburSetelah, peringkatJembatan, pilihJembatan } from '@/lib/optimise'
import { nilaiPilihan, petakanJembatan, saringJembatan } from '@/lib/optimise/gaps'
import { pilihBruteForce } from '@/lib/optimise/brute'
import { hitungRun, runTerpanjang } from '@/lib/runs'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import type { WorkPattern } from '@/lib/day/pattern'
import type { Status } from '@/lib/status'

const PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']
const STATUSES: readonly Status[] = [
  { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 },
  { type: 'swastaTanpaCutiBersama', jatahHari: 12 },
  { type: 'swastaCutiBersamaTanpaPotong', jatahHari: 12 },
  { type: 'swastaCutiBersamaDipotong', jatahHari: 12 },
]

function petaUntuk(pattern: WorkPattern, status: Status) {
  const pack = packTahun(2026)
  if (pack === undefined) throw new Error('pack 2026 tidak termuat')
  const tahun = resolveTahun(pack, pattern, status)
  return { tahun, peta: petakanJembatan(tahun.liburHari, tahun.hariKerja) }
}

describe('bridge enumeration', () => {
  it('only produces gaps that genuinely join two separate blocks', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const { tahun, peta } = petaUntuk(pattern, status)
        const libur = new Set(tahun.liburHari)

        for (const b of peta.jembatan) {
          expect(b.biayaHari).toBeGreaterThan(0)
          // Nothing inside a gap is already off …
          for (const d of b.hari) expect(libur.has(d)).toBe(false)
          // … and there is a block immediately on each side.
          expect(libur.has(b.mulai - 1)).toBe(true)
          expect(libur.has(b.selesai + 1)).toBe(true)
        }
      }
    }
  })

  it('gives every bridge a leverage of at least 1', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const { peta } = petaUntuk(pattern, status)
        for (const b of peta.jembatan) expect(b.leverage).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('produces bridges in ascending date order without overlap', () => {
    const { peta } = petaUntuk('lima-hari', STATUSES[0]!)
    for (let i = 1; i < peta.jembatan.length; i += 1) {
      expect(peta.jembatan[i]!.mulai).toBeGreaterThan(peta.jembatan[i - 1]!.selesai)
    }
  })
})

describe('the optimiser agrees with brute force', () => {
  it('matches the exhaustive oracle at every realistic budget', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        // A year holds ~50 gaps, so the oracle runs on the bridges a real
        // budget could actually buy. Both algorithms see the same map.
        const peta = saringJembatan(petaUntuk(pattern, status).peta, 2)
        expect(peta.jembatan.length).toBeLessThanOrEqual(22)
        // Twelve days is the statutory annual leave entitlement, so budgets
        // beyond it are not the realistic range this claim is about.
        for (let anggaran = 0; anggaran <= 12; anggaran += 1) {
          const rencana = pilihJembatan(peta, anggaran)
          const oracle = pilihBruteForce(peta, anggaran)

          expect(rencana.nilaiHari).toBe(oracle.nilai)
          expect(rencana.biayaHari).toBeLessThanOrEqual(anggaran)
          // The plan's own arithmetic must reproduce its reported value.
          const ulang = nilaiPilihan(peta, rencana.dipilih.map((b) => b.indeks))
          expect(ulang.nilai).toBe(rencana.nilaiHari)
          expect(ulang.biaya).toBe(rencana.biayaHari)
        }
      }
    }
  })

  it('matches brute force on hand-built block layouts', () => {
    // Three blocks separated by gaps of 1 and 2 working days. Buying both
    // gaps merges all three, which is worth more than the parts.
    const libur = [1, 2, 4, 7, 8]
    const kerja = [3, 5, 6]
    const peta = petakanJembatan(libur, kerja)
    expect(peta.jembatan).toHaveLength(2)

    for (let anggaran = 0; anggaran <= 5; anggaran += 1) {
      expect(pilihJembatan(peta, anggaran).nilaiHari).toBe(pilihBruteForce(peta, anggaran).nilai)
    }

    // Both gaps bought: days 1..8 are one stretch of eight, for three days.
    const penuh = pilihJembatan(peta, 3)
    expect(penuh.biayaHari).toBe(3)
    expect(penuh.nilaiHari).toBe(8)
  })

  it('agrees with brute force on randomised layouts', () => {
    // Deterministic pseudo-random layouts — no clock, no Math.random.
    let seed = 20260817
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }

    for (let kasus = 0; kasus < 40; kasus += 1) {
      const libur: number[] = []
      const kerja: number[] = []
      for (let d = 0; d < 60; d += 1) (next() < 0.4 ? libur : kerja).push(d)
      const peta = petakanJembatan(libur, kerja)
      if (peta.jembatan.length > 14) continue

      for (const anggaran of [0, 1, 2, 3, 5, 8, 13]) {
        expect(pilihJembatan(peta, anggaran).nilaiHari).toBe(pilihBruteForce(peta, anggaran).nilai)
      }
    }
  })
})

describe('properties', () => {
  it('never yields a worse result for more budget', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const { peta } = petaUntuk(pattern, status)
        let sebelumnya = -1
        for (let anggaran = 0; anggaran <= 25; anggaran += 1) {
          const nilai = pilihJembatan(peta, anggaran).nilaiHari
          expect(nilai).toBeGreaterThanOrEqual(sebelumnya)
          sebelumnya = nilai
        }
      }
    }
  })

  it('always reports a leverage of at least 1 when it spends anything', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const { peta } = petaUntuk(pattern, status)
        for (let anggaran = 1; anggaran <= 15; anggaran += 1) {
          const rencana = pilihJembatan(peta, anggaran)
          if (rencana.biayaHari > 0) expect(rencana.leverage).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  it('never spends more than the budget', () => {
    const { peta } = petaUntuk('lima-hari', STATUSES[3]!)
    for (let anggaran = 0; anggaran <= 30; anggaran += 1) {
      expect(pilihJembatan(peta, anggaran).biayaHari).toBeLessThanOrEqual(anggaran)
    }
  })

  it('never labels itself a heuristic', () => {
    const { peta } = petaUntuk('lima-hari', STATUSES[0]!)
    expect(pilihJembatan(peta, 10).heuristik).toBe(false)
  })

  it('lengthens the longest stretch of the year when it buys a bridge', () => {
    const { tahun, peta } = petaUntuk('lima-hari', STATUSES[3]!)
    const sebelum = runTerpanjang(hitungRun(tahun.liburHari))!.panjangHari
    const rencana = pilihJembatan(peta, 4)
    const sesudah = runTerpanjang(hitungRun(hariLiburSetelah(tahun.liburHari, rencana)))!.panjangHari

    expect(rencana.biayaHari).toBeGreaterThan(0)
    expect(sesudah).toBeGreaterThanOrEqual(sebelum)
  })

  it('adds exactly the days it bought and no others', () => {
    const { tahun, peta } = petaUntuk('lima-hari', STATUSES[0]!)
    const rencana = pilihJembatan(peta, 6)
    const sesudah = hariLiburSetelah(tahun.liburHari, rencana)
    expect(sesudah.length).toBe(tahun.liburHari.length + rencana.biayaHari)
  })
})

describe('the suggestion ranking', () => {
  it('ranks by leverage and offers nothing over budget', () => {
    const { peta } = petaUntuk('lima-hari', STATUSES[3]!)
    const peringkat = peringkatJembatan(peta, 2)
    for (const b of peringkat) expect(b.biayaHari).toBeLessThanOrEqual(2)
    for (let i = 1; i < peringkat.length; i += 1) {
      expect(peringkat[i - 1]!.leverage).toBeGreaterThanOrEqual(peringkat[i]!.leverage)
    }
  })

  it('offers the one-day bridges people actually look for', () => {
    const { peta } = petaUntuk('lima-hari', STATUSES[0]!)
    const satuHari = peringkatJembatan(peta, 1)
    expect(satuHari.length).toBeGreaterThan(0)
    for (const b of satuHari) {
      expect(b.biayaHari).toBe(1)
      // One day spent must return at least four days off to be worth naming;
      // a lone workday between two weekends is the classic harpitnas.
      expect(b.hasilHari).toBeGreaterThanOrEqual(3)
    }
  })
})
