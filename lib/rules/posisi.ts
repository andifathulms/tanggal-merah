import type { Kontradiksi, Posisi } from './contradiction'

/**
 * Reading a contradiction entry's priced positions.
 *
 * Deliberately separate from `./contradiction`, which builds Zod schemas at module
 * scope. Those schemas are a module-level side effect, so importing anything from
 * that file pulled Zod into the client bundle — 13.6 KB gzipped to run validation the
 * build had already done. These are plain functions over plain types.
 */

/** The position the app computes with, when the entry has been priced. */
export function posisiDipakai(kontradiksi: Kontradiksi): Posisi | undefined {
  return kontradiksi.posisi?.find((p) => p.id === kontradiksi.dipakaiPosisi)
}

/** The rival positions — everything the app did not choose. */
export function posisiLain(kontradiksi: Kontradiksi): readonly Posisi[] {
  return (kontradiksi.posisi ?? []).filter((p) => p.id !== kontradiksi.dipakaiPosisi)
}
