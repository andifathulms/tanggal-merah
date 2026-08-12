import { describe, expect, it } from 'vitest'
import { hitungTrace } from '@/lib/trace'
import { contohJembatan } from '@/lib/trace/contoh'
import type { Status } from '@/lib/status'
import type { WorkPattern } from '@/lib/day/pattern'

/**
 * The worked example is the app's only end-to-end explanation, so its arithmetic has
 * to be exactly the arithmetic the rest of the app reports. If the example and the
 * suggestion list ever disagreed, the teaching would be worse than none.
 */
const ASN: Status = { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 }
const PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']

function contohUntuk(pattern: WorkPattern) {
  const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern })
  if (hasil.type !== 'terhitung') throw new Error('tak terhitung')
  return { trace: hasil, contoh: contohJembatan(hasil) }
}

describe('contohJembatan', () => {
  it('adds up: left block plus what you buy plus right block is the stretch', () => {
    for (const pattern of PATTERNS) {
      const { contoh } = contohUntuk(pattern)
      expect(contoh, pattern).toBeDefined()
      if (contoh === undefined) continue

      expect(contoh.blokKiriHari + contoh.dibeliHari + contoh.blokKananHari).toBe(contoh.sesudahHari)
      expect(contoh.sebelumHari + contoh.dibeliHari).toBe(contoh.sesudahHari)
      expect(contoh.hari.length).toBe(contoh.sesudahHari)
    }
  })

  it('reports the same trade the suggestion list reports', () => {
    for (const pattern of PATTERNS) {
      const { trace, contoh } = contohUntuk(pattern)
      if (contoh === undefined) continue
      expect(contoh.jembatan).toBe(trace.saran[0])
      expect(contoh.dibeliHari).toBe(trace.saran[0]?.biayaHari)
      expect(contoh.sesudahHari).toBe(trace.saran[0]?.hasilHari)
    }
  })

  it('marks exactly the bought days as bought, and they are all working days', () => {
    for (const pattern of PATTERNS) {
      const { contoh } = contohUntuk(pattern)
      if (contoh === undefined) continue

      const dibeli = contoh.hari.filter((h) => h.peran === 'dibeli')
      expect(dibeli.length).toBe(contoh.dibeliHari)
      expect(dibeli.map((h) => h.hari)).toEqual([...contoh.jembatan.hari])
      // What you buy must be a day you would otherwise have worked.
      for (const h of dibeli) expect(h.klasifikasi.libur).toBe(false)
    }
  })

  it('has every day of both blocks already off, which is why buying joins them', () => {
    for (const pattern of PATTERNS) {
      const { contoh } = contohUntuk(pattern)
      if (contoh === undefined) continue
      for (const h of contoh.hari.filter((x) => x.peran !== 'dibeli')) {
        expect(h.klasifikasi.libur).toBe(true)
      }
    }
  })

  it('runs contiguously with no gaps, in ascending order', () => {
    for (const pattern of PATTERNS) {
      const { contoh } = contohUntuk(pattern)
      if (contoh === undefined) continue
      for (let i = 1; i < contoh.hari.length; i += 1) {
        expect(contoh.hari[i]!.hari).toBe(contoh.hari[i - 1]!.hari + 1)
      }
    }
  })
})
