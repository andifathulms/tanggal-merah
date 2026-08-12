import { describe, expect, it } from 'vitest'
import { packTahun } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import { hitungEntitlement, SEMUA_STATUS, type Status } from '@/lib/status'
import type { WorkPattern } from '@/lib/day/pattern'

const JATAH = 12

function pack2026() {
  const pack = packTahun(2026)
  if (pack === undefined) throw new Error('pack 2026 tidak termuat')
  return pack
}

function statusOf(type: Status['type'], jatahHari = JATAH): Status {
  return type === 'asn' ? { type: 'asn', jatahHari, tidakDiberikanHari: 0 } : { type, jatahHari }
}

describe('entitlement branches', () => {
  const pack = pack2026()

  it('does not reduce an ASN entitlement by cuti bersama', () => {
    const status = statusOf('asn')
    const tahun = resolveTahun(pack, 'lima-hari', status)
    const entitlement = hitungEntitlement(status, tahun.cutiBersamaHariKerjaHari)

    expect(tahun.cutiBersamaHariKerjaHari).toBeGreaterThan(0)
    expect(entitlement.dipotongCutiBersamaHari).toBe(0)
    expect(entitlement.sisaHari).toBe(JATAH)
  })

  it('adds back cuti bersama an ASN could not take because of their post', () => {
    const status: Status = { type: 'asn', jatahHari: JATAH, tidakDiberikanHari: 3 }
    const entitlement = hitungEntitlement(status, 8)
    expect(entitlement.ditambahHari).toBe(3)
    expect(entitlement.sisaHari).toBe(JATAH + 3)
  })

  it('reduces a deducting private employer by exactly the cuti bersama working days', () => {
    const status = statusOf('swastaCutiBersamaDipotong')
    const tahun = resolveTahun(pack, 'lima-hari', status)
    const entitlement = hitungEntitlement(status, tahun.cutiBersamaHariKerjaHari)

    expect(entitlement.dipotongCutiBersamaHari).toBe(tahun.cutiBersamaHariKerjaHari)
    expect(entitlement.sisaHari).toBe(JATAH - tahun.cutiBersamaHariKerjaHari)
  })

  it('differs between the two private branches by exactly the cuti bersama count', () => {
    const dipotong = statusOf('swastaCutiBersamaDipotong')
    const tanpaPotong = statusOf('swastaCutiBersamaTanpaPotong')
    const tahun = resolveTahun(pack, 'lima-hari', dipotong)
    const n = tahun.cutiBersamaHariKerjaHari

    const a = hitungEntitlement(tanpaPotong, n).sisaHari
    const b = hitungEntitlement(dipotong, n).sisaHari
    expect(a - b).toBe(n)
  })

  it('never returns a negative remaining entitlement', () => {
    const status = statusOf('swastaCutiBersamaDipotong', 2)
    expect(hitungEntitlement(status, 8).sisaHari).toBe(0)
  })

  it('cites an instrument, never reporting, on every branch', () => {
    for (const type of SEMUA_STATUS) {
      const entitlement = hitungEntitlement(statusOf(type), 8)
      expect(entitlement.instrumen).toMatch(/SKB|Keppres/)
      expect(entitlement.dasar.length).toBeGreaterThan(20)
    }
  })
})

describe('resolution by status', () => {
  const pack = pack2026()

  it('makes cuti bersama a working day when the company does not take it', () => {
    const tanpa = resolveTahun(pack, 'lima-hari', statusOf('swastaTanpaCutiBersama'))
    const ikut = resolveTahun(pack, 'lima-hari', statusOf('swastaCutiBersamaDipotong'))

    const cbTanpa = tanpa.hari.filter((h) => h.type === 'cutiBersama')
    const cbIkut = ikut.hari.filter((h) => h.type === 'cutiBersama')

    expect(cbTanpa.every((h) => h.libur === false)).toBe(true)
    expect(cbIkut.every((h) => h.libur === true)).toBe(true)
    expect(ikut.liburHari.length - tanpa.liburHari.length).toBe(tanpa.cutiBersamaHariKerjaHari)
  })

  it('keeps libur nasional and cuti bersama as different types', () => {
    const tahun = resolveTahun(pack, 'lima-hari', statusOf('asn'))
    const nasional = tahun.hari.filter((h) => h.type === 'liburNasional')
    const bersama = tahun.hari.filter((h) => h.type === 'cutiBersama')

    expect(nasional.length).toBeGreaterThan(0)
    expect(bersama.length).toBeGreaterThan(0)
    for (const h of nasional) if (h.type === 'liburNasional') expect(h.entri.jenis).toBe('liburNasional')
    for (const h of bersama) if (h.type === 'cutiBersama') expect(h.entri.jenis).toBe('cutiBersama')
  })

  it('classifies every day of the year exactly once', () => {
    const patterns: readonly WorkPattern[] = ['lima-hari', 'enam-hari']
    for (const pattern of patterns) {
      const tahun = resolveTahun(pack, pattern, statusOf('asn'))
      expect(tahun.hari).toHaveLength(365)
      expect(tahun.liburHari.length + tahun.hariKerja.length).toBe(365)
      expect(new Set(tahun.hari.map((h) => h.hari)).size).toBe(365)
    }
  })

  it('gives a six-day week more working days than a five-day week', () => {
    const lima = resolveTahun(pack, 'lima-hari', statusOf('asn'))
    const enam = resolveTahun(pack, 'enam-hari', statusOf('asn'))
    expect(enam.hariKerja.length).toBeGreaterThan(lima.hariKerja.length)
  })
})
