import { describe, expect, it } from 'vitest'
import { fromIsoDate } from '@/lib/day'
import { isAkhirPekan, WORK_PATTERNS } from '@/lib/day/pattern'
import { hitungHilang, kehilanganLebihBanyak, polaLainnya } from '@/lib/rules/hilang'
import { packTahun, tahunTersedia } from '@/lib/rules/loader'
import type { RulePack } from '@/lib/rules/schema'

/**
 * A holiday landing on a day you were off anyway is worth nothing, and how many
 * of those a year contains depends on the working week. Both halves are asserted
 * here: the arithmetic, and the asymmetry between the two patterns.
 */

const SITASI = {
  instrumen: 'SKB uji',
  nomor: 'UJI-1',
  ditandatangani: '2025-01-01',
} as const

function packUji(tahun: number, hari: readonly (readonly [string, 'liburNasional' | 'cutiBersama'])[]): RulePack {
  return {
    tahun,
    status: 'terverifikasi',
    sumber: [SITASI],
    hari: hari.map(([tanggal, jenis]) => ({
      tanggal,
      nama: `Uji ${tanggal}`,
      namaEn: `Test ${tanggal}`,
      jenis,
      sitasi: SITASI,
    })),
  }
}

describe('hitungHilang', () => {
  it('splits libur nasional into the ones that gain a day and the ones that do not', () => {
    // 2026-01-01 is a Thursday, 2026-01-03 a Saturday, 2026-01-04 a Sunday.
    const pack = packUji(2026, [
      ['2026-01-01', 'liburNasional'],
      ['2026-01-03', 'liburNasional'],
      ['2026-01-04', 'liburNasional'],
    ])

    const lima = hitungHilang(pack, 'lima-hari')
    expect(lima.liburNasionalHari).toBe(3)
    expect(lima.liburNasionalDiAkhirPekanHari).toBe(2)
    expect(lima.liburNasionalMenambahHari).toBe(1)

    const enam = hitungHilang(pack, 'enam-hari')
    expect(enam.liburNasionalDiAkhirPekanHari).toBe(1)
    expect(enam.liburNasionalMenambahHari).toBe(2)
  })

  it('counts cuti bersama landing on a day already off separately', () => {
    const pack = packUji(2026, [
      ['2026-01-02', 'cutiBersama'],
      ['2026-01-03', 'cutiBersama'],
    ])

    const lima = hitungHilang(pack, 'lima-hari')
    expect(lima.cutiBersamaHari).toBe(2)
    expect(lima.cutiBersamaDiAkhirPekanHari).toBe(1)

    // A six-day week works Saturdays, so both cost something.
    expect(hitungHilang(pack, 'enam-hari').cutiBersamaDiAkhirPekanHari).toBe(0)
  })

  it('reports the other pattern, and the parts always sum to the whole', () => {
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      expect(pack).toBeDefined()
      if (pack === undefined) continue

      for (const pattern of WORK_PATTERNS) {
        const r = hitungHilang(pack, pattern)
        expect(r.pattern).toBe(pattern)
        expect(r.polaLain).toBe(polaLainnya(pattern))
        expect(r.liburNasionalDiAkhirPekanHari + r.liburNasionalMenambahHari).toBe(r.liburNasionalHari)
        expect(r.cutiBersamaDiAkhirPekanHari).toBeLessThanOrEqual(r.cutiBersamaHari)
      }
    }
  })

  it('never lets a six-day week lose more holidays than a five-day week', () => {
    // Sunday is off under both patterns and Saturday only under five, so the
    // five-day count is an upper bound on the six-day one for any pack.
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      if (pack === undefined) continue

      const lima = hitungHilang(pack, 'lima-hari')
      const enam = hitungHilang(pack, 'enam-hari')

      expect(enam.liburNasionalDiAkhirPekanHari).toBeLessThanOrEqual(lima.liburNasionalDiAkhirPekanHari)
      expect(kehilanganLebihBanyak(enam)).toBe(false)
      // And each pattern's view of the other agrees with computing it directly.
      expect(lima.liburNasionalDiAkhirPekanPolaLainHari).toBe(enam.liburNasionalDiAkhirPekanHari)
      expect(enam.liburNasionalDiAkhirPekanPolaLainHari).toBe(lima.liburNasionalDiAkhirPekanHari)
    }
  })

  it('agrees with a direct scan of the pack', () => {
    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      if (pack === undefined) continue

      for (const pattern of WORK_PATTERNS) {
        const naif = pack.hari.filter(
          (h) => h.jenis === 'liburNasional' && isAkhirPekan(fromIsoDate(h.tanggal), pattern),
        ).length
        expect(hitungHilang(pack, pattern).liburNasionalDiAkhirPekanHari).toBe(naif)
      }
    }
  })

  it('handles a pack whose holidays all fall on working days', () => {
    // 2026-01-01 Thursday, 2026-01-02 Friday.
    const pack = packUji(2026, [
      ['2026-01-01', 'liburNasional'],
      ['2026-01-02', 'liburNasional'],
    ])
    const r = hitungHilang(pack, 'lima-hari')
    expect(r.liburNasionalDiAkhirPekanHari).toBe(0)
    expect(r.liburNasionalMenambahHari).toBe(2)
  })
})
