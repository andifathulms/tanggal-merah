import Link from 'next/link'
import { LOCALES, t, type Locale } from '@/lib/i18n'

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
    <header className="mb-8 border-b-2 border-liburMerah pb-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="poster text-poster-lg text-liburMerah">{t('judul', locale)}</h1>
          <p className="mt-1 max-w-prosa text-sm text-inkSedang">{t('subjudul', locale)}</p>
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
