'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DayNumber } from '@/lib/day'
import type { WorkPattern } from '@/lib/day/pattern'
import { tahunTersedia } from '@/lib/rules/loader'
import { pesanPenolakan, messagePenolakanEn } from '@/lib/rules/refusal'
import type { Status } from '@/lib/status'
import { hitungTrace, type LeaveTrace } from '@/lib/trace'
import type { Jembatan } from '@/lib/optimise'
import { dariHash, keHash } from '@/lib/share'
import { t, type Locale } from '@/lib/i18n'
import { keIcs } from '@/lib/export/ics'
import { gambarSheet } from '@/lib/export/png'
import { Controls } from './Controls'
import { BannerDraf, CatatanTidakMenghitung, Penafian } from './Banner'
import { YearSheet } from './sheet/YearSheet'
import { Ledger } from './ledger/Ledger'
import { Suggestions } from './suggest/Suggestions'

/**
 * State container. Everything shown is computed by `hitungTrace` in `lib/` —
 * invariant 15 holds: nothing is computed in a component.
 *
 * Invariant 2 holds too. The engine never reads the clock; "this year" is
 * resolved here, in the UI, and passed in as an explicit argument. The initial
 * year is the newest bundled pack so that the statically exported HTML and the
 * first client render agree, and the clock only adjusts it after mount.
 */

const TERSEDIA = tahunTersedia()
const TAHUN_AWAL = TERSEDIA[TERSEDIA.length - 1] ?? 2026

export type PerencanaProps = {
  readonly locale: Locale
  readonly tampilkan: 'tahun' | 'rencana'
}

