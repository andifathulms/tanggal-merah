import { Nav } from '@/components/Nav'
import { Perencana } from '@/components/Perencana'
import { isLocale, LOCALES, LOCALE_DEFAULT, type Locale } from '@/lib/i18n'

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }))
}

export default function TahunPage({ params }: { readonly params: { readonly locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : LOCALE_DEFAULT
  return (
    <>
      <Nav locale={locale} halaman="tahun" />
      <Perencana locale={locale} tampilkan="tahun" />
    </>
  )
}
