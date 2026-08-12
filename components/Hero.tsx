'use client'

import { t, tanggalPanjang, type Locale } from '@/lib/i18n'
import type { LeaveTrace } from '@/lib/trace'
import { contohJembatan } from '@/lib/trace/contoh'
import type { Jembatan } from '@/lib/optimise'
import { ContohKerja } from './ContohKerja'

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
export function Hero({
  locale,
  trace,
  onAmbil,
}: {
  readonly locale: Locale
  readonly trace: LeaveTrace
  readonly onAmbil: (jembatan: Jembatan) => void
}) {
  // The year's best trade, taken apart in lib/ — invariant 15. Undefined when there
  // is no candidate, in which case there is nothing honest to draw.
  const contoh = contohJembatan(trace)
  const sudahDiambil =
    contoh !== undefined && contoh.jembatan.hari.every((d) => trace.dipilihSendiri.includes(d))

  return (
    <section className="border-b border-garis pb-ruang-2xl">
      {/* Two columns from `xl`, one below it.
          The pitch is capped at a readable measure — 62ch, which it must stay for the
          paragraph to be readable at all — so on a 1400px container it used to leave
          roughly half the width empty beside the heading. The worked example moves into
          that space rather than sitting under it: the claim on the left, the proof on
          the right.

          The right track is `auto`, sized to the example's own content, so the heading
          takes whatever is left rather than the two splitting evenly and squeezing the
          strip. Below `xl` this is plain block flow and the order is unchanged —
          heading, paragraph, example — which is the mobile layout as it already was. */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start xl:gap-ruang-3xl">
        <div className="max-w-prosa">
          <h2 className="poster text-4xl text-liburMerahTeks sm:text-5xl">{t('heroJudul', locale)}</h2>
          <p className="mt-ruang-md text-lg leading-relaxed text-inkSedang">{t('heroTeks', locale)}</p>
        </div>

        {/* The arithmetic *is* the explanation, and it used to stop at the conclusion:
            "2 hari cuti → 12 hari libur" with a date beside it. A reader could not see
            that the twelve days are a block they already had, plus the two they bought,
            plus another block they already had — which is the entire mechanism. The
            example derives it, with the real dates, and then offers the trade so the
            next thing the reader does is watch the bar close.

            Invariant 13: it states a trade and offers to apply it. It does not advise. */}
        {contoh !== undefined && (
          <ContohKerja contoh={contoh} locale={locale} sudahDiambil={sudahDiambil} onAmbil={onAmbil} />
        )}
      </div>

      <div className="mt-ruang-xl grid gap-ruang-md sm:grid-cols-2">
        <Istilah
          warna="bg-liburMerah"
          judul={t('legendaLibur', locale)}
          teks={t('istilahLiburTeks', locale)}
          batas="border-liburMerah bg-liburMerahLembut"
        />
        <Istilah
          warna="bg-cutiBersama"
          judul={t('legendaCutiBersama', locale)}
          teks={t('istilahCutiBersamaTeks', locale)}
          batas="border-cutiBersama bg-cutiBersamaLembut"
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
