import { validateRulePack } from './validate'
import type { RulePack } from './schema'
import type { Kontradiksi } from './contradiction'
import { validateKontradiksi } from './validate'
import pack2026 from '@/data/skb/2026.json'
import kontradiksiCutiBersama from '@/data/contradictions/cuti-bersama-entitlement.json'

/**
 * Packs are imported statically so they are bundled into the static export.
 * There is no runtime network — PRD §6.
 *
 * Adding a year means adding a line here and a file in `data/skb/`. See
 * UPDATING.md.
 */
const MENTAH: readonly { readonly berkas: string; readonly isi: unknown }[] = [
  { berkas: 'data/skb/2026.json', isi: pack2026 },
]

const KONTRADIKSI_MENTAH: readonly { readonly berkas: string; readonly isi: unknown }[] = [
  { berkas: 'data/contradictions/cuti-bersama-entitlement.json', isi: kontradiksiCutiBersama },
]

function muat(): ReadonlyMap<number, RulePack> {
  const out = new Map<number, RulePack>()
  for (const { berkas, isi } of MENTAH) {
    const hasil = validateRulePack(isi, berkas)
    // The build gates on `pnpm rules:validate`, so an invalid pack should never
    // reach here. If one does, drop it rather than serve unvalidated data.
    if (hasil.ok) out.set(hasil.pack.tahun, hasil.pack)
  }
  return out
}

const PACKS = muat()

function muatKontradiksi(): readonly Kontradiksi[] {
  const out: Kontradiksi[] = []
  for (const { berkas, isi } of KONTRADIKSI_MENTAH) {
    const hasil = validateKontradiksi(isi, berkas)
    if (hasil.ok) out.push(hasil.kontradiksi)
  }
  return out
}

const KONTRADIKSI = muatKontradiksi()

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
