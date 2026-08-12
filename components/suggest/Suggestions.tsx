'use client'

import type { RefObject } from 'react'
import type { DayNumber } from '@/lib/day'
import type { Jembatan } from '@/lib/optimise'
import { SEMUA_TUJUAN, type Tujuan } from '@/lib/optimise/tujuan'
import type { LeaveTrace } from '@/lib/trace'
import { t, tanggalPanjang, type Locale } from '@/lib/i18n'

/**
 * Ranked bridges with the arithmetic visible (PRD §5.4) — "1 hari → 4 hari
 * libur", set large enough that the trade is readable at a glance.
 *
 * Invariant 13: no advice. This ranks by leverage arithmetic and nothing else.
 * It never recommends taking leave and never says a plan is good. The copy
 * beneath the heading says so out loud, because a ranked list invites being
 * read as a recommendation and it is not one.
 */
export type SuggestionsProps = {
  readonly trace: LeaveTrace
  readonly locale: Locale
  readonly dipilihSendiri: ReadonlySet<DayNumber>
  readonly onAmbil: (jembatan: Jembatan) => void
  readonly onTerapkanOptimal: () => void
  readonly tujuan: Tujuan
  readonly onTujuan: (tujuan: Tujuan) => void
  /**
   * Where focus is sent after a button in here unmounts itself. Taking a bridge
   * removes it from the list, so the button the reader just pressed disappears and
   * focus would otherwise fall to <body> (WCAG 2.4.3).
   */
  readonly fokusRef?: RefObject<HTMLHeadingElement>
  /** Cap the list on the overview; the plan page shows everything. */
  readonly batas?: number
}

