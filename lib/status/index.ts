/**
 * Employment status — a first-class input, not a setting (PRD §5.2).
 *
 * Invariant 5: entitlement branches by employment status, and each branch
 * cites its instrument. ASN, private-with-deduction, and private-without are
 * three outcomes, not a boolean. Nothing outside this module branches on
 * status.
 *
 * Invariant 11: company policy is user-stated, never assumed. The app does not
 * know whether a company takes cuti bersama; it asks.
 *
 * The instrument numbers below are recorded in
 * `data/contradictions/cuti-bersama-entitlement.json` and still need checking
 * against the published documents — see UPDATING.md.
 */

export type Status =
  /**
   * ASN. The Keppres on cuti bersama for civil servants provides that cuti
   * bersama does not reduce annual leave entitlement, and that an ASN who
   * cannot take it because of their post has their entitlement increased by
   * the number of days not given.
   */
  | {
      readonly type: 'asn'
      readonly jatahHari: number
      /** Days of cuti bersama the ASN could not take because of their post. */
      readonly tidakDiberikanHari: number
    }
  /**
   * Private sector, company does not take cuti bersama. The SKB leaves
   * implementation to each management, so the days are ordinary working days
   * and nothing is deducted.
   */
  | { readonly type: 'swastaTanpaCutiBersama'; readonly jatahHari: number }
  /** Private sector, company closes but does not deduct from annual leave. */
  | { readonly type: 'swastaCutiBersamaTanpaPotong'; readonly jatahHari: number }
  /**
   * Private sector, company closes and deducts. The SKB's fourth diktum
   * states that cuti bersama reduces the annual leave entitlement of
   * employees. This is the branch that surprises people in November.
   */
  | { readonly type: 'swastaCutiBersamaDipotong'; readonly jatahHari: number }

export type JenisStatus = Status['type']

export const SEMUA_STATUS: readonly JenisStatus[] = [
  'asn',
  'swastaTanpaCutiBersama',
  'swastaCutiBersamaTanpaPotong',
  'swastaCutiBersamaDipotong',
]

/** Whether the cuti bersama days in the pack are days off for this person. */
export function cutiBersamaLibur(status: Status): boolean {
  switch (status.type) {
    case 'asn':
    case 'swastaCutiBersamaTanpaPotong':
    case 'swastaCutiBersamaDipotong':
      return true
    case 'swastaTanpaCutiBersama':
      return false
    default:
      return exhaustive(status)
  }
}

export type Entitlement = {
  /** Annual leave the person starts the year with. */
  readonly jatahHari: number
  /** Days deducted by cuti bersama. Zero for three of the four branches. */
  readonly dipotongCutiBersamaHari: number
  /** Days added back. Only the ASN branch can be non-zero. */
  readonly ditambahHari: number
  /** What is left to spend on bridges. Never negative. */
  readonly sisaHari: number
  /** The rule applied, in Indonesian, for the ledger. */
  readonly dasar: string
  /** The instrument it comes from. Never reporting. */
  readonly instrumen: string
}

/**
 * `cutiBersamaHariKerja` is the number of cuti bersama days that fall on a day
 * the person would otherwise have worked. A cuti bersama landing on a Sunday
 * costs nobody anything, so counting raw calendar entries would overstate the
 * deduction. The caller computes it from the pack and the work pattern.
 */
export function hitungEntitlement(status: Status, cutiBersamaHariKerja: number): Entitlement {
  switch (status.type) {
    case 'asn': {
      // Keppres cuti PNS: cuti bersama does not reduce annual leave, and days
      // not given because of the post are added back.
      const ditambahHari = status.tidakDiberikanHari
      return {
        jatahHari: status.jatahHari,
        dipotongCutiBersamaHari: 0,
        ditambahHari,
        sisaHari: Math.max(0, status.jatahHari + ditambahHari),
        dasar:
          'Bagi ASN, cuti bersama tidak mengurangi hak cuti tahunan. ASN yang karena jabatannya tidak dapat menggunakan cuti bersama memperoleh tambahan hak cuti tahunan sebanyak hari yang tidak diberikan.',
        instrumen: 'Keppres tentang cuti bersama bagi ASN',
      }
    }
    case 'swastaTanpaCutiBersama':
      return {
        jatahHari: status.jatahHari,
        dipotongCutiBersamaHari: 0,
        ditambahHari: 0,
        sisaHari: Math.max(0, status.jatahHari),
        dasar:
          'Perusahaan Anda tidak ikut cuti bersama, jadi hari-hari itu adalah hari kerja biasa dan cuti tahunan Anda tidak dipotong.',
        instrumen: 'SKB 3 Menteri, diktum keenam (pelaksanaan pada lembaga swasta diatur masing-masing manajemen)',
      }
    case 'swastaCutiBersamaTanpaPotong':
      return {
        jatahHari: status.jatahHari,
        dipotongCutiBersamaHari: 0,
        ditambahHari: 0,
        sisaHari: Math.max(0, status.jatahHari),
        dasar:
          'Perusahaan Anda ikut cuti bersama tetapi tidak memotong cuti tahunan. Hari-hari itu libur dan jatah cuti Anda utuh.',
        instrumen: 'SKB 3 Menteri, diktum keenam (pelaksanaan pada lembaga swasta diatur masing-masing manajemen)',
      }
    case 'swastaCutiBersamaDipotong':
      return {
        jatahHari: status.jatahHari,
        dipotongCutiBersamaHari: cutiBersamaHariKerja,
        ditambahHari: 0,
        sisaHari: Math.max(0, status.jatahHari - cutiBersamaHariKerja),
        dasar:
          'Perusahaan Anda ikut cuti bersama dan memotong cuti tahunan, jadi hari cuti bersama sudah terpakai dari jatah Anda.',
        instrumen: 'SKB 3 Menteri, diktum keempat (cuti bersama mengurangi hak cuti tahunan pekerja)',
      }
    default:
      return exhaustive(status)
  }
}

function exhaustive(value: never): never {
  throw new Error(`Status tidak dikenal: ${JSON.stringify(value)}`)
}
