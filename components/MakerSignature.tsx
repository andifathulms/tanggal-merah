/**
 * The maker's mark.
 *
 * Personal credit, deliberately kept apart from the site's legal and data
 * notices in `SiteFooter` — those state what the app is not, this states who
 * built it, and merging the two would read as though the credit were part of
 * the disclaimer.
 *
 * Everything identifying lives in the two constants below, so updating a
 * handle or adding a platform is a one-line change.
 *
 * Server component: the year is evaluated once at build time, which is the
 * only clock this site reads outside the year picker. `lib/` still never reads
 * one (invariant 2).
 */

const PEMBUAT = {
  nama: 'Andi Fathul Mukminin',
  portofolio: 'https://andifathulms.github.io/en/',
} as const

type Tautan = {
  readonly nama: string
  readonly href: string
  readonly Ikon: (props: { readonly className?: string }) => JSX.Element
}

const TAUTAN: readonly Tautan[] = [
  { nama: 'Portfolio', href: PEMBUAT.portofolio, Ikon: IkonGlobe },
  { nama: 'GitHub', href: 'https://github.com/andifathulms', Ikon: IkonGitHub },
  { nama: 'LinkedIn', href: 'https://www.linkedin.com/in/andifathulmukminin/', Ikon: IkonLinkedIn },
  { nama: 'Instagram', href: 'https://www.instagram.com/andifathulms/', Ikon: IkonInstagram },
]

export function MakerSignature() {
  const tahun = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-ruang-sm lg:items-end">
      <p className="text-sm text-inkPudar">
        Designed &amp; built by{' '}
        <a
          href={PEMBUAT.portofolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inkSedang underline underline-offset-4 decoration-garisTebal transition-colors hover:text-ink hover:decoration-liburMerah"
        >
          {PEMBUAT.nama}
        </a>{' '}
        {/* Only the digits take the mono face — a tabular © just sets it adrift
            from the year it belongs to. */}
        <span aria-hidden>·</span> © <span className="angka">{tahun}</span>
      </p>

      <ul className="-mx-1.5 flex items-center gap-0.5">
        {TAUTAN.map(({ nama, href, Ikon }) => (
          <li key={nama}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={nama}
              className="block rounded-sm p-1.5 text-inkSamar transition-colors hover:bg-kertasGelap hover:text-ink"
            >
              <Ikon className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Icons are 24-unit viewBoxes drawn in currentColor, so they take the link's
   muted tone and brighten with it on hover. */

function IkonGlobe({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  )
}

function IkonGitHub({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden focusable="false">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function IkonLinkedIn({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden focusable="false">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.25h4v11.25H3V9.25Zm6.5 0h3.83v1.54h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.12v5.67h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.31-1.93 2.66v5.11h-3.85V9.25Z" />
    </svg>
  )
}

function IkonInstagram({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
