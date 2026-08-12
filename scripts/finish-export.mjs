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
 */
import { existsSync, writeFileSync } from 'node:fs'
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
