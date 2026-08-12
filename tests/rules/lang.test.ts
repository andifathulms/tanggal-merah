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
