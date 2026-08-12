import { fromIsoDate, toIsoDate, type DayNumber } from '@/lib/day'
import { WORK_PATTERNS, type WorkPattern } from '@/lib/day/pattern'
import { SEMUA_STATUS, type JenisStatus, type Status } from '@/lib/status'
import { isTujuan, TUJUAN_BAWAAN, type Tujuan } from '@/lib/optimise/tujuan'

/**
 * Year, status, work pattern, and chosen days encode into the URL hash
 * (PRD §5.7). No server, so the hash is the whole sharing mechanism.
 *
 * Days are stored as ISO dates rather than day numbers so a shared link is
 * readable and survives any future change to the epoch.
 */

export type Pengaturan = {
  readonly tahun: number
  readonly status: Status
  readonly pattern: WorkPattern
  readonly dipilihSendiri: readonly DayNumber[]
  readonly tujuan: Tujuan
}

export function keHash(p: Pengaturan): string {
  const params = new URLSearchParams()
  params.set('t', String(p.tahun))
  params.set('s', p.status.type)
  params.set('j', String(p.status.jatahHari))
  if (p.status.type === 'asn' && p.status.tidakDiberikanHari > 0) {
    params.set('x', String(p.status.tidakDiberikanHari))
  }
  params.set('p', p.pattern)
  // Omitted when it is the default, so existing shared links keep working and
  // stay as short as they were.
  if (p.tujuan !== TUJUAN_BAWAAN) params.set('o', p.tujuan)
  if (p.dipilihSendiri.length > 0) {
    params.set('c', p.dipilihSendiri.map(toIsoDate).join(','))
  }
  return params.toString()
}

export function dariHash(hash: string, bawaan: Pengaturan): Pengaturan {
  const bersih = hash.startsWith('#') ? hash.slice(1) : hash
  if (bersih.length === 0) return bawaan

  const params = new URLSearchParams(bersih)

  // `Number(null)` is 0, which is a valid integer — so a missing parameter
  // must be detected before it is parsed, not after.
  const angka = (kunci: string): number | null => {
    const mentah = params.get(kunci)
    if (mentah === null || mentah.trim().length === 0) return null
    const nilai = Number(mentah)
    return Number.isInteger(nilai) ? nilai : null
  }

  const tahunMentah = angka('t')
  const tahun = tahunMentah !== null && tahunMentah > 1945 && tahunMentah < 2100 ? tahunMentah : bawaan.tahun

  const jenisMentah = params.get('s')
  const jenis: JenisStatus =
    jenisMentah !== null && (SEMUA_STATUS as readonly string[]).includes(jenisMentah)
      ? (jenisMentah as JenisStatus)
      : bawaan.status.type

  const jatahMentah = angka('j')
  const jatahHari =
    jatahMentah !== null && jatahMentah >= 0 && jatahMentah <= 365 ? jatahMentah : bawaan.status.jatahHari

  const tidakMentah = angka('x')
  const tidakDiberikanHari = tidakMentah !== null && tidakMentah >= 0 && tidakMentah <= 365 ? tidakMentah : 0

  const status: Status = jenis === 'asn' ? { type: 'asn', jatahHari, tidakDiberikanHari } : { type: jenis, jatahHari }

  const polaMentah = params.get('p')
  const pattern: WorkPattern =
    polaMentah !== null && (WORK_PATTERNS as readonly string[]).includes(polaMentah)
      ? (polaMentah as WorkPattern)
      : bawaan.pattern

  const tujuanMentah = params.get('o')
  const tujuan: Tujuan = tujuanMentah !== null && isTujuan(tujuanMentah) ? tujuanMentah : bawaan.tujuan

  const dipilihSendiri: DayNumber[] = []
  const cMentah = params.get('c')
  if (cMentah !== null && cMentah.length > 0) {
    for (const bagian of cMentah.split(',')) {
      try {
        dipilihSendiri.push(fromIsoDate(bagian))
      } catch {
        // A malformed day in a shared link drops that day rather than the
        // whole link. Never throw at a reader who pasted something odd.
      }
    }
  }

  return {
    tahun,
    status,
    pattern,
    tujuan,
    dipilihSendiri: [...new Set(dipilihSendiri)].sort((a, b) => a - b),
  }
}
