import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/lib/i18n'

/**
 * Every page must declare the language it is actually written in.
 *
 * Only a root layout may render <html>, and a root layout never receives the
 * `[locale]` param, so `app/layout.tsx` can only hard-code one language. Every
 * English page therefore shipped `lang="id"` and was read aloud with Indonesian
 * pronunciation rules — WCAG 3.1.1, an outright failure. `scripts/finish-export.mjs`
 * corrects it at export time, and this asserts it stayed corrected.
 *
 * Skipped when `out/` is absent so `pnpm test:run` still works before a build;
 * the build itself runs the export step, so CI always exercises it.
 */
const OUT = join(process.cwd(), 'out')

function halaman(dir: string): readonly string[] {
  const out: string[] = []
  for (const entri of readdirSync(dir)) {
    const penuh = join(dir, entri)
    if (statSync(penuh).isDirectory()) out.push(...halaman(penuh))
    else if (entri === 'index.html') out.push(penuh)
  }
  return out
}

describe.skipIf(!existsSync(OUT))('exported document language', () => {
  it('declares each locale on its own pages', () => {
    for (const locale of LOCALES) {
      const dir = join(OUT, locale)
      expect(existsSync(dir), `out/${locale} tidak ada`).toBe(true)

      const berkas = halaman(dir)
      expect(berkas.length).toBeGreaterThan(0)

      for (const b of berkas) {
        const isi = readFileSync(b, 'utf8')
        expect(isi, b).toContain(`<html lang="${locale}"`)
      }
    }
  })

  it('tags the content subtree with the same language', () => {
    for (const locale of LOCALES) {
      for (const b of halaman(join(OUT, locale))) {
        expect(readFileSync(b, 'utf8'), b).toContain(`lang="${locale}"`)
      }
    }
  })
})

describe.skipIf(!existsSync(OUT))('crawlability', () => {
  it('makes the root a redirect anything can follow', () => {
    const isi = readFileSync(join(OUT, 'index.html'), 'utf8')
    // Next's `redirect()` under `output: 'export'` emits a JS-only hop inside its error
    // shell, so the entry point served `<html id="__next_error__">` with no content.
    expect(isi).not.toContain('__next_error__')
    expect(isi).toMatch(/<meta http-equiv="refresh" content="0; url=[^"]*\/id\/tahun\/">/)
    expect(isi).toContain('rel="canonical"')
    // A visible link for anyone the refresh fails.
    expect(isi).toMatch(/<a href="[^"]*\/id\/tahun\/">/)
  })

  it('ships a sitemap listing every locale route, and a robots pointing at it', () => {
    const peta = readFileSync(join(OUT, 'sitemap.xml'), 'utf8')
    for (const locale of LOCALES) {
      for (const halaman of ['tahun', 'rencana', 'aturan']) {
        expect(peta, `${locale}/${halaman}`).toContain(`/${locale}/${halaman}/`)
      }
    }
    expect(readFileSync(join(OUT, 'robots.txt'), 'utf8')).toContain('sitemap.xml')
  })
})