export function Suggestions({
  trace,
  locale,
  dipilihSendiri,
  onAmbil,
  onTerapkanOptimal,
  tujuan,
  onTujuan,
  fokusRef,
  batas,
}: SuggestionsProps) {
  const { rencanaOptimal, saran } = trace
  const tampil = batas === undefined ? saran : saran.slice(0, batas)

  return (
    <section aria-labelledby="judul-saran">
      {/* Step 3. The sheet is step 2 and lives on the other route now, so each page
          shows its own steps in ascending order and links to the one it is missing. */}
      <span className="label-bagian">{t('langkahTiga', locale)}</span>
      <h2 id="judul-saran" ref={fokusRef} tabIndex={-1} className="poster mt-0.5 text-2xl">
        {batas === undefined ? t('saranJudul', locale) : t('saranTeratas', locale)}
      </h2>
      <p className="teks-jelas mt-ruang-sm">{t('saranPenjelasan', locale)}</p>

      {rencanaOptimal.dipilih.length > 0 && (
        <div className="mt-ruang-lg border-2 border-cutiPribadi bg-cutiPribadiLembut p-ruang-lg">
          <span className="label-bagian text-cutiPribadiTeks">{t('optimalJudul', locale)}</span>
          <p className="mt-1 text-base leading-snug">
            <span className="angka-sebaris text-cutiPribadiTeks">{rencanaOptimal.biayaHari}</span>{' '}
            <span className="text-inkSedang">{t('saranHariCuti', locale)}</span>{' '}
            <span className="text-inkPudar">→</span>{' '}
            <span className="angka-sebaris text-liburMerahTeks">{rencanaOptimal.nilaiHari}</span>{' '}
            <span className="text-inkSedang">
              {t(rencanaOptimal.tujuan === 'rentetanTerpanjang' ? 'optimalNilaiRentetan' : 'optimalNilai', locale)}
            </span>
          </p>
          {/* Under the total-days objective the figure sums the stretches it
              joins, and calling that a single run would be a confidently wrong
              claim about someone's time off. Under the longest-run objective it
              genuinely is one stretch, so the caveat would be false — which is
              exactly why the objective had to become explicit. */}
          {rencanaOptimal.tujuan === 'totalHariLibur' && rencanaOptimal.dipilih.length > 1 && (
            <p className="mt-1 text-sm text-inkPudar">{t('optimalCatatanRentetan', locale)}</p>
          )}
          <p className="mt-1 text-sm text-inkPudar">{t('optimalEksak', locale)}</p>
          <button
            type="button"
            onClick={onTerapkanOptimal}
            className="mt-ruang-md bg-cutiPribadi px-ruang-lg py-1.5 text-sm font-semibold text-kertas hover:bg-cutiPribadiTeks"
          >
            {t('optimalTerapkan', locale)}
          </button>
        </div>
      )}

      {/* The objective, below the answer rather than above it. "Optimal" was
          never a property of the calendar — it is a property of the calendar plus
          a question, and two readers with identical status, working week and
          budget have genuinely different correct answers, so the question has to
          be askable. But it was placed before the first result, which made it a
          gate: a reader had to state an objective before they had seen anything
          the objective applies to. It follows the answer now, and reads as "or
          ask it the other way". */}
      <PilihTujuan
        tujuan={tujuan}
        onTujuan={onTujuan}
        locale={locale}
        terpilihNilai={rencanaOptimal.nilaiHari}
        alternatifNilai={trace.rencanaAlternatif.nilaiHari}
      />

      {tampil.length === 0 ? (
        <p className="mt-ruang-lg text-sm text-inkPudar">{t('saranKosong', locale)}</p>
      ) : (
        <ul className="mt-ruang-lg grid gap-ruang-sm sm:grid-cols-2">
          {tampil.map((b) => (
            <KartuJembatan
              key={`${b.mulai}-${b.selesai}`}
              jembatan={b}
              locale={locale}
              sudahDiambil={b.hari.every((d) => dipilihSendiri.has(d))}
              onAmbil={onAmbil}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function KartuJembatan({
  jembatan,
  locale,
  sudahDiambil,
  onAmbil,
}: {
  readonly jembatan: Jembatan
  readonly locale: Locale
  readonly sudahDiambil: boolean
  readonly onAmbil: (jembatan: Jembatan) => void
}) {
  const rentang =
    jembatan.biayaHari === 1
      ? tanggalPanjang(jembatan.mulai, locale)
      : `${tanggalPanjang(jembatan.mulai, locale)} – ${tanggalPanjang(jembatan.selesai, locale)}`

  return (
    <li
      className={`flex items-center justify-between gap-ruang-md border p-ruang-md ${
        sudahDiambil ? 'border-cutiPribadi bg-cutiPribadiLembut' : 'border-garis bg-kertas'
      }`}
    >
      <div className="min-w-0">
        {/* The trade, set at a size that reads before the date does. */}
        {/* The whole line used to be `whitespace-nowrap` — about 200px of
            unbreakable text in a card that also holds a leverage figure and a
            button, which overflowed at 320px and under text zoom (WCAG 1.4.10,
            1.4.4). Each figure keeps its unit on the same line; the arrow is where
            it may now break. */}
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="angka-sebaris text-cutiPribadiTeks">{jembatan.biayaHari}</span>
            <span className="text-xs text-inkPudar">{t('saranHariCuti', locale)}</span>
          </span>
          <span className="text-inkSamar" aria-hidden>
            →
          </span>
          <span className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="angka-sebaris text-liburMerahTeks">{jembatan.hasilHari}</span>
            <span className="text-xs text-inkPudar">{t('saranHasilRingkas', locale)}</span>
          </span>
        </p>
        <p className="mt-0.5 truncate text-sm text-inkSedang">{rentang}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {/* `title` on a non-interactive span is mouse-only and inconsistently
            announced, so the figure read as a bare "×4.0". Same sr-only pattern the
            hero's proof line already uses. */}
        <span className="angka text-xs text-inkPudar">
          <span className="sr-only">
            {t('saranLeverage', locale)}, {t('saranLeverageRumus', locale)}:{' '}
          </span>
          ×{jembatan.leverage.toFixed(1)}
        </span>
        <button
          type="button"
          onClick={() => onAmbil(jembatan)}
          className={`border px-ruang-sm py-1 text-xs font-semibold ${
            sudahDiambil
              ? 'border-garisTebal text-inkSedang hover:bg-kertasGelap'
              : 'border-cutiPribadi text-cutiPribadiTeks hover:bg-cutiPribadi hover:text-kertas'
          }`}
        >
          {sudahDiambil ? t('saranBatal', locale) : t('saranAmbil', locale)}
        </button>
      </div>
    </li>
  )
}

/**
 * Two questions, both answered exactly. Nothing here marks either as the better
 * one — invariant 13 — and the description under each says what it optimises so
 * the reader picks on the arithmetic rather than on the wording.
 */
function PilihTujuan({
  tujuan,
  onTujuan,
  locale,
  terpilihNilai,
  alternatifNilai,
}: {
  readonly tujuan: Tujuan
  readonly onTujuan: (tujuan: Tujuan) => void
  readonly locale: Locale
  readonly terpilihNilai: number
  readonly alternatifNilai: number
}) {
  return (
    /* One question, two mutually exclusive answers — a fieldset of radios, not a
       pair of `aria-pressed` buttons. The legend carries the question, so nothing
       needs an aria-label. */
    <fieldset className="mt-ruang-lg">
      <legend className="label-bagian mb-ruang-sm">{t('tujuanPertanyaan', locale)}</legend>
      <div className="grid gap-ruang-sm sm:grid-cols-2">
        {SEMUA_TUJUAN.map((kandidat) => {
          const terpilih = kandidat === tujuan
          return (
            <label key={kandidat} className="block cursor-pointer">
              <input
                type="radio"
                name="tujuan-rencana"
                value={kandidat}
                checked={terpilih}
                onChange={() => onTujuan(kandidat)}
                className="peer sr-only"
              />
              <span
                className={`kartu-pilihan block h-full border-2 px-ruang-lg py-ruang-md text-left transition-shadow ${
                  terpilih
                    ? 'border-ink bg-kertas shadow-angkat'
                    : 'border-garis bg-newsprint hover:border-garisTebal hover:shadow-kartu'
                }`}
              >
                <span className="block text-base font-semibold leading-snug">
                  {t(kandidat === 'rentetanTerpanjang' ? 'tujuanRentetan' : 'tujuanTotal', locale)}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-inkPudar">
                  {t(kandidat === 'rentetanTerpanjang' ? 'tujuanRentetanKet' : 'tujuanTotalKet', locale)}
                </span>
                {/* Each option carries the figure it produces, so the choice is made
                    on the arithmetic rather than on the description. A reader used to
                    have to pick one, read the number, switch, and hold the first
                    number in their head. */}
                <span className="mt-ruang-sm block">
                  <span className="text-xs text-inkPudar">{t('tujuanIniMemberi', locale)} </span>
                  <span
                    className={`angka text-sm font-semibold ${
                      terpilih ? 'text-liburMerahTeks' : 'text-inkSedang'
                    }`}
                  >
                    {terpilih ? terpilihNilai : alternatifNilai}
                  </span>{' '}
                  <span className="text-xs text-inkPudar">
                    {t(kandidat === 'rentetanTerpanjang' ? 'tujuanNilaiRentetan' : 'tujuanNilaiTotal', locale)}
                  </span>
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <p className="teks-catatan mt-ruang-sm text-sm">{t('tujuanBandingBeda', locale)}</p>
    </fieldset>
  )
}
