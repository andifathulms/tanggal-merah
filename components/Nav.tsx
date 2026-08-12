import Link from 'next/link'
import { LOCALES, t, type Locale } from '@/lib/i18n'
import { Mark } from './Mark'

export type NavProps = {
  readonly locale: Locale
  readonly halaman: 'tahun' | 'rencana' | 'aturan'
}

export function Nav({ locale, halaman }: NavProps) {
  const tautan: readonly (readonly ['tahun' | 'rencana' | 'aturan', string])[] = [
    ['tahun', t('navTahun', locale)],
    ['rencana', t('navRencana', locale)],
    ['aturan', t('navAturan', locale)],
  ]

  return (
    <header className="mb-ruang-xl border-b-2 border-liburMerah pb-ruang-md">
      <div className="flex flex-wrap items-baseline justify-between gap-x-ruang-xl gap-y-ruang-sm">
        {/* A wordmark, not a headline. It used to be set at the same size and
            nearly the same red as the hero heading directly beneath it, so two
            48px red lines competed and neither won — the page had no entry
            point. The masthead identifies; the hero states the purpose. */}
        <div className="flex items-center gap-ruang-md">
          {/* The mark carries the same three colours the sheet uses, so it
              reads as a key before the legend is even reached. */}
          <Mark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <div>
            <h1 className="poster text-xl text-liburMerah sm:text-2xl">{t('judul', locale)}</h1>
            <p className="mt-0.5 max-w-prosa text-sm text-inkSedang">{t('subjudul', locale)}</p>
          </div>
        </div>

        <nav className="flex items-baseline gap-ruang-lg text-sm">
          {tautan.map(([kunci, label]) => (
            <Link
              key={kunci}
              href={`/${locale}/${kunci}/`}
              aria-current={halaman === kunci ? 'page' : undefined}
              className={
                halaman === kunci
                  ? 'border-b-2 border-liburMerah font-semibold text-ink'
                  : 'text-inkPudar hover:text-ink'
              }
            >
              {label}
            </Link>
          ))}
          <span className="text-inkSamar" aria-hidden>
            |
          </span>
          {/* "id" and "en" alone do not say what the link does (WCAG 2.4.4), and
              a two-letter code in the other language is untagged foreign text
              (3.1.2). `lang` and `hreflang` fix the second; the visible code keeps
              its place and the accessible name carries the whole phrase.

              Padding brings each to the 24×24 minimum for 2.5.8 — the codes were
              about 20×21 and relying on the spacing exception. */}
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={`/${l}/${halaman}/`}
              lang={l}
              hrefLang={l}
              aria-current={l === locale ? 'true' : undefined}
              aria-label={t(l === 'id' ? 'bahasaId' : 'bahasaEn', locale)}
              className={`px-ruang-xs py-ruang-xs uppercase ${
                l === locale ? 'font-semibold text-ink' : 'text-inkPudar hover:text-ink'
              }`}
            >
              {l}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
