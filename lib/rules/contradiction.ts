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
  berlakuTahun: z.array(z.number().int()).min(1),
})
export type Kontradiksi = z.infer<typeof kontradiksiSchema>
