import type { Config } from 'tailwindcss'

/**
 * Semantic tokens only — never raw hex in components (CLAUDE.md conventions).
 * Palette fixed by PRD §8: red is the subject, not a reserved accent.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        newsprint: '#EFEDE6',
        ink: '#1C1B18',
        liburMerah: '#C62828',
        cutiBersama: '#D98324',
        cutiPribadi: '#3D7A5A',
        akhirPekan: '#E3E0D6',
        runBar: 'rgba(198, 40, 40, 0.14)',
      },
      fontFamily: {
        poster: ['var(--font-poster)', 'ui-sans-serif', 'system-ui'],
        prose: ['var(--font-prose)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [],
}

export default config
