'use client'

import type { LeaveTrace } from '@/lib/trace'
import { t, type Locale } from '@/lib/i18n'

/**
 * Days accounted for (PRD §5.5): entitlement, cuti bersama deducted or not
 * with the reason and citation, bridges spent, remaining.
 *
 * Sits as a printed panel, the way a wall calendar carries its list of
 * holidays down one side.
 */
export function Ledger({ trace, locale }: { readonly trace: LeaveTrace; readonly locale: Locale }) {
  const { entitlement, terpakaiHari, sisaHari, cutiBersamaHariKerjaHari } = trace.ledger

  const baris: readonly (readonly [string, number, string])[] = [
    [t('ledgerJatah', locale), entitlement.jatahHari, 'text-ink'],
    [t('ledgerDipotong', locale), -entitlement.dipotongCutiBersamaHari, 'text-cutiBersamaTeks'],
    [t('ledgerDitambah', locale), entitlement.ditambahHari, 'text-ink'],
    [t('ledgerDipakai', locale), -terpakaiHari, 'text-cutiPribadiTeks'],
  ]

  return (
    <section className="p-ruang-lg" aria-label={t('ledgerJudul', locale)}>
      <h2 className="poster text-xl">{t('ledgerJudul', locale)}</h2>

      <dl className="mt-ruang-md space-y-1 text-sm">
        {baris
          .filter(([, nilai], i) => nilai !== 0 || i === 0)
          .map(([label, nilai, warna]) => (
            <div key={label} className="flex items-baseline justify-between gap-ruang-lg border-b border-dotted border-garis pb-1">
              <dt className="text-inkSedang">{label}</dt>
              <dd className={`angka text-sm ${warna}`}>
                {nilai > 0 && label !== t('ledgerJatah', locale) ? '+' : ''}
                {nilai}
              </dd>
            </div>
          ))}

        <div className="flex items-baseline justify-between gap-ruang-lg pt-1">
          <dt className="font-semibold">{t('ledgerSisa', locale)}</dt>
          <dd className="angka-sebaris font-semibold">
            {sisaHari} <span className="text-xs font-normal text-inkPudar">{t('ringkasHari', locale)}</span>
          </dd>
        </div>
      </dl>

      <div className="mt-ruang-lg border-t border-garis pt-ruang-md text-sm leading-relaxed text-inkSedang">
        <p>
          <span className="font-semibold">{t('ledgerDasar', locale)}. </span>
          {entitlement.dasar}
        </p>
        <p className="mt-ruang-sm text-inkPudar">
          <span className="font-semibold">{t('ledgerInstrumen', locale)}: </span>
          {entitlement.instrumen}
        </p>
        {cutiBersamaHariKerjaHari > 0 && (
          <p className="mt-ruang-sm text-inkPudar">
            <span className="angka">{cutiBersamaHariKerjaHari}</span>{' '}
            {locale === 'id'
              ? 'hari cuti bersama jatuh pada hari yang seharusnya Anda kerja.'
              : 'cuti bersama days fall on a day you would otherwise have worked.'}
          </p>
        )}
      </div>

      {trace.ledger.kontradiksi.length > 0 && (
        <div className="mt-ruang-lg border-t border-garis pt-ruang-md">
          <h3 className="label-bagian">
            {t('aturanKontradiksi', locale)}
          </h3>
          <ul className="mt-1 space-y-1 text-sm text-inkSedang">
            {trace.ledger.kontradiksi.map((k) => (
              <li key={k.id}>{k.judul}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
