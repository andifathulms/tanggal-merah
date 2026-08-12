import { civilOf, weekdayOf, type DayNumber } from '@/lib/day'
import { namaBulan, namaHariPendek, type Locale } from '@/lib/i18n'
import { tataLetakTahun } from '@/lib/sheet/layout'
import type { LeaveTrace } from '@/lib/trace'

/**
 * PNG of the year sheet (PRD §5.6) — the shareable artefact and the
 * distribution mechanism. This gets posted in group chats every December, so
 * it has to be legible at chat-thumbnail size (PRD §10).
 *
 * Drawn straight onto a canvas rather than rasterised from the DOM: no
 * dependency, no fonts to inline, and it renders the same everywhere. The
 * numbers are large and the colour does the work, because at thumbnail size
 * colour is all that survives.
 */

const WARNA = {
  newsprint: '#EFEDE6',
  ink: '#1C1B18',
  inkPudar: '#6B6862',
  liburMerah: '#C62828',
  cutiBersama: '#D98324',
  cutiPribadi: '#3D7A5A',
  akhirPekan: '#E3E0D6',
  runBar: 'rgba(198, 40, 40, 0.16)',
} as const

const KOLOM = 4
const BARIS = 3
const SEL_W = 26
const SEL_H = 22
const BULAN_W = SEL_W * 7
const JUDUL_H = 22
const HARI_H = 13
const BULAN_H = JUDUL_H + HARI_H + SEL_H * 6
const JARAK = 14
const TEPI = 24
const KEPALA_H = 64

export const LEBAR_PNG = TEPI * 2 + BULAN_W * KOLOM + JARAK * (KOLOM - 1)
export const TINGGI_PNG = TEPI * 2 + KEPALA_H + BULAN_H * BARIS + JARAK * (BARIS - 1) + 26

/** Draws the year sheet at `skala`× resolution. Returns the canvas it drew on. */
export function gambarSheet(
  canvas: HTMLCanvasElement,
  trace: LeaveTrace,
  locale: Locale,
  skala = 2,
): HTMLCanvasElement {
  canvas.width = LEBAR_PNG * skala
  canvas.height = TINGGI_PNG * skala

  const ctx = canvas.getContext('2d')
  if (ctx === null) throw new Error('Canvas 2D tidak tersedia')
  ctx.scale(skala, skala)

  const libur = new Set<DayNumber>([...trace.terselesaikan.liburHari, ...trace.dipilihSendiri])
  const dipilih = new Set(trace.dipilihSendiri)
  const klasifikasi = new Map(trace.terselesaikan.hari.map((h) => [h.hari, h]))

  ctx.fillStyle = WARNA.newsprint
  ctx.fillRect(0, 0, LEBAR_PNG, TINGGI_PNG)

  // Header — the year is the poster element, big enough to read in a thumbnail.
  ctx.fillStyle = WARNA.liburMerah
  ctx.font = '700 40px ui-sans-serif, system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(String(trace.tahun), TEPI, TEPI)

  ctx.fillStyle = WARNA.ink
  ctx.font = '600 14px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('Tanggal Merah', TEPI + 76, TEPI + 6)

  ctx.fillStyle = WARNA.inkPudar
  ctx.font = '11px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(
    locale === 'id'
      ? `Rentetan terpanjang ${trace.runTerpanjangHari} hari · sisa cuti ${trace.ledger.sisaHari} hari`
      : `Longest stretch ${trace.runTerpanjangHari} days · ${trace.ledger.sisaHari} leave days left`,
    TEPI + 76,
    TEPI + 24,
  )

  const blok = tataLetakTahun(trace.tahun)

  blok.forEach((b, i) => {
    const kol = i % KOLOM
    const bar = Math.floor(i / KOLOM)
    const x = TEPI + kol * (BULAN_W + JARAK)
    const y = TEPI + KEPALA_H + bar * (BULAN_H + JARAK)

    ctx.fillStyle = WARNA.ink
    ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(namaBulan(b.month, locale), x, y)

    ctx.font = '9px ui-sans-serif, system-ui, sans-serif'
    for (let w = 0; w < 7; w += 1) {
      ctx.fillStyle = w === 0 ? WARNA.liburMerah : WARNA.inkPudar
      ctx.fillText(namaHariPendek(w, locale), x + w * SEL_W + 4, y + JUDUL_H)
    }

    b.minggu.forEach((minggu, mi) => {
      minggu.forEach((sel, si) => {
        if (sel.hari === null) return
        const cx = x + si * SEL_W
        const cy = y + JUDUL_H + HARI_H + mi * SEL_H
        gambarSel(ctx, sel.hari, cx, cy, klasifikasi, libur, dipilih)
      })
    })
  })

  ctx.fillStyle = WARNA.inkPudar
  ctx.font = '9px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(
    locale === 'id'
      ? 'Merah: libur nasional · Jingga: cuti bersama · Hijau: cuti Anda. Data SKB — bukan nasihat hukum ketenagakerjaan.'
      : 'Red: public holiday · Amber: cuti bersama · Green: your leave. SKB data — not employment-law advice.',
    TEPI,
    TINGGI_PNG - TEPI + 2,
  )

  return canvas
}

function gambarSel(
  ctx: CanvasRenderingContext2D,
  hari: DayNumber,
  x: number,
  y: number,
  klasifikasi: ReadonlyMap<DayNumber, { readonly type: string; readonly libur: boolean }>,
  libur: ReadonlySet<DayNumber>,
  dipilih: ReadonlySet<DayNumber>,
): void {
  const k = klasifikasi.get(hari)
  if (k === undefined) return

  const weekday = weekdayOf(hari)
  const dalamRun = libur.has(hari) && (libur.has(hari - 1) || libur.has(hari + 1))

  if (k.type === 'akhirPekan' && !dipilih.has(hari)) {
    ctx.fillStyle = WARNA.akhirPekan
    ctx.fillRect(x, y, SEL_W - 1, SEL_H - 1)
  }

  // The run bar is the point of the sheet: it shows blocks joining up.
  if (dalamRun) {
    ctx.fillStyle = WARNA.runBar
    const kiri = libur.has(hari - 1) && weekday !== 0 ? 0 : 2
    const kanan = libur.has(hari + 1) && weekday !== 6 ? 0 : 2
    ctx.fillRect(x + kiri, y + 2, SEL_W - 1 - kiri - kanan, SEL_H - 5)
  }

  ctx.fillStyle = dipilih.has(hari)
    ? WARNA.cutiPribadi
    : k.type === 'liburNasional'
      ? WARNA.liburMerah
      : k.type === 'cutiBersama' && k.libur
        ? WARNA.cutiBersama
        : k.type === 'akhirPekan'
          ? WARNA.inkPudar
          : WARNA.ink

  const { day } = civilOf(hari)
  ctx.font = `${k.type === 'hariKerja' ? '400' : '600'} 11px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText(String(day), x + SEL_W - 5, y + 5)
  ctx.textAlign = 'left'
}
