import { pilihJembatan } from './index'
import type { PetaJembatan } from './gaps'
import { TUJUAN_BAWAAN, type Tujuan } from './tujuan'

/**
 * What the nth leave day buys.
 *
 * The app answers for exactly one budget, which hides the shape of the problem:
 * the first leave day of the year might buy three extra days off and the ninth
 * buy nothing at all, because by then there are no gaps left to close. A reader
 * who has already committed six days to a family trip cannot tell from a single
 * answer whether the remaining six are worth planning around.
 *
 * This is only possible to state honestly because `pilihJembatan` is exact
 * (invariant 8). A greedy planner's curve would be an artefact of its own
 * ordering; this one is the true optimum at each budget, so the difference
 * between consecutive budgets is the real marginal value of a day.
 *
 * It is a price list, not a recommendation. A flattening curve implies "stop
 * here" and the app does not imply — invariant 13 means the copy states what
 * each day costs and buys, and leaves the decision alone.
 */

export type LangkahMarginal = {
  /** Budget in leave days. */
  readonly anggaranHari: number
  /** The exact optimum's value at this budget. */
  readonly nilaiHari: number
  /** Leave days the optimum at this budget actually spends. */
  readonly biayaHari: number
  /** Value gained over the previous budget. Never negative. */
  readonly tambahanHari: number
}

/**
 * One entry per budget from 1 to `maksAnggaranHari`. Budget 0 is the baseline
 * and is not returned — there is no "day zero" to price.
 *
 * Monotonicity is a property of `pilihJembatan`, asserted in the optimiser
 * tests: more budget never yields a worse result. `tambahanHari` therefore
 * cannot be negative, and the tests here assert that rather than clamping it.
 */
export function kurvaMarginal(
  peta: PetaJembatan,
  maksAnggaranHari: number,
  tujuan: Tujuan = TUJUAN_BAWAAN,
): readonly LangkahMarginal[] {
  if (maksAnggaranHari <= 0) return []

  const langkah: LangkahMarginal[] = []
  let sebelumnya = 0

  for (let anggaranHari = 1; anggaranHari <= maksAnggaranHari; anggaranHari += 1) {
    const rencana = pilihJembatan(peta, anggaranHari, tujuan)
    langkah.push({
      anggaranHari,
      nilaiHari: rencana.nilaiHari,
      biayaHari: rencana.biayaHari,
      tambahanHari: rencana.nilaiHari - sebelumnya,
    })
    sebelumnya = rencana.nilaiHari
  }

  return langkah
}

/**
 * The budget past which nothing more can be bought — the first day whose
 * marginal value is zero and stays zero. Undefined while every day still buys
 * something, which is the interesting case.
 */
export function anggaranJenuhHari(kurva: readonly LangkahMarginal[]): number | undefined {
  for (let i = 0; i < kurva.length; i += 1) {
    if (kurva.slice(i).every((l) => l.tambahanHari === 0)) return kurva[i]?.anggaranHari
  }
  return undefined
}
