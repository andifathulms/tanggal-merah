'use client'

import { civilOf } from '@/lib/day'
import { namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'
import type { Jembatan } from '@/lib/optimise'
import type { Contoh, HariContoh } from '@/lib/trace/contoh'

/**
 * The app's one end-to-end explanation.
 *
 * Everything else states a result. The hero had the trade and the date, the
 * suggestion list had the ranking, the sheet had the bar — and nowhere could a
 * newcomer watch a single calculation happen. This shows the real days of the year's
 * best harpitnas in order, marks which ones the reader already has and which two they
 * would be buying, and then says the thing the arithmetic is actually about: your
 * days off go up by exactly what you paid for, and what changes is that they join.
 *
 * It ends by offering the trade rather than describing it, so the reader's next act is
 * to take it and see the bar close on the sheet below — the moment PRD §5.1 calls the
 * one that makes the app worth having.
 *
 * Invariant 15: every figure and every day's role arrives from `lib/trace/contoh`.
 * Invariant 13: it states a trade and offers to apply it. It does not say to.
 */
export function ContohKerja({
  contoh,
  locale,
  sudahDiambil,
  onAmbil,
}: {
  readonly contoh: Contoh
  readonly locale: Locale
  readonly sudahDiambil: boolean
  readonly onAmbil: (jembatan: Jembatan) => void
}) {
  const isi = (kunci: 'contohSebelum' | 'contohSesudah' | 'contohInti') =>
    t(kunci, locale)
      .replace('%k', String(contoh.blokKiriHari))
      .replace('%n', String(contoh.blokKananHari))
      .replace('%b', String(contoh.dibeliHari))
      .replace('%s', String(contoh.sesudahHari))

  return (
    <section className="mt-ruang-xl border-l-4 border-liburMerah bg-kertas px-ruang-lg py-ruang-lg shadow-kartu">
      <h3 className="label-bagian">{t('contohJudul', locale)}</h3>

      <p className="teks-jelas mt-ruang-sm">{isi('contohSebelum')}</p>

      {/* The days themselves. A strip of real dates rather than a diagram of
          imaginary ones, so the reader can find them on the sheet below. */}
      <ol className="mt-ruang-md flex flex-wrap gap-1">
        {contoh.hari.map((h) => (
          <Hari key={h.hari} hari={h} locale={locale} />
        ))}
      </ol>

      <p className="teks-catatan mt-ruang-md text-sm">{t('contohWarna', locale)}</p>

      <p className="teks-jelas mt-ruang-md border-t border-garis pt-ruang-md">{isi('contohSesudah')}</p>

      {/* The point. Stated last, because it only lands once the reader has seen the
          days it is describing. */}
      <p className="teks-jelas mt-ruang-sm font-semibold text-ink">{isi('contohInti')}</p>

      <div className="mt-ruang-lg flex flex-wrap items-center gap-ruang-md">
        <button
          type="button"
          onClick={() => onAmbil(contoh.jembatan)}
          className={`px-ruang-lg py-ruang-sm text-sm font-semibold ${
            sudahDiambil
              ? 'border border-garisTebal text-inkSedang hover:bg-kertasGelap'
              : 'bg-cutiPribadi text-kertas hover:bg-cutiPribadiTeks'
          }`}
        >
          {sudahDiambil ? t('contohSudahDiambil', locale) : t('contohCoba', locale)}
        </button>
        {!sudahDiambil && <span className="text-sm text-inkPudar">{t('contohCobaKet', locale)}</span>}
      </div>
    </section>
  )
}

function Hari({ hari, locale }: { readonly hari: HariContoh; readonly locale: Locale }) {
  const { day } = civilOf(hari.hari)
  const dibeli = hari.peran === 'dibeli'
  const k = hari.klasifikasi
  const nama = k.type === 'liburNasional' || k.type === 'cutiBersama' ? namaLibur(k.entri, locale) : null

  // The sheet's colours, so this strip is a key to it rather than a second scheme.
  const warna = dibeli
    ? 'border-cutiPribadi bg-cutiPribadi text-kertas'
    : k.type === 'liburNasional'
      ? 'border-liburMerah bg-liburMerahLembut text-liburMerahTeks'
      : k.type === 'cutiBersama'
        ? 'border-cutiBersama bg-cutiBersamaLembut text-cutiBersamaTeks'
        : 'border-garisTebal bg-akhirPekan text-inkSedang'

  return (
    <li className={`flex min-w-[3rem] flex-col items-center border px-1 py-1 ${warna}`}>
      <span className="sr-only">
        {tanggalPanjang(hari.hari, locale)}
        {nama === null ? '' : ` — ${nama}`} —{' '}
        {dibeli ? t('contohBeli', locale) : t('contohSudahLibur', locale)}
      </span>
      <span className="poster text-lg leading-none" aria-hidden>
        {day}
      </span>
    </li>
  )
}
