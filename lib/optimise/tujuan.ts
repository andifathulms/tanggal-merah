/**
 * What "optimal" is being optimised for.
 *
 * The app used to answer one question and apologise for it in small print: the
 * suggestion panel carried a note saying its headline figure summed several
 * separate stretches rather than describing one long run. That note was a
 * symptom. Two readers with identical status, working week, and budget have
 * genuinely different correct answers, because "optimal" was never a property
 * of the calendar — it is a property of the calendar plus an objective.
 *
 * `totalHariLibur` maximises the total number of days off across every stretch
 * the plan creates or extends. It is the better answer for somebody collecting
 * long weekends through the year, and it is what the app has always computed.
 *
 * `rentetanTerpanjang` maximises the length of the single longest stretch. It is
 * the answer for somebody who wants one proper trip and does not care what the
 * rest of the year looks like.
 *
 * Both are exact and both are checked against a brute-force oracle. Invariant 8
 * requires that a heuristic be labelled as such in the output, and neither of
 * these is one.
 */
export type Tujuan = 'totalHariLibur' | 'rentetanTerpanjang'

export const SEMUA_TUJUAN: readonly Tujuan[] = ['totalHariLibur', 'rentetanTerpanjang']

export const TUJUAN_BAWAAN: Tujuan = 'totalHariLibur'

export function isTujuan(nilai: string): nilai is Tujuan {
  return (SEMUA_TUJUAN as readonly string[]).includes(nilai)
}
