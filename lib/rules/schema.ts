import { z } from 'zod'

/**
 * Rule-pack schema.
 *
 * Invariant 4: `liburNasional` and `cutiBersama` are distinct types, here and
 * everywhere downstream. They cost different things and are never collapsed
 * into a shared "holiday" member — that conflation is the app's central
 * correction (PRD §1).
 *
 * Invariant 6: every entry carries its SKB number, signing date, and type. The
 * validator rejects an uncited entry and the build fails with it.
 *
 * Invariant 3: no date in a pack is computed. Every one is transcribed from a
 * published instrument. There is no astronomical, Hijri, or Balinese-calendar
 * arithmetic in this codebase.
 */

export const jenisHariSchema = z.enum(['liburNasional', 'cutiBersama'])
export type JenisHari = z.infer<typeof jenisHariSchema>

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus dalam bentuk YYYY-MM-DD')

/** The instrument an entry is transcribed from. Reporting is not an instrument. */
export const sitasiSchema = z.object({
  /** e.g. "SKB 3 Menteri Nomor 964 Tahun 2025" or "Keppres Nomor 17 Tahun 2025". */
  instrumen: z.string().min(1),
  /** Full decree number as printed. */
  nomor: z.string().min(1),
  /** Date the instrument was signed, not the date it was reported. */
  ditandatangani: isoDateSchema,
  /** Optional link to the published document. */
  tautan: z.string().url().optional(),
})
export type Sitasi = z.infer<typeof sitasiSchema>

export const hariLiburSchema = z.object({
  tanggal: isoDateSchema,
  nama: z.string().min(1),
  namaEn: z.string().min(1),
  jenis: jenisHariSchema,
  sitasi: sitasiSchema,
  /**
   * Set where the instrument itself defers the date — the SKB notes that
   * 1 Ramadan, Idulfitri, and Iduladha are determined separately by Kemenag.
   */
  catatan: z.string().optional(),
})
export type HariLibur = z.infer<typeof hariLiburSchema>

export const rulePackSchema = z.object({
  tahun: z.number().int().min(1945).max(2100),
  /** The instruments this pack as a whole rests on. */
  sumber: z.array(sitasiSchema).min(1),
  hari: z.array(hariLiburSchema).min(1),
  /** Free-text provenance note for whoever updates this next. See UPDATING.md. */
  catatan: z.string().optional(),
})
export type RulePack = z.infer<typeof rulePackSchema>
