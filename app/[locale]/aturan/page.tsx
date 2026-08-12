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

      <div className="max-w-4xl space-y-ruang-3xl">
        <section>
          <h2 className="poster text-4xl text-liburMerahTeks">{t('aturanJudul', locale)}</h2>
          <div className="mt-ruang-sm">
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
                  <span className="ml-ruang-sm align-middle text-xs uppercase tracking-wide text-cutiBersamaTeks">
                    {locale === 'id' ? 'belum diverifikasi' : 'not verified'}
                  </span>
                )}
              </h3>

              {pack.catatan !== undefined && (
                <p className="mt-ruang-sm border-l-4 border-cutiBersama bg-cutiBersamaLembut/50 py-ruang-sm pl-ruang-md text-xs leading-relaxed text-inkSedang">
                  {pack.catatan}
                </p>
              )}

              <table className="mt-ruang-md w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-garisTebal text-left">
                    <th className="label-bagian py-ruang-sm pr-ruang-md">{locale === 'id' ? 'Tanggal' : 'Date'}</th>
                    <th className="label-bagian py-ruang-sm pr-ruang-md">{locale === 'id' ? 'Nama' : 'Name'}</th>
                    <th className="label-bagian py-ruang-sm pr-ruang-md">{locale === 'id' ? 'Jenis' : 'Type'}</th>
                    <th className="label-bagian py-ruang-sm">{t('ledgerInstrumen', locale)}</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.hari.map((h) => (
                    <tr key={`${h.tanggal}-${h.jenis}`} className="border-b border-dotted border-garis align-top">
                      <td className="angka py-ruang-sm pr-ruang-md text-xs whitespace-nowrap text-inkSedang">
                        {tanggalPanjang(fromIsoDate(h.tanggal), locale)}
                      </td>
                      <td className="py-ruang-sm pr-ruang-md">
                        {namaLibur(h, locale)}
                        {h.catatan !== undefined && (
                          <span className="mt-0.5 block text-sm leading-snug text-inkPudar">{h.catatan}</span>
                        )}
                      </td>
                      <td className="py-ruang-sm pr-ruang-md text-xs whitespace-nowrap">
                        <span className={h.jenis === 'liburNasional' ? 'text-liburMerahTeks' : 'text-cutiBersamaTeks'}>
                          {h.jenis === 'liburNasional' ? t('legendaLibur', locale) : t('legendaCutiBersama', locale)}
                        </span>
                      </td>
                      <td className="py-ruang-sm text-sm leading-snug text-inkPudar">
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
          <div className="mt-ruang-lg space-y-ruang-xl">
            {kontradiksi.map((k) => (
              <article key={k.id} className="kartu p-ruang-lg">
                <h3 className="text-lg font-semibold leading-snug">{k.judul}</h3>
                <p className="mt-ruang-sm max-w-prosa text-sm leading-relaxed text-inkSedang">{k.pertanyaan}</p>

                <h4 className="label-bagian mt-ruang-lg">
                  {t('aturanBacaan', locale)}
                </h4>
                <ul className="mt-ruang-sm space-y-ruang-md">
                  {k.bacaan.map((b) => (
                    <li
                      key={b.id}
                      className={`border-l-2 pl-ruang-md text-sm ${
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
                          <span className="ml-ruang-sm font-semibold text-cutiPribadiTeks">— {t('aturanDipakai', locale)}</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                <h4 className="label-bagian mt-ruang-lg">
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
