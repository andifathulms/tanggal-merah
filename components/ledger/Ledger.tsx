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
  const { cutiBersamaHari, cutiBersamaDiAkhirPekanHari } = trace.hilang
  const dipotong = entitlement.dipotongCutiBersamaHari > 0

  const baris: readonly (readonly [string, number, string])[] = [
    [t('ledgerJatah', locale), entitlement.jatahHari, 'text-ink'],
    [t('ledgerDipotong', locale), -entitlement.dipotongCutiBersamaHari, 'text-cutiBersamaTeks'],
    [t('ledgerDitambah', locale), entitlement.ditambahHari, 'text-ink'],
    [t('ledgerDipakai', locale), -terpakaiHari, 'text-cutiPribadiTeks'],
  ]

  return (
    <section className="p-ruang-lg" aria-labelledby="judul-neraca">
      {/* The heading names the region; the aria-label that used to sit on the
          section said the same words again. */}
      <h2 id="judul-neraca" className="poster text-xl">
        {t('ledgerJudul', locale)}
      </h2>

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

      {/* The chain, assembled. These four facts were spread across this panel, the
          status cards, the weekend panel and the grid, with nothing joining them —
          so a reader could see every step and still not see the derivation. The
          middle step is the one that needs its principle said out loud, and it never
          was. */}
      {cutiBersamaHari > 0 && (
        <div className="mt-ruang-lg border-t border-garis pt-ruang-md">
          <h3 className="label-bagian">{t('rantaiJudul', locale)}</h3>
          <ol className="mt-ruang-sm space-y-ruang-sm text-sm leading-relaxed text-inkSedang">
            <li>
              <span className="angka font-semibold text-ink">{cutiBersamaHari}</span>{' '}
              {t('rantaiTotal', locale)}
            </li>
            {/* The rule is stated whether or not it bites this year. If the step
                only appeared when the count was non-zero, a reader in a year like
                2026 would never learn that the rule exists. */}
            <li className="text-inkPudar">
              {cutiBersamaDiAkhirPekanHari > 0 ? (
                <>
                  <span className="angka font-semibold">−{cutiBersamaDiAkhirPekanHari}</span>{' '}
                  {t('rantaiAkhirPekan', locale)}
                </>
              ) : (
                t('rantaiTidakAdaAkhirPekan', locale)
              )}
            </li>
            <li>
              <span className="angka font-semibold text-cutiBersamaTeks">{cutiBersamaHariKerjaHari}</span>{' '}
              {t('rantaiHariKerja', locale)}
            </li>
            <li className={dipotong ? 'text-cutiBersamaTeks' : 'text-cutiPribadiTeks'}>
              {dipotong ? (
                <>
                  {t('rantaiDipotong', locale)}{' '}
                  <span className="angka font-semibold">−{entitlement.dipotongCutiBersamaHari}</span>
                </>
              ) : (
                t('rantaiTidakDipotong', locale)
              )}
            </li>
          </ol>
          {dipotong && <p className="mt-ruang-sm text-sm text-inkPudar">{t('rantaiLihat', locale)}</p>}
        </div>
      )}

      <div className="mt-ruang-lg border-t border-garis pt-ruang-md text-sm leading-relaxed text-inkSedang">
        <p>
          <span className="font-semibold">{t('ledgerDasar', locale)}. </span>
          {entitlement.dasar}
        </p>
        <p className="mt-ruang-sm text-inkPudar">
          <span className="font-semibold">{t('ledgerInstrumen', locale)}: </span>
          {entitlement.instrumen}
        </p>
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
