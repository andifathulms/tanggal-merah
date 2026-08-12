import { LOCALES, type Locale } from '@/lib/i18n'

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }))
}

export default function LocaleLayout({ children }: { readonly children: React.ReactNode }) {
  return <main className="mx-auto max-w-[1400px] px-4 py-6">{children}</main>
}
