import { describe, expect, it } from 'vitest'
import { hitungTrace } from '@/lib/trace'
import { messagePenolakanEn, pesanPenolakan } from '@/lib/rules/refusal'
import { tahunTersedia } from '@/lib/rules/loader'
import type { Status } from '@/lib/status'

const ASN: Status = { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 }

describe('refusal', () => {
  it('refuses a year with no published SKB', () => {
    const hasil = hitungTrace({ tahun: 2031, status: ASN, pattern: 'lima-hari' })
    expect(hasil.type).toBe('ditolak')
    if (hasil.type !== 'ditolak') throw new Error('seharusnya ditolak')
    expect(hasil.penolakan.type).toBe('skbBelumTerbit')
  })

  it('computes a year that does have one', () => {
    const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    expect(hasil.type).toBe('terhitung')
    if (hasil.type !== 'terhitung') throw new Error('seharusnya terhitung')
    expect(hasil.run.length).toBeGreaterThan(0)
    expect(hasil.ledger.entitlement.sisaHari).toBe(12)
  })

  it('refuses every unpublished year, not merely distant ones', () => {
    const tersedia = new Set(tahunTersedia())
    for (let tahun = 2020; tahun <= 2035; tahun += 1) {
      const hasil = hitungTrace({ tahun, status: ASN, pattern: 'lima-hari' })
      expect(hasil.type).toBe(tersedia.has(tahun) ? 'terhitung' : 'ditolak')
    }
  })

  it('never projects from a neighbouring year', () => {
    // 2027 sits next to a year that does have a pack. It must still refuse.
    const hasil = hitungTrace({ tahun: 2027, status: ASN, pattern: 'lima-hari' })
    expect(hasil.type).toBe('ditolak')
  })

  it('names the gap and the years that are available', () => {
    const hasil = hitungTrace({ tahun: 2031, status: ASN, pattern: 'lima-hari' })
    if (hasil.type !== 'ditolak') throw new Error('seharusnya ditolak')

    const pesan = pesanPenolakan(hasil.penolakan)
    expect(pesan).toContain('2031')
    expect(pesan).toContain('2026')
    expect(pesan).toMatch(/tidak menghitung sendiri/)

    const en = messagePenolakanEn(hasil.penolakan)
    expect(en).toContain('2031')
    expect(en).toMatch(/decreed, not computed/)
  })
})

describe('determinism', () => {
  it('returns the same trace for the same input', () => {
    const permintaan = { tahun: 2026, status: ASN, pattern: 'lima-hari' } as const
    const a = hitungTrace(permintaan)
    const b = hitungTrace(permintaan)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('the trace', () => {
  it('flags a draft pack so the UI can say so', () => {
    const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    if (hasil.type !== 'terhitung') throw new Error('seharusnya terhitung')
    expect(hasil.perluVerifikasi).toBe(true)
  })

  it('carries the entitlement contradiction into the ledger', () => {
    const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    if (hasil.type !== 'terhitung') throw new Error('seharusnya terhitung')
    expect(hasil.ledger.kontradiksi.length).toBeGreaterThan(0)
    const entri = hasil.ledger.kontradiksi[0]!
    expect(entri.bacaan.length).toBeGreaterThanOrEqual(2)
    expect(entri.bacaan.some((b) => b.id === entri.dipakai)).toBe(true)
  })

  it('spends hand-picked days out of the budget before suggesting bridges', () => {
    const dasar = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    if (dasar.type !== 'terhitung') throw new Error('seharusnya terhitung')

    const satu = dasar.terselesaikan.hariKerja[0]!
    const dengan = hitungTrace({
      tahun: 2026,
      status: ASN,
      pattern: 'lima-hari',
      dipilihSendiri: [satu],
    })
    if (dengan.type !== 'terhitung') throw new Error('seharusnya terhitung')

    expect(dengan.ledger.terpakaiHari).toBe(1)
    expect(dengan.ledger.sisaHari).toBe(dasar.ledger.sisaHari - 1)
  })

  it('ignores a hand-picked day that is already off', () => {
    const dasar = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    if (dasar.type !== 'terhitung') throw new Error('seharusnya terhitung')

    const sudahLibur = dasar.terselesaikan.liburHari[0]!
    const dengan = hitungTrace({
      tahun: 2026,
      status: ASN,
      pattern: 'lima-hari',
      dipilihSendiri: [sudahLibur],
    })
    if (dengan.type !== 'terhitung') throw new Error('seharusnya terhitung')
    expect(dengan.ledger.terpakaiHari).toBe(0)
  })

  it('leaves a deducting private worker less to spend than an ASN', () => {
    const asn = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari' })
    const swasta = hitungTrace({
      tahun: 2026,
      status: { type: 'swastaCutiBersamaDipotong', jatahHari: 12 },
      pattern: 'lima-hari',
    })
    if (asn.type !== 'terhitung' || swasta.type !== 'terhitung') throw new Error('seharusnya terhitung')

    expect(swasta.ledger.sisaHari).toBeLessThan(asn.ledger.sisaHari)
    expect(asn.ledger.sisaHari - swasta.ledger.sisaHari).toBe(swasta.ledger.cutiBersamaHariKerjaHari)
  })
})
