import type { Metadata } from 'next'
import { metadataHalaman } from '@/lib/metadata'
import { Nav } from '@/components/Nav'
import { Perencana } from '@/components/Perencana'
import { isLocale, LOCALES, LOCALE_DEFAULT, type Locale } from '@/lib/i18n'

/**
 * Title and description come from the headings and paragraphs this page renders, via
 * `lib/metadata`. Six routes previously shared one hand-written Indonesian title.
 */
export function generateMetadata({ params }: { readonly params: { readonly locale: string } }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : LOCALE_DEFAULT
  return metadataHalaman(locale, 'tahun')
}

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
