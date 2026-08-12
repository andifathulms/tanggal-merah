/**
 * Serves ./out under the production basePath, so what you check locally is
 * what GitHub Pages will serve. Verify with this before pushing (PRD §11).
 *
 * No dependency — a static file server is thirty lines of node:http.
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const OUT = join(process.cwd(), 'out')
const BASE = process.env.BASE_PATH ?? '/tanggal-merah'
const PORT = Number(process.env.PORT ?? 4321)

const TIPE = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

if (!existsSync(OUT)) {
  console.error('out/ tidak ada — jalankan `pnpm build` lebih dulu')
  process.exit(1)
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let path = decodeURIComponent(url.pathname)

  if (BASE.length > 0) {
    if (path === BASE) path = '/'
    else if (path.startsWith(`${BASE}/`)) path = path.slice(BASE.length)
    else {
      res.writeHead(302, { Location: `${BASE}/` })
      res.end()
      return
    }
  }

  // Normalise before joining so `..` cannot escape out/.
  let berkas = join(OUT, normalize(path).replace(/^(\.\.[/\\])+/, ''))
  if (existsSync(berkas) && statSync(berkas).isDirectory()) berkas = join(berkas, 'index.html')
  if (!existsSync(berkas) && existsSync(`${berkas}.html`)) berkas = `${berkas}.html`

  if (!existsSync(berkas) || !berkas.startsWith(OUT)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404')
    return
  }

  res.writeHead(200, { 'Content-Type': TIPE[extname(berkas)] ?? 'application/octet-stream' })
  createReadStream(berkas).pipe(res)
}).listen(PORT, () => {
  console.log(`Pratinjau: http://localhost:${PORT}${BASE}/`)
})
