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
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
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

        <nav className="flex items-baseline gap-4 text-sm">
          {tautan.map(([kunci, label]) => (
            <Link
              key={kunci}
              href={`/${locale}/${kunci}/`}
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
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={`/${l}/${halaman}/`}
              className={l === locale ? 'font-semibold uppercase text-ink' : 'uppercase text-inkPudar hover:text-ink'}
            >
              {l}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
