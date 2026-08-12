import { describe, expect, it } from 'vitest'
import { WORK_PATTERNS } from '@/lib/day/pattern'
import { posisiDipakai, posisiLain } from '@/lib/rules/posisi'
import { packTahun, semuaKontradiksi, tahunTersedia } from '@/lib/rules/loader'
import { resolveTahun } from '@/lib/rules/resolve'
import { hitungEntitlement, SEMUA_STATUS, type Status } from '@/lib/status'
import { hitungEntitlementPosisi } from '@/lib/status/posisi'

/**
 * The app's position is written out branch by branch in `lib/status`, with each
 * instrument named in a comment. The ledger records the same position as data, so
 * it can price the reading it rejected.
 *
 * Two sources for one rule is exactly the situation this project exists to
 * distrust, so the central assertion here is that they agree: fed the position the
 * app actually uses, the data-driven pricing must reproduce the hand-written
 * branch exactly, for every status, pattern and year. A drift between the code's
 * rule and the ledger's record of it fails here rather than quietly misinforming
 * a reader.
 */

function statusOf(jenis: (typeof SEMUA_STATUS)[number], jatahHari: number, tidakDiberikanHari = 0): Status {
  return jenis === 'asn' ? { type: 'asn', jatahHari, tidakDiberikanHari } : { type: jenis, jatahHari }
}

const KONTRADIKSI = semuaKontradiksi().find((k) => k.id === 'cuti-bersama-entitlement')

describe('priced positions', () => {
  it('has the cuti bersama entry priced, with a used position that exists', () => {
    expect(KONTRADIKSI).toBeDefined()
    if (KONTRADIKSI === undefined) return

    expect(KONTRADIKSI.posisi?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(posisiDipakai(KONTRADIKSI)).toBeDefined()
    expect(posisiLain(KONTRADIKSI).length).toBeGreaterThanOrEqual(1)
  })

  it('reproduces the hand-written branch exactly under the used position', () => {
    if (KONTRADIKSI === undefined) return
    const dipakai = posisiDipakai(KONTRADIKSI)
    expect(dipakai).toBeDefined()
    if (dipakai === undefined) return

    for (const tahun of tahunTersedia()) {
      const pack = packTahun(tahun)
      if (pack === undefined) continue

      for (const pattern of WORK_PATTERNS) {
        for (const jenis of SEMUA_STATUS) {
          for (const tidakDiberikanHari of [0, 3]) {
            const status = statusOf(jenis, 12, tidakDiberikanHari)
            const terselesaikan = resolveTahun(pack, pattern, status)
            const kerja = terselesaikan.cutiBersamaHariKerjaHari

            const kode = hitungEntitlement(status, kerja)
            const data = hitungEntitlementPosisi(status, kerja, dipakai.efek)

            const label = `${tahun} ${pattern} ${jenis} +${tidakDiberikanHari}`
            expect(data.sisaHari, label).toBe(kode.sisaHari)
            expect(data.dipotongCutiBersamaHari, label).toBe(kode.dipotongCutiBersamaHari)
            expect(data.ditambahHari, label).toBe(kode.ditambahHari)
            expect(data.jatahHari, label).toBe(kode.jatahHari)
          }
        }
      }
    }
  })

  it('prices the reversed reading differently, and only for an ASN', () => {
    if (KONTRADIKSI === undefined) return
    const terbalik = posisiLain(KONTRADIKSI).find((p) => p.id === 'pemberitaan-terbalik')
    expect(terbalik).toBeDefined()
    if (terbalik === undefined) return

    const pack = packTahun(2026)
    expect(pack).toBeDefined()
    if (pack === undefined) return

    const asn = statusOf('asn', 12)
    const kerja = resolveTahun(pack, 'lima-hari', asn).cutiBersamaHariKerjaHari
    expect(kerja).toBeGreaterThan(0)

    // The disagreement is about ASN, and it costs them every cuti bersama day
    // that fell on a working day.
    const dipakai = posisiDipakai(KONTRADIKSI)
    if (dipakai === undefined) return
    expect(hitungEntitlementPosisi(asn, kerja, dipakai.efek).sisaHari).toBe(12)
    expect(hitungEntitlementPosisi(asn, kerja, terbalik.efek).sisaHari).toBe(12 - kerja)

    // For a private employee the two positions agree, which is worth asserting:
    // the app must not imply a reader is affected by a dispute they are not.
    for (const jenis of SEMUA_STATUS) {
      if (jenis === 'asn') continue
      const status = statusOf(jenis, 12)
      const kerjaSwasta = resolveTahun(pack, 'lima-hari', status).cutiBersamaHariKerjaHari
      expect(hitungEntitlementPosisi(status, kerjaSwasta, terbalik.efek).sisaHari).toBe(
        hitungEntitlementPosisi(status, kerjaSwasta, dipakai.efek).sisaHari,
      )
    }
  })

  it('never returns a negative remainder', () => {
    if (KONTRADIKSI === undefined) return
    for (const posisi of KONTRADIKSI.posisi ?? []) {
      for (const jenis of SEMUA_STATUS) {
        // A tiny entitlement against a large deduction must clamp, not go under.
        const hasil = hitungEntitlementPosisi(statusOf(jenis, 1), 8, posisi.efek)
        expect(hasil.sisaHari).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('only adds days back where the position says to', () => {
    const asn = statusOf('asn', 12, 4)
    const menambah = hitungEntitlementPosisi(asn, 0, {
      memotongAsn: false,
      memotongSwastaIkut: true,
      menambahAsnTidakDiberikan: true,
    })
    const tidak = hitungEntitlementPosisi(asn, 0, {
      memotongAsn: false,
      memotongSwastaIkut: true,
      menambahAsnTidakDiberikan: false,
    })
    expect(menambah.ditambahHari).toBe(4)
    expect(tidak.ditambahHari).toBe(0)
    expect(menambah.sisaHari - tidak.sisaHari).toBe(4)
  })
})
