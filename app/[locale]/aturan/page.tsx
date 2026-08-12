import { Nav } from '@/components/Nav'
import { CatatanTidakMenghitung, Penafian } from '@/components/Banner'
import { packTahun, semuaKontradiksi, tahunTersedia } from '@/lib/rules/loader'
import { isLocale, LOCALES, LOCALE_DEFAULT, namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'
import { fromIsoDate } from '@/lib/day'

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * The ledger page: every rule, the instrument it comes from, and where the
 * sources disagree (PRD §5.5, §12).
 *
 * Static — it renders the packs as bundled, so a reader can check every date
 * against the decree it claims to come from.
 */
export default function AturanPage({ params }: { readonly params: { readonly locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : LOCALE_DEFAULT
  const tahun = tahunTersedia()
  const kontradiksi = semuaKontradiksi()

  return (
    <>
      <Nav locale={locale} halaman="aturan" />

      <div className="max-w-3xl space-y-8">
        <section>
          <h2 className="poster text-2xl leading-none">{t('aturanJudul', locale)}</h2>
          <div className="mt-2">
            <CatatanTidakMenghitung locale={locale} />
          </div>
        </section>

        {tahun.map((y) => {
          const pack = packTahun(y)
          if (pack === undefined) return null
          return (
            <section key={y}>
              <h3 className="poster text-xl leading-none">
                {y}
                {pack.status === 'perluVerifikasi' && (
                  <span className="ml-2 align-middle text-xs uppercase tracking-wide text-cutiBersama">
                    {locale === 'id' ? 'belum diverifikasi' : 'not verified'}
                  </span>
                )}
              </h3>

              {pack.catatan !== undefined && (
                <p className="mt-2 border-l-2 border-cutiBersama pl-3 text-xs leading-relaxed text-ink/70">
                  {pack.catatan}
                </p>
              )}

              <table className="mt-3 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/25 text-left text-xs uppercase tracking-wide text-ink/55">
                    <th className="py-1 pr-3 font-semibold">{locale === 'id' ? 'Tanggal' : 'Date'}</th>
                    <th className="py-1 pr-3 font-semibold">{locale === 'id' ? 'Nama' : 'Name'}</th>
                    <th className="py-1 pr-3 font-semibold">{locale === 'id' ? 'Jenis' : 'Type'}</th>
                    <th className="py-1 font-semibold">{t('ledgerInstrumen', locale)}</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.hari.map((h) => (
                    <tr key={`${h.tanggal}-${h.jenis}`} className="border-b border-dotted border-ink/15 align-top">
                      <td className="angka py-1 pr-3 text-xs whitespace-nowrap">
                        {tanggalPanjang(fromIsoDate(h.tanggal), locale)}
                      </td>
                      <td className="py-1 pr-3">
                        {namaLibur(h, locale)}
                        {h.catatan !== undefined && (
                          <span className="mt-0.5 block text-[11px] leading-snug text-ink/55">{h.catatan}</span>
                        )}
                      </td>
                      <td className="py-1 pr-3 text-xs whitespace-nowrap">
                        <span className={h.jenis === 'liburNasional' ? 'text-liburMerah' : 'text-cutiBersama'}>
                          {h.jenis === 'liburNasional' ? t('legendaLibur', locale) : t('legendaCutiBersama', locale)}
                        </span>
                      </td>
                      <td className="py-1 text-[11px] leading-snug text-ink/60">
                        {h.sitasi.instrumen}
                        <span className="block">{h.sitasi.nomor}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )
        })}

        <section>
          <h2 className="poster text-2xl leading-none">{t('aturanKontradiksi', locale)}</h2>
          <div className="mt-4 space-y-6">
            {kontradiksi.map((k) => (
              <article key={k.id} className="border border-ink/20 p-4">
                <h3 className="font-semibold">{k.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{k.pertanyaan}</p>

                <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t('aturanBacaan', locale)}
                </h4>
                <ul className="mt-2 space-y-3">
                  {k.bacaan.map((b) => (
                    <li
                      key={b.id}
                      className={`border-l-2 pl-3 text-sm ${
                        b.id === k.dipakai ? 'border-cutiPribadi' : 'border-ink/20'
                      }`}
                    >
                      <p className="leading-relaxed">{b.klaim}</p>
                      <p className="mt-1 text-xs text-ink/55">
                        {b.sumber} ·{' '}
                        <span className={b.jenisSumber === 'instrumen' ? 'text-ink/70' : 'text-cutiBersama'}>
                          {b.jenisSumber === 'instrumen'
                            ? t('aturanJenisInstrumen', locale)
                            : t('aturanJenisPemberitaan', locale)}
                        </span>
                        {b.id === k.dipakai && (
                          <span className="ml-2 font-semibold text-cutiPribadi">— {t('aturanDipakai', locale)}</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t('aturanAlasan', locale)}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">{k.alasan}</p>
              </article>
            ))}
          </div>
        </section>

        <Penafian locale={locale} />
      </div>
    </>
  )
}
