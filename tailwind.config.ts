import type { Config } from 'tailwindcss'

/**
 * Semantic tokens only — never raw hex in components (CLAUDE.md conventions).
 *
 * The values themselves live in `app/globals.css` as custom properties, with the
 * measured contrast ratio recorded beside each colour. This file is the mapping
 * from token name to utility; it deliberately holds no values of its own, so
 * there is exactly one place a colour or a type step can be changed.
 *
 * The hero palette is fixed by PRD §8 and unchanged: red is the subject, and
 * `liburMerah` is used at full strength. The `*Teks` variants exist because the
 * fill colours do not pass WCAG AA as small text on newsprint — amber measures
 * 2.48:1 and green 4.34:1, against a 4.5:1 floor. The fills stay exactly as the
 * PRD specifies, and `*Teks` carries the same hue darkened until it passes.
 */

/** Channels + `<alpha-value>` so Tailwind's `/nn` modifiers still compose. */
const warna = (nama: string) => `rgb(var(--warna-${nama}) / <alpha-value>)`

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kertas: warna('kertas'),
        newsprint: warna('newsprint'),
        kertasGelap: warna('kertasGelap'),

        ink: warna('ink'),
        inkSedang: warna('inkSedang'),
        inkPudar: warna('inkPudar'),
        inkSamar: warna('inkSamar'),

        garis: warna('garis'),
        garisTebal: warna('garisTebal'),

        liburMerah: warna('liburMerah'),
        liburMerahTeks: warna('liburMerahTeks'),
        liburMerahLembut: warna('liburMerahLembut'),

        cutiBersama: warna('cutiBersama'),
        cutiBersamaTeks: warna('cutiBersamaTeks'),
        cutiBersamaLembut: warna('cutiBersamaLembut'),

        cutiPribadi: warna('cutiPribadi'),
        cutiPribadiTeks: warna('cutiPribadiTeks'),
        cutiPribadiLembut: warna('cutiPribadiLembut'),

        akhirPekan: warna('akhirPekan'),
        runBar: 'rgb(var(--warna-liburMerah) / 0.13)',
        runBarKuat: 'rgb(var(--warna-liburMerah) / 0.20)',
      },
      fontFamily: {
        poster: ['var(--font-poster)', 'ui-sans-serif', 'system-ui'],
        prose: ['var(--font-prose)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      /**
       * One scale, replacing the eight arbitrary `text-[13px]`-style sizes the
       * components used to carry. Line heights ride along with the step: loose
       * for reading sizes, tight for the condensed poster face, which is where
       * the display steps live.
       */
      fontSize: {
        '2xs': ['var(--ukuran-2xs)', { lineHeight: '1.2' }],
        xs: ['var(--ukuran-xs)', { lineHeight: '1.35' }],
        sm: ['var(--ukuran-sm)', { lineHeight: '1.5' }],
        base: ['var(--ukuran-base)', { lineHeight: '1.6' }],
        lg: ['var(--ukuran-lg)', { lineHeight: '1.5' }],
        xl: ['var(--ukuran-xl)', { lineHeight: '1.15' }],
        '2xl': ['var(--ukuran-2xl)', { lineHeight: '1.08' }],
        '3xl': ['var(--ukuran-3xl)', { lineHeight: '1.05' }],
        '4xl': ['var(--ukuran-4xl)', { lineHeight: '1' }],
        '5xl': ['var(--ukuran-5xl)', { lineHeight: '0.95' }],
        '6xl': ['var(--ukuran-6xl)', { lineHeight: '0.92' }],
      },
      spacing: {
        'ruang-xs': 'var(--ruang-xs)',
        'ruang-sm': 'var(--ruang-sm)',
        'ruang-md': 'var(--ruang-md)',
        'ruang-lg': 'var(--ruang-lg)',
        'ruang-xl': 'var(--ruang-xl)',
        'ruang-2xl': 'var(--ruang-2xl)',
        'ruang-3xl': 'var(--ruang-3xl)',
        'ruang-4xl': 'var(--ruang-4xl)',
      },
      maxWidth: {
        prosa: '62ch',
        /** The hover panel a day cell raises, and the worked example. See globals.css. */
        'sel-panel': 'var(--sel-panel-lebar)',
        contoh: 'var(--contoh-lebar-maks)',
      },
      /** The wall-calendar grid's own geometry. See globals.css. */
      minHeight: {
        sel: 'var(--sel-tinggi)',
        kutipan: 'var(--kutipan-tinggi-min)',
      },
      minWidth: {
        tabel: 'var(--tabel-lebar-min)',
      },
      borderRadius: {
        bar: 'var(--bar-sudut)',
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
