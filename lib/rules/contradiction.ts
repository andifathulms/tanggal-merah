import { z } from 'zod'

/**
 * Invariant 12: where sources disagree, record the disagreement. Do not
 * silently pick.
 *
 * The cuti bersama entitlement rule has been reported both ways in public
 * (PRD §1). An entry here names both readings, the source of each, which one
 * the app uses, and why — and the ledger shows it to the reader.
 */

export const bacaanSchema = z.object({
  id: z.string().min(1),
  /** What this source says, in one sentence. */
  klaim: z.string().min(1),
  /** Who said it. Name the outlet or the instrument plainly. */
  sumber: z.string().min(1),
  /** 'instrumen' outranks 'pemberitaan'. Never cite reporting over a decree. */
  jenisSumber: z.enum(['instrumen', 'pemberitaan']),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tautan: z.string().url().optional(),
})
export type Bacaan = z.infer<typeof bacaanSchema>

/**
 * What a position does to an entitlement, in machine-readable form.
 *
 * Recording the disagreement in prose leaves a reader adjudicating two documents
 * on the strength of a website's assertion. Recording what each position *costs*
 * lets them see the stakes — and makes the app's own choice falsifiable in their
 * hands, which is the strongest form of the citation ethos available here.
 *
 * Deliberately narrow. These three booleans are exactly what the dispute is
 * about, and nothing here can express a rule the instruments do not.
 */
export const efekEntitlementSchema = z.object({
  /** Does cuti bersama reduce an ASN's annual leave under this position? */
  memotongAsn: z.boolean(),
  /** Does it reduce a private employee's, where the company closes? */
  memotongSwastaIkut: z.boolean(),
  /** Is an ASN who could not take cuti bersama given the days back? */
  menambahAsnTidakDiberikan: z.boolean(),
})
export type EfekEntitlement = z.infer<typeof efekEntitlementSchema>

/**
 * A position is a combination of readings taken together.
 *
 * This exists because a reading is not always a complete answer. The Keppres
 * speaks only about ASN and the SKB's sixth diktum only about private
 * institutions; neither on its own assigns the rule for everybody, and pricing
 * either alone would mean putting words in its mouth. The app's position is both
 * instrument readings held together, and the reversed reading in the reporting is
 * a rival position — so the comparison is between positions, not readings.
 */
export const posisiSchema = z.object({
  id: z.string().min(1),
  judul: z.string().min(1),
  /** `bacaan` ids this position rests on. Every one must exist. */
  bacaan: z.array(z.string().min(1)).min(1),
  efek: efekEntitlementSchema,
})
export type Posisi = z.infer<typeof posisiSchema>

export const kontradiksiSchema = z.object({
  id: z.string().min(1),
  judul: z.string().min(1),
  /** What is actually in dispute, stated so a reader can check it themselves. */
  pertanyaan: z.string().min(1),
  bacaan: z.array(bacaanSchema).min(2),
  /** The `id` of the reading the app uses. Must exist in `bacaan`. */
  dipakai: z.string().min(1),
  /** Why that one — the reasoning, not an assertion of authority. */
  alasan: z.string().min(1),
  /**
   * The rival positions, priced. At least two, or there is no disagreement to
   * record. Optional so an entry can be filed before its effects are worked out
   * — but the validator requires that a priced entry name a used position.
   */
  posisi: z.array(posisiSchema).min(2).optional(),
  /** The `id` of the position the app computes with. Must exist in `posisi`. */
  dipakaiPosisi: z.string().min(1).optional(),
  berlakuTahun: z.array(z.number().int()).min(1),
})
export type Kontradiksi = z.infer<typeof kontradiksiSchema>

/** The position the app computes with, when the entry has been priced. */
export function posisiDipakai(kontradiksi: Kontradiksi): Posisi | undefined {
  return kontradiksi.posisi?.find((p) => p.id === kontradiksi.dipakaiPosisi)
}

/** The rival positions — everything the app did not choose. */
export function posisiLain(kontradiksi: Kontradiksi): readonly Posisi[] {
  return (kontradiksi.posisi ?? []).filter((p) => p.id !== kontradiksi.dipakaiPosisi)
}
