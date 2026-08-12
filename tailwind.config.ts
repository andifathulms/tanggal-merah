import type { Config } from 'tailwindcss'

/**
 * Semantic tokens only — never raw hex in components (CLAUDE.md conventions).
 *
 * The hero palette is fixed by PRD §8 and unchanged: red is the subject, and
 * `liburMerah` is used at full strength. What is added here is a tonal ramp so
 * that surfaces, rules, and muted text stop being opacity guesses on `ink`,
 * and a text-safe variant of each accent.
 *
 * The text variants exist because the fill colours do not pass WCAG AA as
 * small text on newsprint: amber measures 2.48:1 and green 4.34:1, against a
 * 4.5:1 floor. The fills stay exactly as the PRD specifies — they are used as
 * fills — and `*Teks` carries the same hue darkened until it passes:
 *
 *   liburMerahTeks  #B71C1C  5.61:1
 *   cutiBersamaTeks #8A4E0C  5.64:1
 *   cutiPribadiTeks #2F6046  6.22:1
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces, lightest to deepest.
        kertas: '#F7F6F1',
        newsprint: '#EFEDE6',
        kertasGelap: '#E7E4DA',

        // Ink, darkest to faintest. Every one passes AA on newsprint except
        // `inkSamar`, which is reserved for decoration and never for text.
        ink: '#1C1B18',
        inkSedang: '#43413B',
        inkPudar: '#5F5C54',
        inkSamar: '#8C8880',

        // Rules and dividers.
        garis: '#D6D2C6',
        garisTebal: '#B4AF9F',

        // Libur nasional — the subject.
        liburMerah: '#C62828',
        liburMerahTeks: '#B71C1C',
        liburMerahLembut: '#F5E2E0',

        // Cuti bersama — a different thing with a different cost, so a
        // different colour. Never merged with the red.
        cutiBersama: '#D98324',
        cutiBersamaTeks: '#8A4E0C',
        cutiBersamaLembut: '#F8EBD9',

        // Days the user chooses.
        cutiPribadi: '#3D7A5A',
        cutiPribadiTeks: '#2F6046',
        cutiPribadiLembut: '#E2EDE6',

        akhirPekan: '#E3E0D6',
        runBar: 'rgba(198, 40, 40, 0.13)',
        runBarKuat: 'rgba(198, 40, 40, 0.20)',
      },
      fontFamily: {
        poster: ['var(--font-poster)', 'ui-sans-serif', 'system-ui'],
        prose: ['var(--font-prose)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // A display step for the wall-calendar register, where Bebas Neue is
        // meant to live. Line heights are set tight because it is condensed.
        'poster-sm': ['1.375rem', { lineHeight: '1' }],
        'poster-md': ['2rem', { lineHeight: '0.95' }],
        'poster-lg': ['3rem', { lineHeight: '0.92' }],
        'poster-xl': ['4.5rem', { lineHeight: '0.88' }],
      },
      maxWidth: {
        prosa: '62ch',
      },
      boxShadow: {
        kartu: '0 1px 0 0 rgba(28, 27, 24, 0.06), 0 1px 3px 0 rgba(28, 27, 24, 0.05)',
        angkat: '0 2px 0 0 rgba(28, 27, 24, 0.08), 0 4px 12px -2px rgba(28, 27, 24, 0.10)',
      },
    },
  },
  plugins: [],
}

export default config
