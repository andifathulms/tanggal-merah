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
import { TUJUAN_BAWAAN, type Tujuan } from '@/lib/optimise/tujuan'
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
import { BandingPosisi } from './ledger/BandingPosisi'
import { Suggestions } from './suggest/Suggestions'
import { KurvaMarginal } from './suggest/KurvaMarginal'
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
  const [tujuan, setTujuan] = useState<Tujuan>(TUJUAN_BAWAAN)
  const [dipilihSendiri, setDipilihSendiri] = useState<readonly DayNumber[]>([])
  const [tersalin, setTersalin] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /**
   * Focus recovery. Taking a bridge shrinks the remaining budget and removes those
   * days from the buyable set, so that bridge leaves `saran` and the button the
   * reader just pressed unmounts. Applying the whole plan empties
   * `rencanaOptimal.dipilih`, which unmounts the entire panel the button sat in.
   * Either way focus fell to <body> and a keyboard user was returned to the top of
   * the document with no idea anything had happened (WCAG 2.4.3).
   *
   * Focus goes to the suggestions heading: it is always mounted, it is where the
   * reader was working, and the live region added alongside says what changed — so
   * this restores position without talking over the announcement.
   */
  const judulSaranRef = useRef<HTMLHeadingElement>(null)
  const [pulihkanFokus, setPulihkanFokus] = useState(0)

  // Read the shared link once on mount, then resolve "this year" from the
  // clock — the only place in the app that touches it.
  useEffect(() => {
    const bawaan = { tahun: TAHUN_AWAL, status, pattern, tujuan, dipilihSendiri }
    const dariTautan = window.location.hash.length > 1 ? dariHash(window.location.hash, bawaan) : null

    if (dariTautan !== null) {
      setTahun(dariTautan.tahun)
      setStatus(dariTautan.status)
      setPattern(dariTautan.pattern)
      setTujuan(dariTautan.tujuan)
      setDipilihSendiri(dariTautan.dipilihSendiri)
      return
    }

    const sekarang = new Date().getFullYear()
    if (TERSEDIA.includes(sekarang)) setTahun(sekarang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasil = useMemo(
    () => hitungTrace({ tahun, status, pattern, tujuan, dipilihSendiri }),
    [tahun, status, pattern, tujuan, dipilihSendiri],
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
    const hash = keHash({ tahun, status, pattern, tujuan, dipilihSendiri })
    window.history.replaceState(null, '', `#${hash}`)
  }, [tahun, status, pattern, tujuan, dipilihSendiri])

  useEffect(() => {
    if (pulihkanFokus === 0) return
    judulSaranRef.current?.focus()
  }, [pulihkanFokus])

  const toggleHari = useCallback((hari: DayNumber) => {
    setDipilihSendiri((sebelumnya) =>
      sebelumnya.includes(hari)
        ? sebelumnya.filter((d) => d !== hari)
        : [...sebelumnya, hari].sort((a, b) => a - b),
    )
  }, [])

  const ambilJembatan = useCallback((jembatan: Jembatan) => {
    setPulihkanFokus((n) => n + 1)
    setDipilihSendiri((sebelumnya) => {
      const sudah = jembatan.hari.every((d) => sebelumnya.includes(d))
      return sudah
        ? sebelumnya.filter((d) => !jembatan.hari.includes(d))
        : [...new Set([...sebelumnya, ...jembatan.hari])].sort((a, b) => a - b)
    })
  }, [])

  const terapkanOptimal = useCallback(() => {
    if (hasil.type !== 'terhitung') return
    setPulihkanFokus((n) => n + 1)
    const hari = hasil.rencanaOptimal.dipilih.flatMap((b) => b.hari)
    setDipilihSendiri((sebelumnya) => [...new Set([...sebelumnya, ...hari])].sort((a, b) => a - b))
  }, [hasil])

  const disarankan = useMemo(() => {
    if (hasil.type !== 'terhitung') return new Set<DayNumber>()
    return new Set(hasil.rencanaOptimal.dipilih.flatMap((b) => b.hari))
  }, [hasil])

  if (hasil.type === 'ditolak') {
    return (
      <div role="alert" className="border-l-4 border-liburMerah bg-liburMerahLembut p-ruang-xl">
        <h2 className="poster text-2xl text-liburMerahTeks">
          {locale === 'id' ? 'Belum bisa dihitung' : 'Cannot compute'}
        </h2>
        <p className="teks-jelas mt-ruang-sm">
          {locale === 'id' ? pesanPenolakan(hasil.penolakan) : messagePenolakanEn(hasil.penolakan)}
        </p>
        <div className="mt-ruang-lg">
          <span className="label-bagian">{t('tahunLain', locale)}</span>
          <div className="mt-1 flex gap-ruang-sm">
            {TERSEDIA.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setTahun(y)}
                className="angka border border-garisTebal bg-kertas px-ruang-md py-1 text-sm hover:bg-kertasGelap"
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
    <div className="space-y-ruang-3xl">
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

      <div className="grid gap-ruang-2xl lg:grid-cols-[minmax(0,1fr)_296px]">
        {/* The answer and the sheet lead on every viewport. The settings rail
            follows on mobile — it used to come first, which meant a phone
            opened on a form instead of on the result. */}
        <div className="space-y-ruang-3xl">
          <Headline trace={trace} locale={locale} />

          {tampilkan === 'tahun' ? (
            <>
              {/* The link belongs to the suggestions, so it sits inside their
                  block at the inside-a-step rhythm. It used to be a sibling
                  pulled back up with a negative margin, which meant the column
                  gap and the link fought each other. */}
              <div className="space-y-ruang-lg">
                <Suggestions
                  trace={trace}
                  locale={locale}
                  dipilihSendiri={new Set(trace.dipilihSendiri)}
                  onAmbil={ambilJembatan}
                  onTerapkanOptimal={terapkanOptimal}
                  tujuan={tujuan}
                  onTujuan={setTujuan}
                  batas={4}
                />
                <p>
                  <Link
                    href={`/${locale}/rencana/`}
                    className="text-sm font-semibold text-liburMerahTeks underline underline-offset-4 hover:text-liburMerah"
                  >
                    {t('sheetLihatSemua', locale)} →
                  </Link>
                </p>
              </div>
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
                tujuan={tujuan}
                onTujuan={setTujuan}
                fokusRef={judulSaranRef}
              />
              {/* The price list belongs on the plan page rather than the
                  overview: the overview states the answer, this asks what each
                  day of the budget was worth. */}
              <KurvaMarginal kurva={trace.kurva} locale={locale} />
              <YearSheet trace={trace} locale={locale} disarankan={disarankan} onToggle={toggleHari} />
            </>
          )}
        </div>

        <aside className="space-y-ruang-lg lg:sticky lg:top-ruang-lg lg:self-start">
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
          {/* One card, ranked inside. The ledger is the account and keeps card
              weight; the other two are commentary *on* the ledger — what the
              weekend ate, and what the rejected reading would have cost — so
              they are sections under it rather than peers beside it.

              They were three identical `kartu` shells with three identical
              headings in a 296px column, which is the same equal-weight-blocks
              failure the Headline comment complains about, one level down. */}
          <div className="kartu">
            <Ledger trace={trace} locale={locale} />
            <LiburHilang hilang={trace.hilang} locale={locale} />
            <BandingPosisi banding={trace.ledger.banding} locale={locale} />
          </div>

          {/* Export is a set of actions, not a panel of information. It loses the
              card so it stops competing with the ledger for the reader's eye. */}
          <section>
            <h2 className="label-bagian">{t('eksporJudul', locale)}</h2>
            <div className="mt-ruang-sm flex flex-wrap gap-ruang-sm">
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
            {/* "Salin tautan" becomes "Tersalin" — a change to the focused
                element's own name, which screen readers do not announce. The
                confirmation needs its own polite region. */}
            <p aria-live="polite" className="sr-only">
              {tersalin ? t('eksporTersalinDiumumkan', locale) : ''}
            </p>

            <canvas ref={canvasRef} className="hidden" aria-hidden />
          </section>
        </aside>
      </div>
    </div>
  )
}

const TOMBOL =
  'border border-garisTebal bg-kertas px-ruang-md py-1.5 text-xs font-semibold text-inkSedang hover:bg-kertasGelap'

function unduh(blob: Blob, nama: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nama
  a.click()
  URL.revokeObjectURL(url)
}
