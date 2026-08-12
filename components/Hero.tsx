'use client'

import { t, type Locale } from '@/lib/i18n'

/**
 * The first screen a stranger sees.
 *
 * The old front page opened with twelve month grids and a radio group asking
 * "ASN atau swasta". A reader who does not already know the cuti bersama rule
 * has no way to tell why that question should change a calendar — so they
 * cannot answer it, and the app's whole point is lost before it is made.
 *
 * This states the point in one sentence, defines the two terms the rest of the
 * page leans on, and shows the three steps. It is the only place on the site
 * that explains rather than computes.
 */
export function Hero({ locale }: { readonly locale: Locale }) {
  return (
    <section className="border-b border-garis pb-7">
      <div className="max-w-prosa">
        <h2 className="poster text-poster-md text-liburMerahTeks sm:text-poster-lg">{t('heroJudul', locale)}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-inkSedang">{t('heroTeks', locale)}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

      <ol className="mt-6 hidden gap-x-6 gap-y-3 sm:grid sm:grid-cols-3">
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
    <div className={`border-l-4 px-4 py-3 ${batas}`}>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className={`inline-block h-3 w-3 shrink-0 ${warna}`} aria-hidden />
        {judul}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-inkSedang">{teks}</p>
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
    <li className="flex gap-3">
      <span
        className="angka mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-garisTebal text-xs text-inkPudar"
        aria-hidden
      >
        {nomor}
      </span>
      <div>
        <span className="label-bagian">{label}</span>
        <h3 className="text-sm font-semibold leading-snug">{judul}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-inkPudar">{teks}</p>
      </div>
    </li>
  )
}
