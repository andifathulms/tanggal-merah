/**
 * Post-export steps for GitHub Pages.
 *
 * 1. `.nojekyll` must exist in the output root or Pages drops `_next/`,
 *    because Jekyll ignores directories beginning with an underscore (PRD §11).
 * 2. The web manifest is written here rather than by `app/manifest.ts`.
 *    Next strips `basePath` from the manifest href it injects, so the emitted
 *    link 404s on Pages — and having Next generate the route also meant two
 *    competing `rel="manifest"` tags, one of them wrong. Writing it at export
 *    time keeps every path in it prefixed by the same `BASE_PATH` the build
 *    used, and leaves exactly one link, rendered by hand in `app/layout.tsx`.
 * 3. `<html lang>` is corrected per locale. Only a root layout may render the
 *    <html> element and a root layout never receives a nested dynamic segment's
 *    params, so `app/layout.tsx` can only hard-code one language — which meant
 *    every English page shipped `lang="id"` and was read to screen readers with
 *    Indonesian pronunciation (WCAG 3.1.1). The locale is a path segment, so it
 *    is known here with certainty. Asserted in `tests/rules/export.test.ts`.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const out = join(process.cwd(), 'out')
if (!existsSync(out)) {
  console.error('out/ tidak ada — jalankan next build lebih dulu')
  process.exit(1)
}

writeFileSync(join(out, '.nojekyll'), '')
console.log('  ✓ out/.nojekyll')

const BASE = process.env.BASE_PATH ?? '/tanggal-merah'

const manifest = {
  name: 'Tanggal Merah — libur nasional dan cuti bersama',
  short_name: 'Tanggal Merah',
  description:
    'Libur nasional dan cuti bersama Indonesia dari SKB yang disitasi, dan di mana cuti tahunan Anda menghasilkan rentetan libur terpanjang.',
  lang: 'id',
  start_url: `${BASE}/id/tahun/`,
  scope: `${BASE}/`,
  display: 'standalone',
  // Brand ink, from the asset kit — the icon sits on it, so the splash screen
  // must match or the mark shows a seam.
  background_color: '#1C1810',
  theme_color: '#1C1810',
  icons: [
    { src: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    // Android crops any icon to its own shape; the maskable variant carries the
    // safe-area padding that keeps the bracket from being cut off.
    { src: `${BASE}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

writeFileSync(join(out, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`  ✓ out/manifest.webmanifest (basePath ${BASE || '/'})`)


/**
 * Rewrite the document language for every page under a locale directory whose
 * language is not the one `app/layout.tsx` hard-codes.
 */
const LOCALE_DEFAULT = 'id'

function berkasHtml(dir) {
  const out = []
  for (const entri of readdirSync(dir)) {
    const penuh = join(dir, entri)
    if (statSync(penuh).isDirectory()) out.push(...berkasHtml(penuh))
    else if (entri.endsWith('.html')) out.push(penuh)
  }
  return out
}

let diperbaiki = 0
for (const locale of readdirSync(out)) {
  if (locale === LOCALE_DEFAULT) continue
  const dir = join(out, locale)
  if (!statSync(dir).isDirectory() || locale.startsWith('_') || locale.startsWith('.')) continue
  // Only directories that look like a locale the app actually builds.
  if (!/^[a-z]{2}$/.test(locale)) continue

  for (const berkas of berkasHtml(dir)) {
    const isi = readFileSync(berkas, 'utf8')
    const baru = isi.replace(`<html lang="${LOCALE_DEFAULT}"`, `<html lang="${locale}"`)
    if (baru !== isi) {
      writeFileSync(berkas, baru)
      diperbaiki += 1
    }
  }
}
console.log(`  ✓ <html lang> diperbaiki pada ${diperbaiki} halaman non-${LOCALE_DEFAULT}`)
