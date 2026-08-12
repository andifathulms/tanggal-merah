import type { EfekEntitlement } from '@/lib/rules/contradiction'
import type { Entitlement, Status } from './index'

/**
 * An entitlement computed under an arbitrary position on the disputed rule.
 *
 * This exists so the app can show what the reading it *rejected* would have cost
 * the reader. The contradiction ledger has always recorded the reversed reading;
 * it recorded it in prose, which leaves a reader adjudicating two documents on
 * the strength of a website's assertion. An eight-day difference in a number
 * explains the stakes in a way three paragraphs of decree vocabulary cannot.
 *
 * It deliberately does not replace `hitungEntitlement`. That function is the
 * app's own position, written out branch by branch with each instrument named in
 * a comment, and invariant 5 wants it that way. This one is driven by data, and
 * the tests assert the two agree exactly when this is fed the position the app
 * actually uses — so a drift between the code's rule and the ledger's record of
 * that rule fails the build rather than quietly misinforming somebody.
 *
 * Invariant 13 still holds: this states what a position would produce. It does
 * not argue for one.
 */
export function hitungEntitlementPosisi(
  status: Status,
  cutiBersamaHariKerja: number,
  efek: EfekEntitlement,
): Pick<Entitlement, 'jatahHari' | 'dipotongCutiBersamaHari' | 'ditambahHari' | 'sisaHari'> {
  const memotong = potonganBerlaku(status, efek)
  const dipotongCutiBersamaHari = memotong ? cutiBersamaHariKerja : 0

  const ditambahHari =
    status.type === 'asn' && efek.menambahAsnTidakDiberikan ? status.tidakDiberikanHari : 0

  return {
    jatahHari: status.jatahHari,
    dipotongCutiBersamaHari,
    ditambahHari,
    sisaHari: Math.max(0, status.jatahHari - dipotongCutiBersamaHari + ditambahHari),
  }
}

/**
 * Whether this position charges this person's cuti bersama to their leave.
 *
 * Invariant 5: the status branching lives in this module. A position only ever
 * says what happens to an ASN and what happens to a private employee whose
 * company closes — the two private branches where the company does not close, or
 * closes without deducting, are settled by the SKB's sixth diktum leaving
 * implementation to management and are not in dispute at all.
 */
function potonganBerlaku(status: Status, efek: EfekEntitlement): boolean {
  switch (status.type) {
    case 'asn':
      return efek.memotongAsn
    case 'swastaCutiBersamaDipotong':
      return efek.memotongSwastaIkut
    case 'swastaTanpaCutiBersama':
    case 'swastaCutiBersamaTanpaPotong':
      // The company either does not close or does not deduct. No reading of the
      // dispute changes that, so no position can either.
      return false
    default:
      return exhaustive(status)
  }
}

function exhaustive(value: never): never {
  throw new Error(`Status tidak dikenal: ${JSON.stringify(value)}`)
}
