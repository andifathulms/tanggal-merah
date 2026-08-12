import { fromIsoDate, toIsoDate, yearOf } from '@/lib/day'
import { rulePackSchema, type RulePack } from './schema'
import { kontradiksiSchema, type Kontradiksi } from './contradiction'

/**
 * Rule-pack integrity, enforced at build time by `pnpm rules:validate`
 * (PRD §7). The build rejects an uncited entry.
 *
 * Never weaken this to make something pass. If a pack fails, the pack is
 * wrong.
 */

export type HasilValidasi =
  | { readonly ok: true; readonly pack: RulePack }
  | { readonly ok: false; readonly masalah: readonly string[] }

export function validateRulePack(input: unknown, berkas: string): HasilValidasi {
  const parsed = rulePackSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      masalah: parsed.error.issues.map((issue) => `${berkas}: ${issue.path.join('.')} — ${issue.message}`),
    }
  }

  const pack = parsed.data
  const masalah: string[] = []
  const terlihat = new Map<string, string>()

  for (const hari of pack.hari) {
    let dayNumber: number
    try {
      dayNumber = fromIsoDate(hari.tanggal)
    } catch {
      masalah.push(`${berkas}: ${hari.tanggal} (${hari.nama}) bukan tanggal yang ada`)
      continue
    }

    // Canonical form — "2026-8-17" must not slip past as a different day.
    if (toIsoDate(dayNumber) !== hari.tanggal) {
      masalah.push(`${berkas}: ${hari.tanggal} tidak dalam bentuk kanonik YYYY-MM-DD`)
    }

    if (yearOf(dayNumber) !== pack.tahun) {
      masalah.push(`${berkas}: ${hari.tanggal} (${hari.nama}) bukan tahun ${pack.tahun}`)
    }

    // Invariant 6 — an entry without its instrument is not data, it is a guess.
    if (hari.sitasi.nomor.trim().length === 0) {
      masalah.push(`${berkas}: ${hari.nama} tidak menyebut nomor instrumen`)
    }

    // Two entries may share a date only if they are different types — a
    // cuti bersama can sit on the same date as nothing else, but a duplicate
    // libur nasional is a transcription error.
    const kunci = `${hari.tanggal}|${hari.jenis}`
    const sebelumnya = terlihat.get(kunci)
    if (sebelumnya !== undefined) {
      masalah.push(`${berkas}: ${hari.tanggal} ${hari.jenis} ganda — "${sebelumnya}" dan "${hari.nama}"`)
    }
    terlihat.set(kunci, hari.nama)
  }

  // Ordering matters for reading the pack as a document, and an out-of-order
  // pack usually means an entry was pasted into the wrong place.
  const tanggal = pack.hari.map((h) => h.tanggal)
  const urut = [...tanggal].sort()
  if (tanggal.join(',') !== urut.join(',')) {
    masalah.push(`${berkas}: entri tidak urut menurut tanggal`)
  }

  if (!pack.hari.some((h) => h.jenis === 'liburNasional')) {
    masalah.push(`${berkas}: tidak ada satu pun libur nasional — pack ini pasti tidak lengkap`)
  }

  return masalah.length === 0 ? { ok: true, pack } : { ok: false, masalah }
}

export type HasilValidasiKontradiksi =
  | { readonly ok: true; readonly kontradiksi: Kontradiksi }
  | { readonly ok: false; readonly masalah: readonly string[] }

export function validateKontradiksi(input: unknown, berkas: string): HasilValidasiKontradiksi {
  const parsed = kontradiksiSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      masalah: parsed.error.issues.map((issue) => `${berkas}: ${issue.path.join('.')} — ${issue.message}`),
    }
  }

  const kontradiksi = parsed.data
  const masalah: string[] = []

  if (!kontradiksi.bacaan.some((b) => b.id === kontradiksi.dipakai)) {
    masalah.push(`${berkas}: bacaan yang dipakai "${kontradiksi.dipakai}" tidak ada dalam daftar bacaan`)
  }

  // Invariant: cite to the instrument, never to reporting. An entry resolved
  // by picking a news article over a decree is the exact error this ledger
  // exists to prevent.
  const dipakai = kontradiksi.bacaan.find((b) => b.id === kontradiksi.dipakai)
  const adaInstrumen = kontradiksi.bacaan.some((b) => b.jenisSumber === 'instrumen')
  if (dipakai !== undefined && dipakai.jenisSumber === 'pemberitaan' && adaInstrumen) {
    masalah.push(
      `${berkas}: memakai pemberitaan "${dipakai.id}" padahal ada bacaan yang bersumber instrumen`,
    )
  }

  const ids = kontradiksi.bacaan.map((b) => b.id)
  if (new Set(ids).size !== ids.length) {
    masalah.push(`${berkas}: id bacaan ganda`)
  }

  return masalah.length === 0 ? { ok: true, kontradiksi } : { ok: false, masalah }
}
