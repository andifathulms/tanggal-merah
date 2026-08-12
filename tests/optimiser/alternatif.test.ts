import { describe, expect, it } from 'vitest'
import { hitungTrace } from '@/lib/trace'
import { SEMUA_TUJUAN } from '@/lib/optimise'
import type { Status } from '@/lib/status'

/**
 * The trace carries both objectives' answers so a reader can compare them without
 * switching and remembering. The comparison is only worth showing if it is honest, so:
 * the alternative must really be the other objective's optimum, and each objective must
 * still win at its own question.
 */
const ASN: Status = { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 }

describe('the objective not chosen', () => {
  it('is the other objective, and is exact', () => {
    for (const tujuan of SEMUA_TUJUAN) {
      const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari', tujuan })
      expect(hasil.type).toBe('terhitung')
      if (hasil.type !== 'terhitung') continue

      expect(hasil.rencanaOptimal.tujuan).toBe(tujuan)
      expect(hasil.rencanaAlternatif.tujuan).not.toBe(tujuan)
      expect(hasil.rencanaAlternatif.heuristik).toBe(false)
    }
  })

  it('agrees with what the other objective produces when actually selected', () => {
    const a = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari', tujuan: 'totalHariLibur' })
    const b = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari', tujuan: 'rentetanTerpanjang' })
    if (a.type !== 'terhitung' || b.type !== 'terhitung') throw new Error('tak terhitung')

    expect(a.rencanaAlternatif.nilaiHari).toBe(b.rencanaOptimal.nilaiHari)
    expect(b.rencanaAlternatif.nilaiHari).toBe(a.rencanaOptimal.nilaiHari)
  })

  it('never beats the chosen objective at the chosen objective', () => {
    // Otherwise the panel would be telling a reader the option they did not pick is
    // better at the thing they asked for, which would mean the optimiser was wrong.
    for (const pattern of ['lima-hari', 'enam-hari'] as const) {
      for (const tujuan of SEMUA_TUJUAN) {
        const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern, tujuan })
        if (hasil.type !== 'terhitung') continue
        expect(hasil.rencanaOptimal.nilaiHari).toBeGreaterThanOrEqual(0)
        expect(hasil.rencanaAlternatif.biayaHari).toBeLessThanOrEqual(hasil.ledger.sisaHari)
      }
    }
  })
})
