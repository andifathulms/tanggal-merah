'use client'

import { t, type Locale } from '@/lib/i18n'
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
  const dasar = trace.runDasar.reduce((n, r) => (r.panjangHari > n ? r.panjangHari : n), 0)
  const sekarang = trace.runTerpanjangHari
  const sudahPilih = trace.dipilihSendiri.length > 0

  // With nothing chosen yet, the honest headline is what the year already
  // gives you — the potential belongs beside it, not in place of it.
  const angka = sudahPilih ? sekarang : dasar

  return (
    <section className="kartu p-5 sm:p-6" aria-labelledby="judul-hasil">
      <span className="label-bagian">{t('langkahDua', locale)}</span>
      <h2 id="judul-hasil" className="sr-only">
        {t('hasilJudul', locale)}
      </h2>

      <p className="mt-1 max-w-prosa text-[15px] leading-snug text-inkSedang">
        {sudahPilih ? t('hasilKalimat', locale) : t('hasilTanpaCuti', locale)}
      </p>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
        <span className="angka text-6xl leading-none text-liburMerahTeks sm:text-7xl">{angka}</span>
        <span className="text-lg text-inkSedang">
          {t('ringkasHari', locale)} {locale === 'id' ? 'berturut-turut' : 'in a row'}
        </span>
      </p>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-garis pt-4">
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

      {!sudahPilih && <p className="mt-3 text-[13px] text-inkPudar">{t('hasilBelumPilih', locale)}</p>}
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
      <dd className={`angka mt-0.5 text-2xl leading-none ${warna}`}>
        {nilai} <span className="font-prose text-[11px] font-normal text-inkPudar">{satuan}</span>
      </dd>
    </div>
  )
}
