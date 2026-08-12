import { Nav } from '@/components/Nav'
import { CatatanTidakMenghitung } from '@/components/Banner'
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

      <div className="max-w-4xl space-y-10">
        <section>
          <h2 className="poster text-4xl text-liburMerahTeks">{t('aturanJudul', locale)}</h2>
          <div className="mt-2">
            <CatatanTidakMenghitung locale={locale} />
          </div>
        </section>

        {tahun.map((y) => {
          const pack = packTahun(y)
          if (pack === undefined) return null
          return (
            <section key={y}>
              <h3 className="poster text-2xl">
                {y}
                {pack.status === 'perluVerifikasi' && (
                  <span className="ml-2 align-middle text-xs uppercase tracking-wide text-cutiBersamaTeks">
                    {locale === 'id' ? 'belum diverifikasi' : 'not verified'}
                  </span>
                )}
              </h3>

              {pack.catatan !== undefined && (
                <p className="mt-2 border-l-4 border-cutiBersama bg-cutiBersamaLembut/50 py-2 pl-3 text-xs leading-relaxed text-inkSedang">
                  {pack.catatan}
                </p>
              )}

              <table className="mt-3 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-garisTebal text-left">
                    <th className="label-bagian py-2 pr-3">{locale === 'id' ? 'Tanggal' : 'Date'}</th>
                    <th className="label-bagian py-2 pr-3">{locale === 'id' ? 'Nama' : 'Name'}</th>
                    <th className="label-bagian py-2 pr-3">{locale === 'id' ? 'Jenis' : 'Type'}</th>
                    <th className="label-bagian py-2">{t('ledgerInstrumen', locale)}</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.hari.map((h) => (
                    <tr key={`${h.tanggal}-${h.jenis}`} className="border-b border-dotted border-garis align-top">
                      <td className="angka py-2 pr-3 text-xs whitespace-nowrap text-inkSedang">
                        {tanggalPanjang(fromIsoDate(h.tanggal), locale)}
                      </td>
                      <td className="py-2 pr-3">
                        {namaLibur(h, locale)}
                        {h.catatan !== undefined && (
                          <span className="mt-0.5 block text-sm leading-snug text-inkPudar">{h.catatan}</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">
                        <span className={h.jenis === 'liburNasional' ? 'text-liburMerahTeks' : 'text-cutiBersamaTeks'}>
                          {h.jenis === 'liburNasional' ? t('legendaLibur', locale) : t('legendaCutiBersama', locale)}
                        </span>
                      </td>
                      <td className="py-2 text-sm leading-snug text-inkPudar">
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
          <h2 className="poster text-4xl">{t('aturanKontradiksi', locale)}</h2>
          <div className="mt-4 space-y-6">
            {kontradiksi.map((k) => (
              <article key={k.id} className="kartu p-5">
                <h3 className="text-lg font-semibold leading-snug">{k.judul}</h3>
                <p className="mt-2 max-w-prosa text-sm leading-relaxed text-inkSedang">{k.pertanyaan}</p>

                <h4 className="label-bagian mt-5">
                  {t('aturanBacaan', locale)}
                </h4>
                <ul className="mt-2 space-y-3">
                  {k.bacaan.map((b) => (
                    <li
                      key={b.id}
                      className={`border-l-2 pl-3 text-sm ${
                        b.id === k.dipakai ? 'border-cutiPribadi bg-cutiPribadiLembut/40 py-1' : 'border-garis'
                      }`}
                    >
                      <p className="leading-relaxed">{b.klaim}</p>
                      <p className="mt-1 text-xs text-inkPudar">
                        {b.sumber} ·{' '}
                        <span className={b.jenisSumber === 'instrumen' ? 'font-semibold text-inkSedang' : 'font-semibold text-cutiBersamaTeks'}>
                          {b.jenisSumber === 'instrumen'
                            ? t('aturanJenisInstrumen', locale)
                            : t('aturanJenisPemberitaan', locale)}
                        </span>
                        {b.id === k.dipakai && (
                          <span className="ml-2 font-semibold text-cutiPribadiTeks">— {t('aturanDipakai', locale)}</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                <h4 className="label-bagian mt-5">
                  {t('aturanAlasan', locale)}
                </h4>
                <p className="mt-1 max-w-prosa text-sm leading-relaxed text-inkSedang">{k.alasan}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
