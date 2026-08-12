/**
 * Invariant 7: refuse rather than project.
 *
 * A year with no published SKB gets a structured refusal naming the gap. Never
 * extrapolate from the previous year, never fall back to fixed-date holidays
 * only. Being confidently wrong about whether someone has a day off is the
 * whole failure mode (PRD §2).
 */

export type Penolakan =
  | {
      readonly type: 'skbBelumTerbit'
      readonly tahun: number
      /** Years that do have a pack, ascending — offered as an alternative. */
      readonly tahunTersedia: readonly number[]
    }
  | {
      readonly type: 'packTidakValid'
      readonly tahun: number
      readonly masalah: readonly string[]
    }

export function pesanPenolakan(penolakan: Penolakan): string {
  switch (penolakan.type) {
    case 'skbBelumTerbit':
      return (
        `Belum ada SKB Hari Libur Nasional dan Cuti Bersama untuk tahun ${penolakan.tahun} ` +
        `di dalam aplikasi ini. Kami tidak menghitung sendiri tanggal libur — ` +
        `tanggal libur ditetapkan pemerintah, bukan dihitung.` +
        (penolakan.tahunTersedia.length > 0
          ? ` Tahun yang tersedia: ${penolakan.tahunTersedia.join(', ')}.`
          : '')
      )
    case 'packTidakValid':
      return (
        `Data SKB tahun ${penolakan.tahun} tidak lolos validasi, jadi tidak dipakai: ` +
        penolakan.masalah.join('; ')
      )
    default:
      return exhaustive(penolakan)
  }
}

export function messagePenolakanEn(penolakan: Penolakan): string {
  switch (penolakan.type) {
    case 'skbBelumTerbit':
      return (
        `No published SKB for ${penolakan.tahun} is bundled with this app. ` +
        `Holiday dates are decreed, not computed, so nothing is projected here.` +
        (penolakan.tahunTersedia.length > 0
          ? ` Years available: ${penolakan.tahunTersedia.join(', ')}.`
          : '')
      )
    case 'packTidakValid':
      return `The ${penolakan.tahun} rule pack failed validation and was not used: ${penolakan.masalah.join('; ')}`
    default:
      return exhaustive(penolakan)
  }
}

function exhaustive(value: never): never {
  throw new Error(`Penolakan tidak dikenal: ${JSON.stringify(value)}`)
}
