'use client'

import { t, tanggalPanjang, type Locale } from '@/lib/i18n'
import type { LeaveTrace } from '@/lib/trace'

/**
 * The answer, stated as a sentence before it is stated as a table.
 *
 * The old page opened with three equal-weight stat blocks, which asks the
 * reader to work out for themselves which number is the point. This says it:
 * one number, big, in a sentence, with the supporting figures beneath it.
 *
 * Invariant 13: this is arithmetic, not advice. It reports what the leave
 * would reach — it never suggests taking it.
 */
export function Headline({ trace, locale }: { readonly trace: LeaveTrace; readonly locale: Locale }) {
  const sudahPilih = trace.dipilihSendiri.length > 0

  /**
   * The run the headline figure is describing, not just its length.
   *
   * The figure used to be a bare number: "8 hari berturut-turut", with no dates and
   * no path to the grid, so the page's largest claim was the one thing on it a
   * reader could not check. `runTerpanjang` already returns the whole run, and the
   * component was throwing away everything but the length.
   *
   * With nothing chosen yet the honest headline is what the year already gives you,
   * so the base runs are the ones measured then.
   */
  const runs = sudahPilih ? trace.run : trace.runDasar
  const terpanjang = runs.reduce<(typeof runs)[number] | undefined>(
    (a, r) => (a === undefined || r.panjangHari > a.panjangHari ? r : a),
    undefined,
  )
  const angka = sudahPilih ? trace.runTerpanjangHari : (terpanjang?.panjangHari ?? 0)

  return (
    <section className="kartu p-ruang-lg sm:p-ruang-xl" aria-labelledby="judul-hasil">
      {/* Not a step. This panel was labelled "Langkah 2", which made the page
          promise three steps and then deliver a result where the second one
          should have been. It is what the steps produce, so it says so. */}
      {/* One element, not two. This was a visible span and an sr-only h2 carrying
          the same words, so the panel announced its own name twice. */}
      <h2 id="judul-hasil" className="label-bagian">
        {t('hasilJudul', locale)}
      </h2>

      <p className="mt-1 max-w-prosa text-lg leading-snug text-inkSedang">
        {sudahPilih ? t('hasilKalimat', locale) : t('hasilTanpaCuti', locale)}
      </p>

      <p className="mt-ruang-sm flex flex-wrap items-baseline gap-x-ruang-md">
        <span className="angka-utama text-liburMerahTeks">{angka}</span>
        <span className="text-lg text-inkSedang">
          {t('ringkasHari', locale)} {locale === 'id' ? 'berturut-turut' : 'in a row'}
        </span>
      </p>

      {/* Which days. A figure a reader can go and look at on the grid is a figure
          they can check; a bare number is one they have to trust. */}
      {terpanjang !== undefined && angka > 0 && (
        <p className="mt-ruang-sm text-base text-inkSedang">
          {t('hasilRentang', locale)}{' '}
          <span className="angka font-semibold text-ink">
            {tanggalPanjang(terpanjang.mulai, locale)}
          </span>{' '}
          {t('hasilSampai', locale)}{' '}
          <span className="angka font-semibold text-ink">
            {tanggalPanjang(terpanjang.selesai, locale)}
          </span>
        </p>
      )}

      <dl className="mt-ruang-lg flex flex-wrap gap-x-ruang-2xl gap-y-ruang-md border-t border-garis pt-ruang-lg">
        <Fakta
          label={t('ledgerSisa', locale)}
          nilai={trace.ledger.sisaHari}
          satuan={t('ringkasHari', locale)}
          warna="text-cutiPribadiTeks"
        />
        {trace.ledger.entitlement.dipotongCutiBersamaHari > 0 && (
          <Fakta
            label={t('ledgerDipotong', locale)}
            nilai={-trace.ledger.entitlement.dipotongCutiBersamaHari}
            satuan={t('ringkasHari', locale)}
            warna="text-cutiBersamaTeks"
          />
        )}
        {sudahPilih && (
          <Fakta
            label={t('hasilSudahPilih', locale)}
            nilai={trace.dipilihSendiri.length}
            satuan={t('ringkasHari', locale)}
            warna="text-ink"
          />
        )}
      </dl>

      {!sudahPilih && <p className="teks-catatan mt-ruang-md text-base">{t('hasilBelumPilih', locale)}</p>}

      {/* WCAG 4.1.3. Toggling a day, applying a plan, or changing status or work
          pattern recomputes everything on the page and said nothing: the cell's own
          `aria-pressed` flipped, so a reader heard "pressed" but never heard that
          their longest stretch went from 4 days to 9.

          Polite, not assertive — the reader caused this and is not to be
          interrupted. One region, carrying the two figures that actually moved,
          rather than a region per panel all talking at once. */}
      <p aria-live="polite" className="sr-only">
        {t('hasilDiumumkan', locale)
          .replace('%r', String(angka))
          .replace('%s', String(trace.ledger.sisaHari))}
      </p>
    </section>
  )
}

function Fakta({
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
      <dt className="label-bagian">{label}</dt>
      <dd className={`angka-sebaris mt-0.5 ${warna}`}>
        {nilai} <span className="font-prose text-xs font-normal text-inkPudar">{satuan}</span>
      </dd>
    </div>
  )
}
