'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DayNumber } from '@/lib/day'
import type { WorkPattern } from '@/lib/day/pattern'
import { tahunTersedia } from '@/lib/rules/loader'
import { pesanPenolakan, messagePenolakanEn } from '@/lib/rules/refusal'
import type { Status } from '@/lib/status'
import { hitungTrace } from '@/lib/trace'
import type { Jembatan } from '@/lib/optimise'
import { dariHash, keHash } from '@/lib/share'
import { t, type Locale } from '@/lib/i18n'
import { keIcs } from '@/lib/export/ics'
import { gambarSheet } from '@/lib/export/png'
import { pratinjauStatus } from '@/lib/trace/pratinjau'
import { Controls } from './Controls'
import { BannerDraf } from './Banner'
import { YearSheet } from './sheet/YearSheet'
import { Ledger } from './ledger/Ledger'
import { LiburHilang } from './ledger/LiburHilang'
import { Suggestions } from './suggest/Suggestions'
import { Hero } from './Hero'
import { StatusPicker } from './StatusPicker'
import { Headline } from './Headline'

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

  // What each status would leave, so the choice can carry its own
  // explanation. Computed in lib/, not here.
  const pratinjau = useMemo(
    () =>
      pratinjauStatus(
        tahun,
        pattern,
        status.jatahHari,
        status.type === 'asn' ? status.tidakDiberikanHari : 0,
      ),
    [tahun, pattern, status],
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
      <div role="alert" className="border-l-4 border-liburMerah bg-liburMerahLembut/50 p-6">
        <h2 className="poster text-2xl text-liburMerahTeks">
          {locale === 'id' ? 'Belum bisa dihitung' : 'Cannot compute'}
        </h2>
        <p className="teks-jelas mt-ruang-sm">
          {locale === 'id' ? pesanPenolakan(hasil.penolakan) : messagePenolakanEn(hasil.penolakan)}
        </p>
        <div className="mt-4">
          <span className="label-bagian">{t('tahunLain', locale)}</span>
          <div className="mt-1 flex gap-2">
            {TERSEDIA.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setTahun(y)}
                className="angka border border-garisTebal bg-kertas px-3 py-1 text-sm hover:bg-kertasGelap"
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
    <div className="space-y-10">
      {/* The explanation comes before the instrument. A reader who does not
          know what cuti bersama costs cannot answer the status question, and
          the status question is the first thing the page asks. */}
      {tampilkan === 'tahun' && <Hero locale={locale} trace={trace} />}

      {/* And the caveat comes after the explanation. It used to be the second
          thing read — "do not rely on it" before the reader knew what "it"
          was — which cost the site its credibility instead of demonstrating
          it. Still above the fold, still role="alert". */}
      {trace.perluVerifikasi && <BannerDraf locale={locale} tahun={trace.tahun} />}

      <StatusPicker locale={locale} status={status} pratinjau={pratinjau} onStatus={setStatus} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_296px]">
        {/* The answer and the sheet lead on every viewport. The settings rail
            follows on mobile — it used to come first, which meant a phone
            opened on a form instead of on the result. */}
        <div className="space-y-10">
          <Headline trace={trace} locale={locale} />

          {tampilkan === 'tahun' ? (
            <>
              <Suggestions
                trace={trace}
                locale={locale}
                dipilihSendiri={new Set(trace.dipilihSendiri)}
                onAmbil={ambilJembatan}
                onTerapkanOptimal={terapkanOptimal}
                batas={4}
              />
              <p className="-mt-6">
                <Link href={`/${locale}/rencana/`} className="text-sm font-semibold text-liburMerahTeks underline underline-offset-4 hover:text-liburMerah">
                  {t('sheetLihatSemua', locale)} →
                </Link>
              </p>
              <YearSheet trace={trace} locale={locale} disarankan={disarankan} onToggle={toggleHari} />
            </>
          ) : (
            <>
              <Suggestions
                trace={trace}
                locale={locale}
                dipilihSendiri={new Set(trace.dipilihSendiri)}
                onAmbil={ambilJembatan}
                onTerapkanOptimal={terapkanOptimal}
              />
              <YearSheet trace={trace} locale={locale} disarankan={disarankan} onToggle={toggleHari} />
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
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
          <LiburHilang hilang={trace.hilang} locale={locale} />

          <section className="kartu p-4">
            <h2 className="label-bagian">{t('eksporJudul', locale)}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
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
        </aside>
      </div>
    </div>
  )
}

const TOMBOL =
  'border border-garisTebal bg-kertas px-3 py-1.5 text-xs font-semibold text-inkSedang hover:bg-kertasGelap'

function unduh(blob: Blob, nama: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  a.click()
  URL.revokeObjectURL(url)
}
