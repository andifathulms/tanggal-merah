import { describe, expect, it } from 'vitest'
import { keIcs } from '@/lib/export/ics'
import { hitungTrace, type LeaveTrace } from '@/lib/trace'
import { dariHash, keHash, type Pengaturan } from '@/lib/share'
import { fromIsoDate, toIsoDate } from '@/lib/day'
import type { Status } from '@/lib/status'

const ASN: Status = { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 }
const DTSTAMP = '20260101T000000Z'

function trace2026(dipilihSendiri: readonly number[] = []): LeaveTrace {
  const hasil = hitungTrace({ tahun: 2026, status: ASN, pattern: 'lima-hari', dipilihSendiri })
  if (hasil.type !== 'terhitung') throw new Error('seharusnya terhitung')
  return hasil
}

/** A small structural parser — enough to check the file is well-formed ICS. */
function parseIcs(teks: string) {
  expect(teks.endsWith('\r\n')).toBe(true)
  // Unfold continuation lines before reading properties (RFC 5545 §3.1).
  const baris = teks.replace(/\r\n /g, '').split('\r\n').filter((b) => b.length > 0)

  expect(baris[0]).toBe('BEGIN:VCALENDAR')
  expect(baris[baris.length - 1]).toBe('END:VCALENDAR')

  const peristiwa: Record<string, string>[] = []
  let sekarang: Record<string, string> | null = null
  let kedalaman = 0

  for (const b of baris) {
    if (b === 'BEGIN:VEVENT') {
      sekarang = {}
      kedalaman += 1
      continue
    }
    if (b === 'END:VEVENT') {
      expect(sekarang).not.toBeNull()
      peristiwa.push(sekarang!)
      sekarang = null
      kedalaman -= 1
      continue
    }
    const pisah = b.indexOf(':')
    expect(pisah).toBeGreaterThan(0)
    const kunci = b.slice(0, pisah).split(';')[0]!
    if (sekarang !== null) sekarang[kunci] = b.slice(pisah + 1)
  }

  expect(kedalaman).toBe(0)
  return peristiwa
}

describe('ICS export', () => {
  it('produces a well-formed calendar', () => {
    const peristiwa = parseIcs(keIcs(trace2026(), 'id', DTSTAMP))
    expect(peristiwa.length).toBeGreaterThan(0)
    for (const p of peristiwa) {
      expect(p.UID).toBeDefined()
      expect(p.SUMMARY).toBeDefined()
      expect(p.DTSTART).toMatch(/^\d{8}$/)
      expect(p.DTEND).toMatch(/^\d{8}$/)
      expect(p.DTSTAMP).toBe(DTSTAMP)
    }
  })

  it('ends an all-day event on the following day, as RFC 5545 requires', () => {
    const peristiwa = parseIcs(keIcs(trace2026(), 'id', DTSTAMP))
    const merdeka = peristiwa.find((p) => p.DTSTART === '20260817')
    expect(merdeka).toBeDefined()
    expect(merdeka!.DTEND).toBe('20260818')
  })

  it('cites the instrument in every holiday event', () => {
    const peristiwa = parseIcs(keIcs(trace2026(), 'id', DTSTAMP))
    const libur = peristiwa.filter((p) => p.SUMMARY !== 'Cuti tahunan')
    expect(libur.length).toBeGreaterThan(0)
    for (const p of libur) expect(p.DESCRIPTION).toContain('SKB')
  })

  it('includes the days the user chose', () => {
    const hari = fromIsoDate('2026-08-18')
    const peristiwa = parseIcs(keIcs(trace2026([hari]), 'id', DTSTAMP))
    const cuti = peristiwa.filter((p) => p.SUMMARY === 'Cuti tahunan')
    expect(cuti).toHaveLength(1)
    expect(cuti[0]!.DTSTART).toBe('20260818')
  })

  it('omits cuti bersama when the company does not take it', () => {
    const hasil = hitungTrace({
      tahun: 2026,
      status: { type: 'swastaTanpaCutiBersama', jatahHari: 12 },
      pattern: 'lima-hari',
    })
    if (hasil.type !== 'terhitung') throw new Error('seharusnya terhitung')
    const peristiwa = parseIcs(keIcs(hasil, 'id', DTSTAMP))
    expect(peristiwa.some((p) => p.SUMMARY.startsWith('Cuti Bersama'))).toBe(false)
  })

  it('folds long lines at 75 octets', () => {
    const mentah = keIcs(trace2026(), 'id', DTSTAMP)
    for (const baris of mentah.split('\r\n')) {
      expect(new TextEncoder().encode(baris).length).toBeLessThanOrEqual(75)
    }
  })

  it('escapes separators so a comma in a holiday name cannot break the file', () => {
    const mentah = keIcs(trace2026(), 'id', DTSTAMP)
    for (const baris of mentah.replace(/\r\n /g, '').split('\r\n')) {
      if (!baris.startsWith('SUMMARY:')) continue
      expect(baris.slice('SUMMARY:'.length)).not.toMatch(/(?<!\\)[,;]/)
    }
  })
})

describe('URL hash sharing', () => {
  const bawaan: Pengaturan = {
    tahun: 2026,
    status: ASN,
    pattern: 'lima-hari',
    dipilihSendiri: [],
  }

  it('round-trips every setting', () => {
    const p: Pengaturan = {
      tahun: 2026,
      status: { type: 'swastaCutiBersamaDipotong', jatahHari: 15 },
      pattern: 'enam-hari',
      dipilihSendiri: [fromIsoDate('2026-08-18'), fromIsoDate('2026-12-28')],
    }
    expect(dariHash(keHash(p), bawaan)).toEqual(p)
  })

  it('round-trips the ASN add-back', () => {
    const p: Pengaturan = {
      tahun: 2026,
      status: { type: 'asn', jatahHari: 12, tidakDiberikanHari: 4 },
      pattern: 'lima-hari',
      dipilihSendiri: [],
    }
    expect(dariHash(keHash(p), bawaan)).toEqual(p)
  })

  it('falls back to the defaults on a junk hash rather than throwing', () => {
    expect(dariHash('#t=abc&s=bukan-status&p=tujuh-hari', bawaan)).toEqual(bawaan)
    expect(dariHash('', bawaan)).toEqual(bawaan)
  })

  it('drops one malformed day without losing the rest of the link', () => {
    const hasil = dariHash(`#t=2026&s=asn&j=12&p=lima-hari&c=2026-08-18,2026-02-30,2026-12-28`, bawaan)
    expect(hasil.dipilihSendiri.map(toIsoDate)).toEqual(['2026-08-18', '2026-12-28'])
  })
})
