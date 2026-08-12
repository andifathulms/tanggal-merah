import { describe, expect, it } from 'vitest'
import { pilihJembatan, rentetanRencana, SEMUA_TUJUAN, type Tujuan } from '@/lib/optimise'
import { petakanJembatan, rentetanPilihan, saringJembatan } from '@/lib/optimise/gaps'
import { pilihBruteForce } from '@/lib/optimise/brute'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import type { WorkPattern } from '@/lib/day/pattern'
import type { Status } from '@/lib/status'

/**
 * Two objectives, both exact. Invariant 8 says the optimiser reports the true
 * optimum rather than a greedy approximation, and adding a second question to ask
 * of the same map does not get to weaken that — so the new objective is asserted
 * against its own brute-force oracle at every realistic budget, exactly as the
 * original one is.
 */

const PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']
const STATUSES: readonly Status[] = [
  { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 },
  { type: 'swastaCutiBersamaDipotong', jatahHari: 12 },
]
const ANGGARAN = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12]

function petaUntuk(pattern: WorkPattern, status: Status, maksBiayaHari = 3) {
  const pack = packTahun(2026)
  if (pack === undefined) throw new Error('pack 2026 tidak termuat')
  const tahun = resolveTahun(pack, pattern, status)
  return saringJembatan(petakanJembatan(tahun.liburHari, tahun.hariKerja), maksBiayaHari)
}

describe('rentetanTerpanjang', () => {
  it('matches brute force at every realistic budget', () => {
    for (const pattern of PATTERNS) {
      for (const status of STATUSES) {
        const peta = petaUntuk(pattern, status)
        for (const anggaranHari of ANGGARAN) {
          const rencana = pilihJembatan(peta, anggaranHari, 'rentetanTerpanjang')
          const oracle = pilihBruteForce(peta, anggaranHari, 'rentetanTerpanjang')
          expect(rencana.nilaiHari, `${pattern} ${status.type} @${anggaranHari}`).toBe(oracle.nilai)
        }
      }
    }
  })

  it('reports a value that really is one stretch, not a sum of several', () => {
    for (const pattern of PATTERNS) {
      const peta = petaUntuk(pattern, STATUSES[0]!)
      for (const anggaranHari of ANGGARAN) {
        const rencana = pilihJembatan(peta, anggaranHari, 'rentetanTerpanjang')
        if (rencana.dipilih.length === 0) continue

        const { panjang } = rentetanPilihan(
          peta,
          rencana.dipilih.map((b) => b.indeks),
        )
        // The headline figure is the longest single stretch the plan produced.
        expect(Math.max(...panjang)).toBe(rencana.nilaiHari)
        expect(rentetanRencana(peta, rencana)[0]).toBe(rencana.nilaiHari)
      }
    }
  })

  it('never buys a bridge that does not raise the longest stretch', () => {
    // Cost is the tie-break, so a plan optimising for one long run has no reason
    // to spend leave on a second stretch it is not reporting.
    for (const pattern of PATTERNS) {
      const peta = petaUntuk(pattern, STATUSES[0]!)
      for (const anggaranHari of ANGGARAN) {
        const rencana = pilihJembatan(peta, anggaranHari, 'rentetanTerpanjang')
        if (rencana.dipilih.length === 0) continue
        const { panjang } = rentetanPilihan(
          peta,
          rencana.dipilih.map((b) => b.indeks),
        )
        expect(panjang.length).toBe(1)
      }
    }
  })

  it('can beat the total-days objective on longest run, and lose on total', () => {
    // The two objectives are genuinely different questions, not two spellings of
    // one. If this ever stopped holding, the choice would be theatre.
    const peta = petaUntuk('lima-hari', STATUSES[0]!)
    let adaPerbedaan = false

    for (const anggaranHari of ANGGARAN) {
      const total = pilihJembatan(peta, anggaranHari, 'totalHariLibur')
      const panjang = pilihJembatan(peta, anggaranHari, 'rentetanTerpanjang')

      const terpanjangDariTotal = Math.max(
        0,
        ...rentetanPilihan(peta, total.dipilih.map((b) => b.indeks)).panjang,
      )
      // The longest-run plan is never beaten at its own objective …
      expect(panjang.nilaiHari).toBeGreaterThanOrEqual(terpanjangDariTotal)

      const totalDariPanjang = rentetanPilihan(peta, panjang.dipilih.map((b) => b.indeks)).panjang.reduce(
        (n, p) => n + p,
        0,
      )
      // … and never beats the total plan at the total plan's objective.
      expect(total.nilaiHari).toBeGreaterThanOrEqual(totalDariPanjang)

      if (total.nilaiHari !== panjang.nilaiHari) adaPerbedaan = true
    }

    expect(adaPerbedaan).toBe(true)
  })
})

describe('both objectives', () => {
  it('never gets worse as the budget grows', () => {
    for (const tujuan of SEMUA_TUJUAN) {
      const peta = petaUntuk('lima-hari', STATUSES[1]!)
      let sebelumnya = 0
      for (let anggaranHari = 0; anggaranHari <= 12; anggaranHari += 1) {
        const rencana = pilihJembatan(peta, anggaranHari, tujuan)
        expect(rencana.nilaiHari, `${tujuan} @${anggaranHari}`).toBeGreaterThanOrEqual(sebelumnya)
        sebelumnya = rencana.nilaiHari
      }
    }
  })

  it('never spends more than the budget, and labels itself exact', () => {
    for (const tujuan of SEMUA_TUJUAN) {
      for (const pattern of PATTERNS) {
        const peta = petaUntuk(pattern, STATUSES[0]!)
        for (const anggaranHari of ANGGARAN) {
          const rencana = pilihJembatan(peta, anggaranHari, tujuan)
          expect(rencana.biayaHari).toBeLessThanOrEqual(anggaranHari)
          expect(rencana.tujuan).toBe(tujuan)
          expect(rencana.heuristik).toBe(false)
        }
      }
    }
  })

  it('defaults to the objective the app has always computed', () => {
    const peta = petaUntuk('lima-hari', STATUSES[0]!)
    const bawaan = pilihJembatan(peta, 5)
    const eksplisit = pilihJembatan(peta, 5, 'totalHariLibur')
    expect(bawaan.tujuan).toBe<Tujuan>('totalHariLibur')
    expect(bawaan.nilaiHari).toBe(eksplisit.nilaiHari)
    expect(bawaan.biayaHari).toBe(eksplisit.biayaHari)
  })
})
