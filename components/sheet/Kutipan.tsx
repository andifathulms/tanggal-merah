'use client'

import { namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'
import type { KlasifikasiHari } from '@/lib/rules/resolve'

/**
 * A6 — the citation, in the sheet.
 *
 * Every date in this app carries the number and signing date of the instrument
 * it was transcribed from; the schema enforces it and the build fails without
 * it. That is the app's most distinctive property, and it lived entirely on a
 * separate page where a reader had to match a date by eye against a table.
 *
 * One shared region below the grid rather than a popover per cell: it cannot
 * clip out of a 50px-wide cell, it needs no positioning logic, it works the same
 * on a phone as with a keyboard, and the sheet keeps exactly one interaction
 * pattern per kind of cell.
 *
 * With the year's pack still a draft, this is also where a reader finds out
 * which entries carry a placeholder number — turning the banner's blanket
 * warning into something they can inspect for themselves.
 */
export function Kutipan({
  klasifikasi,
  locale,
}: {
  readonly klasifikasi: KlasifikasiHari | null
  readonly locale: Locale
}) {
  const kosong =
    klasifikasi === null || (klasifikasi.type !== 'liburNasional' && klasifikasi.type !== 'cutiBersama')

  return (
    <div
      aria-live="polite"
      /* The height is reserved either way, so filling this in never shifts the
         grid above it. But the frame only appears once there is a citation in
         it: an empty bordered panel below the sheet read as something that had
         failed to load, and it competed with the legend and the instruction line
         already sitting above the grid. Empty, this is one quiet line of text. */
      className={`mt-ruang-lg min-h-[4.5rem] ${
        kosong ? '' : 'border-l-4 border-garisTebal bg-kertas px-ruang-lg py-ruang-md'
      }`}
    >
      {kosong ? (
        <p className="teks-catatan">{t('kutipanPetunjuk', locale)}</p>
      ) : (
        <Isi klasifikasi={klasifikasi} locale={locale} />
      )}
    </div>
  )
}

function Isi({
  klasifikasi,
  locale,
}: {
  readonly klasifikasi: Extract<KlasifikasiHari, { type: 'liburNasional' | 'cutiBersama' }>
  readonly locale: Locale
}) {
  const { entri } = klasifikasi
  const merah = klasifikasi.type === 'liburNasional'
  // The validator's placeholder, which a draft pack carries in place of a
  // number nobody has checked. Better to say so here than to print it as if it
  // were a citation.
  const belumDiverifikasi = /BELUM DIVERIFIKASI/i.test(entri.sitasi.nomor)

  return (
    <>
      <p className="flex flex-wrap items-baseline gap-x-ruang-sm">
        <span className={`angka text-sm font-semibold ${merah ? 'text-liburMerahTeks' : 'text-cutiBersamaTeks'}`}>
          {tanggalPanjang(klasifikasi.hari, locale)}
        </span>
        <span className="text-base font-semibold text-ink">{namaLibur(entri, locale)}</span>
        <span className={`label-bagian ${merah ? 'text-liburMerahTeks' : 'text-cutiBersamaTeks'}`}>
          {t(merah ? 'legendaLibur' : 'legendaCutiBersama', locale)}
        </span>
      </p>

      <p className="mt-1 text-sm leading-relaxed text-inkSedang">
        {entri.sitasi.instrumen}
        {belumDiverifikasi ? (
          <span className="text-cutiBersamaTeks"> — {t('kutipanBelumDiverifikasi', locale)}</span>
        ) : (
          <>
            {' · '}
            <span className="angka">{entri.sitasi.nomor}</span>
            {' · '}
            {t('kutipanDitandatangani', locale)}{' '}
            <span className="angka">{entri.sitasi.ditandatangani}</span>
          </>
        )}
      </p>

      {/* Where the instrument itself defers the date — the SKB notes that
          1 Ramadan, Idulfitri, and Iduladha are set separately by Kemenag. */}
      {entri.catatan !== undefined && (
        <p className="mt-1 text-sm leading-relaxed text-inkPudar">{entri.catatan}</p>
      )}
    </>
  )
}
