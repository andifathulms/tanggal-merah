import type { RulePack } from './schema'
import type { Kontradiksi } from './contradiction'
import pack2026 from '@/data/skb/2026.json'
import kontradiksiCutiBersama from '@/data/contradictions/cuti-bersama-entitlement.json'

/**
 * Packs are imported statically so they are bundled into the static export. There is
 * no runtime network — PRD §6.
 *
 * Adding a year means adding a line here and a file in `data/skb/`. See UPDATING.md.
 *
 * **These are validated at build time, not here.** `pnpm rules:validate` parses every
 * file in `data/` against the Zod schemas and gates `pnpm build` on the result, and
 * `tests/rules/validate.test.ts` asserts the same over every bundled pack. This module
 * used to re-run that validation at module scope, which meant shipping Zod to the
 * browser — 13.6 KB gzipped, a tenth of the bundle — to check data that is baked into
 * that same bundle and cannot differ from what the gate saw. The check could only ever
 * pass, and a guarantee that can only pass is not a guarantee; it is dead weight.
 *
 * So the cast below is the runtime's one trust boundary, and what it trusts is the
 * build. If you add a pack, `pnpm build` will refuse it before this line is ever
 * reached.
 */
const PACKS: ReadonlyMap<number, RulePack> = new Map(
  ([pack2026] as unknown as readonly RulePack[]).map((pack) => [pack.tahun, pack]),
)

const KONTRADIKSI = [kontradiksiCutiBersama] as unknown as readonly Kontradiksi[]

/** Undefined when no SKB for that year is bundled — the caller must refuse. */
export function packTahun(tahun: number): RulePack | undefined {
  return PACKS.get(tahun)
}

/** Ascending. Used to name the alternatives in a refusal. */
export function tahunTersedia(): readonly number[] {
  return [...PACKS.keys()].sort((a, b) => a - b)
}

export function kontradiksiTahun(tahun: number): readonly Kontradiksi[] {
  return KONTRADIKSI.filter((k) => k.berlakuTahun.includes(tahun))
}

export function semuaKontradiksi(): readonly Kontradiksi[] {
  return KONTRADIKSI
}
