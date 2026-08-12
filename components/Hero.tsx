'use client'

import { t, tanggalPanjang, type Locale } from '@/lib/i18n'
import type { LeaveTrace } from '@/lib/trace'

/**
 * The first screen a stranger sees.
 *
 * The old front page opened with twelve month grids and a radio group asking
 * "ASN atau swasta". A reader who does not already know the cuti bersama rule
 * has no way to tell why that question should change a calendar — so they
 * cannot answer it, and the app's whole point is lost before it is made.
 *
 * This states the point in one sentence, proves it with one real figure from the
 * year, defines the two terms the rest of the page leans on, and shows the three
 * steps. It is the only place on the site that explains rather than computes.
 */
export function Hero({ locale, trace }: { readonly locale: Locale; readonly trace: LeaveTrace }) {
  // A lookup, not a computation — invariant 15 holds. `saran` arrives already
  // ranked by leverage from lib/optimise, so its first entry is the year's best
  // trade. Undefined when nothing fits the budget, in which case there is
  // nothing honest to show and the strip is omitted.
  const bukti = trace.saran[0]

  return (
    <section className="border-b border-garis pb-ruang-2xl">
      <div className="max-w-prosa">
        <h2 className="poster text-4xl text-liburMerahTeks sm:text-5xl">{t('heroJudul', locale)}</h2>
        <p className="mt-ruang-md text-lg leading-relaxed text-inkSedang">{t('heroTeks', locale)}</p>
      </div>

      {/* The arithmetic *is* the explanation. Everything above is prose, and the
          figure that makes the point — one leave day buying four days off — used
          to sit three screens down, past the status question. A reader who sees
          1 → 5 understands the site before reading a word of it.

          Invariant 13: this states a trade, it does not recommend taking it. */}
      {bukti !== undefined && (
        <div className="mt-ruang-xl inline-block border-l-4 border-liburMerah bg-kertas px-ruang-lg py-ruang-md shadow-kartu">
          <span className="label-bagian">{t('buktiLabel', locale)}</span>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-ruang-sm gap-y-1">
            <span className="angka-bagian text-cutiPribadiTeks">{bukti.biayaHari}</span>
            <span className="text-base text-inkSedang">{t('saranHariCuti', locale)}</span>
            <span className="text-xl text-inkSamar" aria-hidden>
              →
            </span>
            <span className="angka-bagian text-liburMerahTeks">{bukti.hasilHari}</span>
            <span className="text-base text-inkSedang">{t('buktiHasil', locale)}</span>
          </p>
          <p className="mt-ruang-sm text-sm text-inkPudar">
            {tanggalPanjang(bukti.mulai, locale)}
            <span aria-hidden> · </span>
            <span className="angka">
              <span className="sr-only">{t('saranLeverage', locale)} </span>×{bukti.leverage.toFixed(1)}
            </span>
          </p>
        </div>
      )}

      <div className="mt-ruang-xl grid gap-ruang-md sm:grid-cols-2">
        <Istilah
          warna="bg-liburMerah"
          judul={t('legendaLibur', locale)}
          teks={t('istilahLiburTeks', locale)}
          batas="border-liburMerah/30 bg-liburMerahLembut/40"
        />
        <Istilah
          warna="bg-cutiBersama"
          judul={t('legendaCutiBersama', locale)}
          teks={t('istilahCutiBersamaTeks', locale)}
          batas="border-cutiBersama/40 bg-cutiBersamaLembut/50"
        />
      </div>

      {/* Three steps that match the three numbered sections below, in order.
          They used to be `hidden sm:grid`, so a phone visitor — most of them —
          got no orientation at all. */}
      <ol className="mt-ruang-xl grid gap-x-ruang-xl gap-y-ruang-lg sm:grid-cols-3">
        <Langkah
          nomor={1}
          label={t('langkahSatu', locale)}
          judul={t('heroLangkah1', locale)}
          teks={t('heroLangkah1Teks', locale)}
        />
        <Langkah
          nomor={2}
          label={t('langkahDua', locale)}
          judul={t('heroLangkah2', locale)}
          teks={t('heroLangkah2Teks', locale)}
        />
        <Langkah
          nomor={3}
          label={t('langkahTiga', locale)}
          judul={t('heroLangkah3', locale)}
          teks={t('heroLangkah3Teks', locale)}
        />
      </ol>
    </section>
  )
}

function Istilah({
  warna,
  judul,
  teks,
  batas,
}: {
  readonly warna: string
  readonly judul: string
  readonly teks: string
  readonly batas: string
}) {
  return (
    <div className={`border-l-4 px-ruang-lg py-ruang-md ${batas}`}>
      <h3 className="flex items-center gap-ruang-sm text-sm font-semibold">
        <span className={`inline-block h-3 w-3 shrink-0 ${warna}`} aria-hidden />
        {judul}
      </h3>
      <p className="mt-1.5 text-base leading-relaxed text-inkSedang">{teks}</p>
    </div>
  )
}

function Langkah({
  nomor,
  label,
  judul,
  teks,
}: {
  readonly nomor: number
  readonly label: string
  readonly judul: string
  readonly teks: string
}) {
  return (
    <li className="flex gap-ruang-md">
      <span
        className="angka mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-garisTebal text-xs text-inkPudar"
        aria-hidden
      >
        {nomor}
      </span>
      <div>
        <span className="label-bagian">{label}</span>
        <h3 className="text-base font-semibold leading-snug">{judul}</h3>
        <p className="mt-1 text-base leading-relaxed text-inkPudar">{teks}</p>
      </div>
    </li>
  )
}
