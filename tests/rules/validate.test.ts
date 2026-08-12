import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateKontradiksi, validateRulePack } from '@/lib/rules/validate'
import { packTahun, tahunTersedia } from '@/lib/rules/loader'

const SKB_DIR = join(process.cwd(), 'data', 'skb')
const KONTRADIKSI_DIR = join(process.cwd(), 'data', 'contradictions')

function pack(tanpa: Partial<Record<string, unknown>> = {}) {
  const sitasi = {
    instrumen: 'SKB 3 Menteri',
    nomor: '123 Tahun 2025',
    ditandatangani: '2025-06-01',
  }
  return {
    tahun: 2030,
    status: 'terverifikasi',
    sumber: [sitasi],
    hari: [
      { tanggal: '2030-01-01', nama: 'Tahun Baru', namaEn: 'New Year', jenis: 'liburNasional', sitasi },
      { tanggal: '2030-08-17', nama: 'Kemerdekaan', namaEn: 'Independence', jenis: 'liburNasional', sitasi },
    ],
    ...tanpa,
  }
}

describe('every bundled rule pack', () => {
  it('validates', () => {
    for (const file of readdirSync(SKB_DIR).filter((f) => f.endsWith('.json'))) {
      const isi = JSON.parse(readFileSync(join(SKB_DIR, file), 'utf8')) as unknown
      const hasil = validateRulePack(isi, file)
      if (!hasil.ok) throw new Error(hasil.masalah.join('\n'))
      expect(hasil.ok).toBe(true)
    }
  })

  it('cites every entry to an instrument, with a number and a signing date', () => {
    for (const tahun of tahunTersedia()) {
      const p = packTahun(tahun)!
      for (const hari of p.hari) {
        expect(hari.sitasi.instrumen.length).toBeGreaterThan(0)
        expect(hari.sitasi.nomor.length).toBeGreaterThan(0)
        expect(hari.sitasi.ditandatangani).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('represents both day types, and never merges them', () => {
    for (const tahun of tahunTersedia()) {
      const p = packTahun(tahun)!
      const jenis = new Set(p.hari.map((h) => h.jenis))
      expect(jenis.has('liburNasional')).toBe(true)
      for (const j of jenis) expect(['liburNasional', 'cutiBersama']).toContain(j)
    }
  })

  it('has no duplicate date within a day type', () => {
    for (const tahun of tahunTersedia()) {
      const p = packTahun(tahun)!
      const kunci = p.hari.map((h) => `${h.tanggal}|${h.jenis}`)
      expect(new Set(kunci).size).toBe(kunci.length)
    }
  })
})

describe('every contradiction entry', () => {
  it('validates and resolves to an instrument-sourced reading', () => {
    for (const file of readdirSync(KONTRADIKSI_DIR).filter((f) => f.endsWith('.json'))) {
      const isi = JSON.parse(readFileSync(join(KONTRADIKSI_DIR, file), 'utf8')) as unknown
      const hasil = validateKontradiksi(isi, file)
      if (!hasil.ok) throw new Error(hasil.masalah.join('\n'))
      const dipakai = hasil.kontradiksi.bacaan.find((b) => b.id === hasil.kontradiksi.dipakai)!
      expect(dipakai.jenisSumber).toBe('instrumen')
    }
  })
})

describe('the validator rejects', () => {
  it('an entry with no instrument number', () => {
    const rusak = pack()
    rusak.hari[0]!.sitasi = { ...rusak.hari[0]!.sitasi, nomor: '' }
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a date outside the pack year', () => {
    const rusak = pack()
    rusak.hari[1]!.tanggal = '2031-08-17'
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a date that does not exist', () => {
    const rusak = pack()
    rusak.hari[1]!.tanggal = '2030-02-30'
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a duplicate date within a day type', () => {
    const rusak = pack()
    rusak.hari[1]!.tanggal = '2030-01-01'
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('entries out of date order', () => {
    const rusak = pack()
    rusak.hari = [rusak.hari[1]!, rusak.hari[0]!]
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a pack with no libur nasional at all', () => {
    const rusak = pack()
    for (const h of rusak.hari) h.jenis = 'cutiBersama'
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a pack with no status', () => {
    const rusak = pack() as Record<string, unknown>
    delete rusak.status
    expect(validateRulePack(rusak, 'uji').ok).toBe(false)
  })

  it('a contradiction resolved to reporting when an instrument is available', () => {
    const rusak = {
      id: 'uji',
      judul: 'Uji',
      pertanyaan: 'Mana yang benar?',
      bacaan: [
        { id: 'a', klaim: 'A', sumber: 'SKB', jenisSumber: 'instrumen', tanggal: '2025-01-01' },
        { id: 'b', klaim: 'B', sumber: 'Media', jenisSumber: 'pemberitaan', tanggal: '2025-01-02' },
      ],
      dipakai: 'b',
      alasan: 'Tidak ada alasan yang sah untuk ini.',
      berlakuTahun: [2026],
    }
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('a contradiction pointing at a reading that does not exist', () => {
    const rusak = {
      id: 'uji',
      judul: 'Uji',
      pertanyaan: 'Mana yang benar?',
      bacaan: [
        { id: 'a', klaim: 'A', sumber: 'SKB', jenisSumber: 'instrumen', tanggal: '2025-01-01' },
        { id: 'b', klaim: 'B', sumber: 'Keppres', jenisSumber: 'instrumen', tanggal: '2025-01-02' },
      ],
      dipakai: 'c',
      alasan: 'Menunjuk bacaan yang tidak ada.',
      berlakuTahun: [2026],
    }
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  // Priced positions let the app compute an entitlement from the ledger. A
  // half-priced entry must never pass, or the app would produce a number no
  // source states.
  const berposisi = (ubah: Record<string, unknown>) => ({
    id: 'uji',
    judul: 'Uji',
    pertanyaan: 'Mana yang benar?',
    bacaan: [
      { id: 'a', klaim: 'A', sumber: 'SKB', jenisSumber: 'instrumen', tanggal: '2025-01-01' },
      { id: 'b', klaim: 'B', sumber: 'Media', jenisSumber: 'pemberitaan', tanggal: '2025-01-02' },
    ],
    dipakai: 'a',
    alasan: 'Mengikuti instrumen.',
    berlakuTahun: [2026],
    ...ubah,
  })

  const EFEK = { memotongAsn: false, memotongSwastaIkut: true, menambahAsnTidakDiberikan: true }

  it('a position naming a reading that does not exist', () => {
    const rusak = berposisi({
      posisi: [
        { id: 'p1', judul: 'P1', bacaan: ['a'], efek: EFEK },
        { id: 'p2', judul: 'P2', bacaan: ['tidak-ada'], efek: EFEK },
      ],
      dipakaiPosisi: 'p1',
    })
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('a list of positions with no used position named', () => {
    const rusak = berposisi({
      posisi: [
        { id: 'p1', judul: 'P1', bacaan: ['a'], efek: EFEK },
        { id: 'p2', judul: 'P2', bacaan: ['b'], efek: EFEK },
      ],
    })
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('a used position that is not in the list', () => {
    const rusak = berposisi({
      posisi: [
        { id: 'p1', judul: 'P1', bacaan: ['a'], efek: EFEK },
        { id: 'p2', judul: 'P2', bacaan: ['b'], efek: EFEK },
      ],
      dipakaiPosisi: 'p3',
    })
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('a used position resting only on reporting when an instrument one exists', () => {
    const rusak = berposisi({
      posisi: [
        { id: 'instrumen', judul: 'Instrumen', bacaan: ['a'], efek: EFEK },
        { id: 'pemberitaan', judul: 'Pemberitaan', bacaan: ['b'], efek: EFEK },
      ],
      dipakaiPosisi: 'pemberitaan',
    })
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('duplicate position ids', () => {
    const rusak = berposisi({
      posisi: [
        { id: 'p1', judul: 'P1', bacaan: ['a'], efek: EFEK },
        { id: 'p1', judul: 'Lagi', bacaan: ['b'], efek: EFEK },
      ],
      dipakaiPosisi: 'p1',
    })
    expect(validateKontradiksi(rusak, 'uji').ok).toBe(false)
  })

  it('a used position named without any list of positions', () => {
    expect(validateKontradiksi(berposisi({ dipakaiPosisi: 'p1' }), 'uji').ok).toBe(false)
  })

  it('but accepts an entry with no positions at all, and a well-formed priced one', () => {
    // Pricing is optional: an entry may be filed before its effects are worked out.
    expect(validateKontradiksi(berposisi({}), 'uji').ok).toBe(true)
    expect(
      validateKontradiksi(
        berposisi({
          posisi: [
            { id: 'instrumen', judul: 'Instrumen', bacaan: ['a'], efek: EFEK },
            { id: 'pemberitaan', judul: 'Pemberitaan', bacaan: ['b'], efek: EFEK },
          ],
          dipakaiPosisi: 'instrumen',
        }),
        'uji',
      ).ok,
    ).toBe(true)
  })

  it('but accepts a well-formed pack', () => {
    expect(validateRulePack(pack(), 'uji').ok).toBe(true)
  })
})
