import { t, type Locale } from '@/lib/i18n'
import { MakerSignature } from './MakerSignature'

/**
 * The site's standing notices, in one place on every page.
 *
 * These two paragraphs used to be rendered per-page — in the planner's
 * settings rail and again at the foot of Aturan — which meant the site's legal
 * framing depended on which page you landed on. They belong to the site, so
 * they live in the layout.
 *
 * Two blocks, one seam: the data and legal notice on the left, the maker's
 * credit opposite it on the right. They are kept apart because they are
 * different kinds of statement — what this app is not, and who made it — and a
 * reader must never take the credit for part of the disclaimer. One divider
 * across the top is the only rule the footer draws.
 */
export function SiteFooter({ locale }: { readonly locale: Locale }) {
  return (
    <footer className="mt-ruang-4xl border-t border-garis pt-ruang-lg">
      <div className="flex flex-col gap-ruang-lg lg:flex-row lg:items-start lg:justify-between lg:gap-ruang-3xl">
        <div className="max-w-prosa space-y-ruang-sm">
          <p className="text-sm leading-relaxed text-inkPudar">{t('tidakMenghitung', locale)}</p>
          <p className="text-sm leading-relaxed text-inkPudar">{t('penafian', locale)}</p>
        </div>

        <MakerSignature />
      </div>
    </footer>
  )
}
