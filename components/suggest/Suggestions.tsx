'use client'

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
  batas,
}: SuggestionsProps) {
  const { rencanaOptimal, saran } = trace
  const tampil = batas === undefined ? saran : saran.slice(0, batas)

  return (
    <section aria-labelledby="judul-saran">
      {/* Step 2, not 3. This and the year sheet were both labelled "Langkah 3",
          so the numbering told the reader nothing about where they were. */}
      <span className="label-bagian">{t('langkahDua', locale)}</span>
      <h2 id="judul-saran" className="poster mt-0.5 text-2xl">
        {batas === undefined ? t('saranJudul', locale) : t('saranTeratas', locale)}
      </h2>
      <p className="teks-jelas mt-ruang-sm">{t('saranPenjelasan', locale)}</p>

      {/* The objective, asked here rather than in the settings rail. "Optimal"
          was never a property of the calendar — it is a property of the calendar
          plus a question, and two readers with identical status, working week and
          budget have genuinely different correct answers. Asking after the reader
          has seen a result, instead of before, is the whole reason this sits in
          the middle of the page. */}
      <PilihTujuan tujuan={tujuan} onTujuan={onTujuan} locale={locale} />

      {rencanaOptimal.dipilih.length > 0 && (
        <div className="mt-ruang-lg border-2 border-cutiPribadi bg-cutiPribadiLembut/50 p-ruang-lg">
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
        sudahDiambil ? 'border-cutiPribadi bg-cutiPribadiLembut/40' : 'border-garis bg-kertas'
      }`}
    >
      <div className="min-w-0">
        {/* The trade, set at a size that reads before the date does. */}
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="angka-sebaris text-cutiPribadiTeks">{jembatan.biayaHari}</span>
          <span className="text-xs text-inkPudar">{t('saranHariCuti', locale)}</span>
          <span className="text-inkSamar" aria-hidden>
            →
          </span>
          <span className="angka-sebaris text-liburMerahTeks">{jembatan.hasilHari}</span>
          <span className="text-xs text-inkPudar">{locale === 'id' ? 'hari libur' : 'days off'}</span>
        </p>
        <p className="mt-0.5 truncate text-sm text-inkSedang">{rentang}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="angka text-xs text-inkPudar" title={t('saranLeverage', locale)}>
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
}: {
  readonly tujuan: Tujuan
  readonly onTujuan: (tujuan: Tujuan) => void
  readonly locale: Locale
}) {
  return (
    <div className="mt-ruang-lg">
      <span className="label-bagian">{t('tujuanPertanyaan', locale)}</span>
      <div className="mt-ruang-sm grid gap-ruang-sm sm:grid-cols-2">
        {SEMUA_TUJUAN.map((kandidat) => {
          const terpilih = kandidat === tujuan
          return (
            <button
              key={kandidat}
              type="button"
              onClick={() => onTujuan(kandidat)}
              aria-pressed={terpilih}
              className={`border-2 px-ruang-lg py-ruang-md text-left transition-shadow ${
                terpilih
                  ? 'border-ink bg-kertas shadow-angkat'
                  : 'border-garis bg-kertas/60 hover:border-garisTebal hover:shadow-kartu'
              }`}
            >
              <span className="block text-base font-semibold leading-snug">
                {t(kandidat === 'rentetanTerpanjang' ? 'tujuanRentetan' : 'tujuanTotal', locale)}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-inkPudar">
                {t(kandidat === 'rentetanTerpanjang' ? 'tujuanRentetanKet' : 'tujuanTotalKet', locale)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
