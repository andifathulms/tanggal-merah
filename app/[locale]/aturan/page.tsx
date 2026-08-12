import type { Metadata } from 'next'
import { metadataHalaman } from '@/lib/metadata'
import { Nav } from '@/components/Nav'
import { CatatanTidakMenghitung } from '@/components/Banner'
import { packTahun, semuaKontradiksi, tahunTersedia } from '@/lib/rules/loader'
import { isLocale, LOCALES, LOCALE_DEFAULT, namaLibur, t, tanggalPanjang, type Locale } from '@/lib/i18n'
import { fromIsoDate } from '@/lib/day'

/**
 * Title and description come from the headings and paragraphs this page renders, via
 * `lib/metadata`. Six routes previously shared one hand-written Indonesian title.
 */
export function generateMetadata({ params }: { readonly params: { readonly locale: string } }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : LOCALE_DEFAULT
  return metadataHalaman(locale, 'aturan')
}

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
                {y}{' '}
                {pack.status === 'perluVerifikasi' && (
                  <span className="label-bagian ml-ruang-sm align-middle text-cutiBersamaTeks">
                    {locale === 'id' ? 'belum diverifikasi' : 'not verified'}
                  </span>
                )}
              </h3>

              {pack.catatan !== undefined && (
                <p className="mt-ruang-md max-w-prosa border-l-4 border-cutiBersama bg-cutiBersamaLembut px-ruang-lg py-ruang-md text-base leading-relaxed text-inkSedang">
                  {pack.catatan}
                </p>
              )}

              {/* The table scrolls inside its own container so the page body
                  never does. Four columns of dates, names and full decree titles
                  cannot reflow into 320px, and a sideways-scrolling page is a
                  WCAG 1.4.10 failure while a sideways-scrolling table is not. */}
              {/* tabIndex makes the scroll container reachable, so a keyboard
                  user can actually pan it — an overflow container that only a
                  mouse can move is a 2.1.1 failure of its own. */}
              <div
                className="mt-ruang-md overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-labelledby={`tabel-${y}`}
              >
                <table className="w-full min-w-tabel border-collapse text-sm">
                  {/* Each year gets its own table, so each needs its own name for
                      a reader navigating by table. The caption is the native way
                      to give one — the year in the <h3> above is not associated
                      with anything. `role="region"` on the scroller is the one
                      ARIA here: a focusable overflow container otherwise announces
                      as nothing, so a screen reader user lands in it with no idea
                      what they have entered. */}
                  <caption id={`tabel-${y}`} className="sr-only">
                    {t('aturanTabelJudul', locale)} {y}
                  </caption>
                  <thead>
                    <tr className="border-b-2 border-garisTebal text-left">
                      <th scope="col" className="label-bagian py-ruang-sm pr-ruang-md">
                        {t('aturanTanggal', locale)}
                      </th>
                      <th scope="col" className="label-bagian py-ruang-sm pr-ruang-md">
                        {t('aturanNama', locale)}
                      </th>
                      <th scope="col" className="label-bagian py-ruang-sm pr-ruang-md">
                        {t('aturanJenis', locale)}
                      </th>
                      <th scope="col" className="label-bagian py-ruang-sm">
                        {t('ledgerInstrumen', locale)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.hari.map((h) => (
                      <tr key={`${h.tanggal}-${h.jenis}`} className="border-b border-dotted border-garis align-top">
                        <td className="angka py-ruang-sm pr-ruang-md text-sm whitespace-nowrap text-inkSedang">
                          {tanggalPanjang(fromIsoDate(h.tanggal), locale)}
                        </td>
                        <td className="py-ruang-sm pr-ruang-md">
                          {namaLibur(h, locale)}
                          {h.catatan !== undefined && (
                            <span className="mt-0.5 block text-sm leading-snug text-inkPudar">{h.catatan}</span>
                          )}
                        </td>
                        <td className="py-ruang-sm pr-ruang-md text-sm">
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
              </div>
            </section>
          )
        })}

        <section>
          <h3 className="poster text-2xl">{t('aturanKontradiksi', locale)}</h3>
          <div className="mt-ruang-lg space-y-ruang-xl">
            {kontradiksi.map((k) => (
              <article key={k.id} className="kartu p-ruang-lg">
                <h4 className="text-lg font-semibold leading-snug">{k.judul}</h4>
                <p className="mt-ruang-sm max-w-prosa text-sm leading-relaxed text-inkSedang">{k.pertanyaan}</p>

                <h5 className="label-bagian mt-ruang-lg">{t('aturanBacaan', locale)}</h5>
                <ul className="mt-ruang-sm space-y-ruang-md">
                  {k.bacaan.map((b) => (
                    <li
                      key={b.id}
                      className={`border-l-2 pl-ruang-md text-sm ${
                        b.id === k.dipakai ? 'border-cutiPribadi bg-cutiPribadiLembut py-1' : 'border-garis'
                      }`}
                    >
                      <p className="leading-relaxed">{b.klaim}</p>
                      <p className="mt-1 text-sm text-inkPudar">
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

                <h5 className="label-bagian mt-ruang-lg">{t('aturanAlasan', locale)}</h5>
                <p className="mt-1 max-w-prosa text-base leading-relaxed text-inkSedang">{k.alasan}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
