import { nilaiPilihan, type PetaJembatan } from './gaps'

/**
 * Exhaustive oracle. TESTS ONLY.
 *
 * Invariant 9: never imported outside `tests/`. It exists so that "optimal" is
 * a claim the test suite checks rather than a hope the optimiser expresses.
 *
 * Twenty lines, enumerating every subset of bridges. At realistic sizes this
 * is cheap, which is exactly why the real optimiser is allowed to be exact
 * rather than greedy (PRD §3).
 */
export function pilihBruteForce(
  peta: PetaJembatan,
  anggaranHari: number,
): { readonly nilai: number; readonly biaya: number; readonly dipilih: readonly number[] } {
  const n = peta.jembatan.length
  if (n > 22) throw new Error(`Terlalu banyak jembatan untuk brute force: ${n}`)

  let terbaik = { nilai: 0, biaya: 0, dipilih: [] as number[] }

  for (let mask = 0; mask < 1 << n; mask += 1) {
    const dipilih: number[] = []
    for (let i = 0; i < n; i += 1) {
      if ((mask & (1 << i)) !== 0) dipilih.push(peta.jembatan[i]!.indeks)
    }
    const { nilai, biaya } = nilaiPilihan(peta, dipilih)
    if (biaya > anggaranHari) continue
    // Tie-break on cost so the oracle prefers the cheaper of two equal plans,
    // matching the optimiser.
    if (nilai > terbaik.nilai || (nilai === terbaik.nilai && biaya < terbaik.biaya)) {
      terbaik = { nilai, biaya, dipilih }
    }
  }

  return terbaik
}
