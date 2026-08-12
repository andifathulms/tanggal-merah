import { SiteFooter } from '@/components/SiteFooter'
import { isLocale, LOCALES, LOCALE_DEFAULT, type Locale } from '@/lib/i18n'

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: { readonly locale: string }
}) {
  const locale = isLocale(params.locale) ? params.locale : LOCALE_DEFAULT

  return (
    // Column layout so the footer sits at the bottom of the viewport on short
    // pages rather than floating halfway up.
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-ruang-lg py-ruang-xl">
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  )
}
