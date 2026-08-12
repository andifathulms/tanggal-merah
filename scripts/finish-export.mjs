/**
 * Post-export step for GitHub Pages.
 *
 * `.nojekyll` must exist in the output root or Pages will drop `_next/`,
 * because Jekyll ignores directories beginning with an underscore (PRD §11).
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
