/**
 * Static export only — GitHub Pages, no server, no runtime network.
 * basePath must match the repository name (PRD §11).
 * Set BASE_PATH="" locally to preview at the root.
 */
const basePath = process.env.BASE_PATH ?? '/tanggal-merah'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

module.exports = nextConfig
