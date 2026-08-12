/**
 * `pnpm rules:validate` — gates `pnpm build` and CI.
 *
 * Fails on an uncited entry, a date outside the pack's year, a duplicate, a
 * non-canonical date, or a contradiction entry that resolves to reporting when
 * an instrument-sourced reading exists.
 *
 * Never weaken this to make something pass (CLAUDE.md, working style).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateKontradiksi, validateRulePack } from '../lib/rules/validate'

const SKB_DIR = join(process.cwd(), 'data', 'skb')
const KONTRADIKSI_DIR = join(process.cwd(), 'data', 'contradictions')

const masalah: string[] = []
const peringatan: string[] = []

const skbFiles = readdirSync(SKB_DIR).filter((f) => f.endsWith('.json')).sort()
if (skbFiles.length === 0) {
  masalah.push('data/skb/ kosong — tidak ada satu pun rule pack')
}

for (const file of skbFiles) {
  const berkas = `data/skb/${file}`
  const raw = JSON.parse(readFileSync(join(SKB_DIR, file), 'utf8')) as unknown
  const hasil = validateRulePack(raw, berkas)
  if (!hasil.ok) {
    masalah.push(...hasil.masalah)
    continue
  }

  const { pack } = hasil
  const expected = `${pack.tahun}.json`
  if (file !== expected) {
    masalah.push(`${berkas}: nama berkas tidak cocok dengan tahun (seharusnya ${expected})`)
  }

  const liburNasional = pack.hari.filter((h) => h.jenis === 'liburNasional').length
  const cutiBersama = pack.hari.filter((h) => h.jenis === 'cutiBersama').length

  if (pack.status === 'perluVerifikasi') {
    peringatan.push(
      `${berkas}: status "perluVerifikasi" — pack ini draf dan aplikasi menampilkan banner peringatan. ` +
        `Cocokkan setiap baris dengan dokumen SKB, isi nomor yang sebenarnya, lalu ubah status ke "terverifikasi".`,
    )
  } else {
    // A verified pack must not still carry the placeholder text.
    for (const hari of pack.hari) {
      if (/BELUM DIVERIFIKASI/i.test(hari.sitasi.nomor)) {
        masalah.push(`${berkas}: ${hari.tanggal} berstatus terverifikasi tetapi nomor instrumen masih placeholder`)
      }
    }
  }

  console.log(`  ✓ ${berkas} — ${liburNasional} libur nasional, ${cutiBersama} cuti bersama [${pack.status}]`)
}

const kontradiksiFiles = readdirSync(KONTRADIKSI_DIR).filter((f) => f.endsWith('.json')).sort()
for (const file of kontradiksiFiles) {
  const berkas = `data/contradictions/${file}`
  const raw = JSON.parse(readFileSync(join(KONTRADIKSI_DIR, file), 'utf8')) as unknown
  const hasil = validateKontradiksi(raw, berkas)
  if (!hasil.ok) {
    masalah.push(...hasil.masalah)
    continue
  }
  console.log(`  ✓ ${berkas} — ${hasil.kontradiksi.bacaan.length} bacaan, dipakai "${hasil.kontradiksi.dipakai}"`)
}

for (const p of peringatan) console.warn(`  ! ${p}`)

if (masalah.length > 0) {
  console.error('\nValidasi rule pack GAGAL:\n')
  for (const m of masalah) console.error(`  ✗ ${m}`)
  console.error('')
  process.exit(1)
}

console.log(`\nValidasi rule pack lolos — ${skbFiles.length} tahun, ${kontradiksiFiles.length} kontradiksi.\n`)
