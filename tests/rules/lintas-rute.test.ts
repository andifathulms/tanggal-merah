import { describe, expect, it } from 'vitest'
import { dariHash, keHash, type Pengaturan } from '@/lib/share'
import { fromIsoDate } from '@/lib/day'

/**
 * The two halves of the planner are separate routes, so finishing a plan means crossing
 * between them — and the link that does it carries the hash. If that string did not
 * round-trip, a reader would arrive at the other half with their status, budget,
 * objective and chosen days silently reset. The link is only as good as this.
 */
describe('a plan survives the link between the two halves', () => {
  it('round-trips everything the link carries', () => {
    const bawaan: Pengaturan = {
      tahun: 2026,
      status: { type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 },
      pattern: 'lima-hari',
      tujuan: 'totalHariLibur',
      dipilihSendiri: [],
    }
    const dipilih: Pengaturan = {
      tahun: 2026,
      status: { type: 'swastaCutiBersamaDipotong', jatahHari: 15 },
      pattern: 'enam-hari',
      tujuan: 'rentetanTerpanjang',
      dipilihSendiri: [fromIsoDate('2026-03-16'), fromIsoDate('2026-03-17')],
    }

    // Exactly what `LanjutKe` puts after the `#`, and exactly what the other route
    // reads back out of `window.location.hash` on mount.
    const hash = keHash(dipilih)
    expect(dariHash(`#${hash}`, bawaan)).toEqual(dipilih)
  })

  it('survives the escaping a browser applies to an href fragment', () => {
    const p: Pengaturan = {
      tahun: 2026,
      status: { type: 'asn', jatahHari: 12, tidakDiberikanHari: 4 },
      pattern: 'lima-hari',
      tujuan: 'rentetanTerpanjang',
      dipilihSendiri: [fromIsoDate('2026-08-18')],
    }
    const hash = keHash(p)
    // The attribute is written with `&amp;`; the parser hands back `&`.
    expect(dariHash(`#${hash.replace(/&/g, '&')}`, p)).toEqual(p)
    // And a hash that arrives percent-encoded still parses.
    expect(dariHash(`#${hash.replace(/,/g, '%2C')}`, p)).toEqual(p)
  })
})