export function Perencana({ locale, tampilkan }: PerencanaProps) {
  const [tahun, setTahun] = useState(TAHUN_AWAL)
  const [status, setStatus] = useState<Status>({ type: 'asn', jatahHari: 12, tidakDiberikanHari: 0 })
  const [pattern, setPattern] = useState<WorkPattern>('lima-hari')
  const [dipilihSendiri, setDipilihSendiri] = useState<readonly DayNumber[]>([])
  const [tersalin, setTersalin] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Read the shared link once on mount, then resolve "this year" from the
  // clock — the only place in the app that touches it.
  useEffect(() => {
    const bawaan = { tahun: TAHUN_AWAL, status, pattern, dipilihSendiri }
    const dariTautan = window.location.hash.length > 1 ? dariHash(window.location.hash, bawaan) : null

    if (dariTautan !== null) {
      setTahun(dariTautan.tahun)
      setStatus(dariTautan.status)
      setPattern(dariTautan.pattern)
      setDipilihSendiri(dariTautan.dipilihSendiri)
      return
    }

    const sekarang = new Date().getFullYear()
    if (TERSEDIA.includes(sekarang)) setTahun(sekarang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasil = useMemo(
    () => hitungTrace({ tahun, status, pattern, dipilihSendiri }),
    [tahun, status, pattern, dipilihSendiri],
  )

  // Keep the hash current so the address bar is always a shareable link.
  useEffect(() => {
    const hash = keHash({ tahun, status, pattern, dipilihSendiri })
    window.history.replaceState(null, '', `#${hash}`)
  }, [tahun, status, pattern, dipilihSendiri])

  const toggleHari = useCallback((hari: DayNumber) => {
    setDipilihSendiri((sebelumnya) =>
      sebelumnya.includes(hari)
        ? sebelumnya.filter((d) => d !== hari)
        : [...sebelumnya, hari].sort((a, b) => a - b),
    )
  }, [])

  const ambilJembatan = useCallback((jembatan: Jembatan) => {
    setDipilihSendiri((sebelumnya) => {
      const sudah = jembatan.hari.every((d) => sebelumnya.includes(d))
      return sudah
        ? sebelumnya.filter((d) => !jembatan.hari.includes(d))
        : [...new Set([...sebelumnya, ...jembatan.hari])].sort((a, b) => a - b)
    })
  }, [])

  const terapkanOptimal = useCallback(() => {
    if (hasil.type !== 'terhitung') return
    const hari = hasil.rencanaOptimal.dipilih.flatMap((b) => b.hari)
    setDipilihSendiri((sebelumnya) => [...new Set([...sebelumnya, ...hari])].sort((a, b) => a - b))
  }, [hasil])

  const disarankan = useMemo(() => {
    if (hasil.type !== 'terhitung') return new Set<DayNumber>()
    return new Set(hasil.rencanaOptimal.dipilih.flatMap((b) => b.hari))
  }, [hasil])

  if (hasil.type === 'ditolak') {
    return (
      <div role="alert" className="border-2 border-liburMerah bg-liburMerah/5 p-6">
        <h2 className="poster text-2xl text-liburMerah">{locale === 'id' ? 'Belum bisa dihitung' : 'Cannot compute'}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed">
          {locale === 'id' ? pesanPenolakan(hasil.penolakan) : messagePenolakanEn(hasil.penolakan)}
        </p>
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            {t('tahunLain', locale)}
          </span>
          <div className="mt-1 flex gap-2">
            {TERSEDIA.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setTahun(y)}
                className="angka border border-ink/30 px-2 py-0.5 text-sm hover:bg-ink/5"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const trace = hasil

  function unduhIcs() {
    // DTSTAMP comes from the browser at the moment of export; the engine
    // itself still never reads the clock.
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const teks = keIcs(trace, locale, dtstamp)
    unduh(new Blob([teks], { type: 'text/calendar;charset=utf-8' }), `tanggal-merah-${trace.tahun}.ics`)
  }

  function unduhPng() {
    const canvas = canvasRef.current ?? document.createElement('canvas')
    gambarSheet(canvas, trace, locale)
    canvas.toBlob((blob) => {
      if (blob !== null) unduh(blob, `tanggal-merah-${trace.tahun}.png`)
    }, 'image/png')
  }

  async function salinTautan() {
    await navigator.clipboard.writeText(window.location.href)
    setTersalin(true)
    window.setTimeout(() => setTersalin(false), 1600)
  }

  return (
    <div className="space-y-6">
      {trace.perluVerifikasi && <BannerDraf locale={locale} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 space-y-6 lg:order-1">
          {tampilkan === 'tahun' ? (
            <>
              <Ringkasan trace={trace} locale={locale} />
              <YearSheet trace={trace} locale={locale} disarankan={disarankan} onToggle={toggleHari} />
            </>
          ) : (
            <Suggestions
              trace={trace}
              locale={locale}
              dipilihSendiri={new Set(trace.dipilihSendiri)}
              onAmbil={ambilJembatan}
              onTerapkanOptimal={terapkanOptimal}
            />
          )}
        </div>

        <aside className="order-1 space-y-4 lg:order-2">
          <Controls
            locale={locale}
            tahun={tahun}
            tahunTersedia={TERSEDIA}
            status={status}
            pattern={pattern}
            onTahun={setTahun}
            onStatus={setStatus}
            onPattern={setPattern}
          />
          <Ledger trace={trace} locale={locale} />

          <section className="border border-ink/20 bg-newsprint p-4">
            <h2 className="poster text-xl leading-none">{t('eksporJudul', locale)}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={unduhIcs} className={TOMBOL}>
                {t('eksporIcs', locale)}
              </button>
              <button type="button" onClick={unduhPng} className={TOMBOL}>
                {t('eksporPng', locale)}
              </button>
              <button type="button" onClick={salinTautan} className={TOMBOL}>
                {tersalin ? t('eksporTersalin', locale) : t('eksporSalinTautan', locale)}
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" aria-hidden />
          </section>

          <CatatanTidakMenghitung locale={locale} />
          <Penafian locale={locale} />
        </aside>
      </div>
    </div>
  )
}

const TOMBOL =
  'border border-ink/30 px-3 py-1 text-sm hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-liburMerah'

function Ringkasan({ trace, locale }: { readonly trace: LeaveTrace; readonly locale: Locale }) {
  const totalLibur = trace.run.reduce((n, r) => n + r.panjangHari, 0)

  return (
    <section className="flex flex-wrap gap-x-10 gap-y-3 border border-ink/20 bg-newsprint p-4">
      <Angka label={t('ringkasTerpanjang', locale)} nilai={trace.runTerpanjangHari} satuan={t('ringkasHari', locale)} warna="text-liburMerah" />
      <Angka label={t('ringkasTotalLibur', locale)} nilai={totalLibur} satuan={t('ringkasHari', locale)} warna="text-ink" />
      <Angka label={t('ledgerSisa', locale)} nilai={trace.ledger.sisaHari} satuan={t('ringkasHari', locale)} warna="text-cutiPribadi" />
    </section>
  )
}

function Angka({
  label,
  nilai,
  satuan,
  warna,
}: {
  readonly label: string
  readonly nilai: number
  readonly satuan: string
  readonly warna: string
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink/55">{label}</div>
      <div className={`angka text-3xl leading-none ${warna}`}>
        {nilai} <span className="text-xs text-ink/50">{satuan}</span>
      </div>
    </div>
  )
}

function unduh(blob: Blob, nama: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  a.click()
  URL.revokeObjectURL(url)
}
