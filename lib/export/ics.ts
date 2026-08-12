import { civilOf, toIsoDate, type DayNumber } from '@/lib/day'
import type { LeaveTrace } from '@/lib/trace'
import type { Locale } from '@/lib/i18n'
import { namaLibur } from '@/lib/i18n'

/**
 * ICS export (PRD §5.6) — holidays and chosen leave, so it lands in a real
 * calendar. No accounts and no calendar sync; the user's own calendar does
 * that.
 *
 * All-day events use DATE values with a non-inclusive DTEND, per RFC 5545.
 * Lines are folded at 75 octets.
 */

const CRLF = '\r\n'

function padatTanggal(hari: DayNumber): string {
  const { year, month, day } = civilOf(hari)
  return `${String(year).padStart(4, '0')}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
}

function escapeIcs(teks: string): string {
  return teks.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

// TextEncoder rather than Buffer — this runs in the browser, where the file
// is generated client-side. There is no server.
const OKTET = new TextEncoder()

function panjangOktet(teks: string): number {
  return OKTET.encode(teks).length
}

/** RFC 5545 §3.1: fold at 75 octets, continuation lines start with a space. */
function lipat(baris: string): string {
  if (panjangOktet(baris) <= 75) return baris

  const potongan: string[] = []
  let sisa = baris
  let batas = 75
  while (panjangOktet(sisa) > batas) {
    let potong = batas
    while (panjangOktet(sisa.slice(0, potong)) > batas) potong -= 1
    potongan.push(sisa.slice(0, potong))
    sisa = sisa.slice(potong)
    batas = 74 // continuation lines carry a leading space
  }
  potongan.push(sisa)
  return potongan.join(`${CRLF} `)
}

/**
 * `dtstamp` is passed in rather than read from the clock — the engine never
 * reads it, and a deterministic stamp keeps the output testable.
 */
export function keIcs(trace: LeaveTrace, locale: Locale, dtstamp: string): string {
  const baris: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tanggal Merah//Perencana Libur dan Cuti//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(`Tanggal Merah ${trace.tahun}`)}`,
  ]

  const dipilih = new Set(trace.dipilihSendiri)

  for (const hari of trace.terselesaikan.hari) {
    let ringkasan: string | null = null
    let keterangan = ''

    switch (hari.type) {
      case 'liburNasional':
        ringkasan = namaLibur(hari.entri, locale)
        keterangan = `${hari.entri.sitasi.instrumen} — ${hari.entri.sitasi.nomor}`
        break
      case 'cutiBersama':
        if (!hari.libur) break
        ringkasan = `${namaLibur(hari.entri, locale)}`
        keterangan = `${hari.entri.sitasi.instrumen} — ${hari.entri.sitasi.nomor}`
        break
      case 'akhirPekan':
      case 'hariKerja':
        break
      default:
        exhaustive(hari)
    }

    if (ringkasan === null) continue
    baris.push(...peristiwa(hari.hari, ringkasan, keterangan, dtstamp))
  }

  for (const hari of dipilih) {
    baris.push(
      ...peristiwa(
        hari,
        locale === 'id' ? 'Cuti tahunan' : 'Annual leave',
        locale === 'id' ? 'Dipilih di Tanggal Merah' : 'Chosen in Tanggal Merah',
        dtstamp,
      ),
    )
  }

  baris.push('END:VCALENDAR')
  return baris.map(lipat).join(CRLF) + CRLF
}

function peristiwa(hari: DayNumber, ringkasan: string, keterangan: string, dtstamp: string): string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${toIsoDate(hari)}-${slug(ringkasan)}@tanggal-merah`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${padatTanggal(hari)}`,
    // DTEND is non-inclusive for an all-day event.
    `DTEND;VALUE=DATE:${padatTanggal(hari + 1)}`,
    `SUMMARY:${escapeIcs(ringkasan)}`,
    ...(keterangan.length > 0 ? [`DESCRIPTION:${escapeIcs(keterangan)}`] : []),
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
  ]
}

function slug(teks: string): string {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function exhaustive(value: never): never {
  throw new Error(`Klasifikasi hari tidak dikenal: ${JSON.stringify(value)}`)
}
