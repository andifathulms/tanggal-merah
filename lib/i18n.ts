import { civilOf, type DayNumber, type Month } from '@/lib/day'
import type { HariLibur } from '@/lib/rules/schema'

/**
 * Indonesian first, English secondary (PRD, header table).
 *
 * Copy uses the terms people actually use — tanggal merah, libur nasional,
 * cuti bersama, cuti tahunan, harpitnas. Identifiers keep the Indonesian
 * vocabulary too; English approximations are not substituted.
 */

export type Locale = 'id' | 'en'
export const LOCALES: readonly Locale[] = ['id', 'en']
export const LOCALE_DEFAULT: Locale = 'id'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

const BULAN_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** Week starts on Sunday, as on an Indonesian wall calendar. */
const HARI_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const
const HARI_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function namaBulan(month: Month, locale: Locale): string {
  return (locale === 'id' ? BULAN_ID : BULAN_EN)[month - 1]!
}

export function namaHariPendek(weekday: number, locale: Locale): string {
  return (locale === 'id' ? HARI_ID : HARI_EN)[weekday]!
}

/** e.g. "17 Agustus 2026" / "17 August 2026". */
export function tanggalPanjang(hari: DayNumber, locale: Locale): string {
  const { year, month, day } = civilOf(hari)
  return `${day} ${namaBulan(month, locale)} ${year}`
}

export function namaLibur(entri: HariLibur, locale: Locale): string {
  return locale === 'id' ? entri.nama : entri.namaEn
}

type Kamus = {
  readonly [K in string]: readonly [id: string, en: string]
}

const KAMUS = {
  judul: ['Tanggal Merah', 'Tanggal Merah'],
  subjudul: [
    'Libur nasional dan cuti bersama, dan di mana cuti tahunan Anda paling berguna.',
    'Indonesian public holidays and joint leave, and where your annual leave buys the most.',
  ],
  navTahun: ['Tahun', 'Year'],
  navRencana: ['Rencana', 'Plan'],
  navAturan: ['Aturan', 'Rules'],

  statusJudul: ['Status kepegawaian', 'Employment status'],
  statusAsn: ['ASN / PNS', 'Civil servant (ASN)'],
  statusSwastaTanpa: ['Swasta — perusahaan tidak ikut cuti bersama', 'Private — company does not take cuti bersama'],
  statusSwastaTanpaPotong: [
    'Swasta — ikut cuti bersama, cuti tahunan tidak dipotong',
    'Private — takes cuti bersama, annual leave not deducted',
  ],
  statusSwastaDipotong: [
    'Swasta — ikut cuti bersama dan cuti tahunan dipotong',
    'Private — takes cuti bersama and deducts annual leave',
  ],
  statusTanya: [
    'Aplikasi ini tidak tahu kebijakan perusahaan Anda, jadi ia bertanya.',
    'This app does not know your company policy, so it asks.',
  ],

  polaJudul: ['Pola kerja', 'Working week'],
  polaLima: ['Lima hari (Sabtu libur)', 'Five days (Saturday off)'],
  polaEnam: ['Enam hari (Sabtu masuk)', 'Six days (Saturday worked)'],

  jatahJudul: ['Jatah cuti tahunan', 'Annual leave entitlement'],
  jatahSatuan: ['hari', 'days'],
  tidakDiberikanJudul: ['Cuti bersama yang tidak bisa diambil', 'Cuti bersama you could not take'],
  tidakDiberikanBantu: [
    'ASN yang karena jabatannya tidak dapat mengambil cuti bersama mendapat tambahan hak cuti sebanyak itu.',
    'An ASN who cannot take cuti bersama because of their post has their entitlement increased by that many days.',
  ],

  ledgerJudul: ['Neraca cuti', 'Leave ledger'],
  ledgerJatah: ['Jatah cuti tahunan', 'Annual entitlement'],
  ledgerDipotong: ['Dipotong cuti bersama', 'Deducted by cuti bersama'],
  ledgerDitambah: ['Ditambah', 'Added back'],
  ledgerDipakai: ['Dipakai untuk jembatan', 'Spent on bridges'],
  ledgerSisa: ['Sisa', 'Remaining'],
  ledgerDasar: ['Dasar', 'Basis'],
  ledgerInstrumen: ['Instrumen', 'Instrument'],

  sheetJudul: ['Setahun penuh', 'The year'],
  legendaLibur: ['Libur nasional', 'Public holiday'],
  legendaCutiBersama: ['Cuti bersama', 'Joint leave'],
  legendaCutiPribadi: ['Cuti Anda', 'Your leave'],
  legendaAkhirPekan: ['Akhir pekan', 'Weekend'],
  legendaRun: ['Rentetan libur', 'Consecutive stretch'],

  saranJudul: ['Jembatan dengan leverage tertinggi', 'Highest-leverage bridges'],
  saranKosong: [
    'Tidak ada jembatan yang muat dalam sisa cuti Anda.',
    'No bridge fits inside your remaining leave.',
  ],
  saranHariCuti: ['hari cuti', 'leave days'],
  saranJadi: ['jadi', 'gives'],
  saranHariLibur: ['hari libur berturut-turut', 'consecutive days off'],
  saranLeverage: ['Leverage', 'Leverage'],
  saranAmbil: ['Ambil', 'Take'],
  saranBatal: ['Batalkan', 'Undo'],

  optimalJudul: ['Pilihan optimal untuk sisa cuti Anda', 'The optimum for your remaining leave'],
  optimalTerapkan: ['Terapkan semuanya', 'Apply all'],
  optimalKosong: ['Tidak ada yang bisa dibeli dengan sisa cuti Anda.', 'Nothing your remaining leave can buy.'],
  optimalEksak: [
    'Dihitung eksak, bukan perkiraan — hasilnya dicocokkan dengan pencarian menyeluruh.',
    'Computed exactly, not approximated — checked against an exhaustive search.',
  ],

  ringkasTerpanjang: ['Rentetan terpanjang', 'Longest stretch'],
  ringkasTotalLibur: ['Total hari libur', 'Total days off'],
  ringkasHari: ['hari', 'days'],

  eksporJudul: ['Ekspor', 'Export'],
  eksporIcs: ['Unduh .ics', 'Download .ics'],
  eksporPng: ['Unduh PNG', 'Download PNG'],
  eksporSalinTautan: ['Salin tautan', 'Copy link'],
  eksporTersalin: ['Tersalin', 'Copied'],

  aturanJudul: ['Aturan dan sitasi', 'Rules and citations'],
  aturanSumber: ['Sumber', 'Sources'],
  aturanKontradiksi: ['Catatan kontradiksi', 'Contradiction ledger'],
  aturanBacaan: ['Bacaan', 'Readings'],
  aturanDipakai: ['Dipakai', 'Used'],
  aturanAlasan: ['Alasan', 'Reasoning'],
  aturanJenisInstrumen: ['instrumen', 'instrument'],
  aturanJenisPemberitaan: ['pemberitaan', 'reporting'],

  bannerDraf: [
    'Data SKB tahun ini masih transkripsi draf: tanggalnya belum dicocokkan baris demi baris dengan dokumen SKB yang diterbitkan, dan nomor SKB-nya belum diisi. Jangan dipakai untuk keputusan. Lihat UPDATING.md.',
    'This year’s SKB data is a draft transcription: the dates have not been checked line by line against the published document and the decree numbers are not filled in. Do not rely on it. See UPDATING.md.',
  ],
  penafian: [
    'Proyek pribadi, bukan nasihat hukum ketenagakerjaan. Di sektor swasta, kebijakan perusahaan yang menentukan pelaksanaan cuti bersama — pastikan ke HR Anda. Setiap tanggal di sini menyebut SKB asalnya.',
    'A personal project, not employment-law advice. In the private sector, company policy governs how cuti bersama is applied — confirm with your HR. Every date here names the SKB it came from.',
  ],
  tidakMenghitung: [
    'Aplikasi ini tidak pernah menghitung tanggal hari raya. Tanggal libur ditetapkan pemerintah lewat SKB, dan penetapan 1 Ramadan, Idulfitri, serta Iduladha dilakukan terpisah oleh Kementerian Agama.',
    'This app never computes a religious date. Holidays are decreed by SKB, and 1 Ramadan, Idulfitri, and Iduladha are determined separately by the Ministry of Religious Affairs.',
  ],
  tahunLain: ['Tahun lain', 'Other years'],
} satisfies Kamus

export type KunciTeks = keyof typeof KAMUS

export function t(kunci: KunciTeks, locale: Locale): string {
  return KAMUS[kunci][locale === 'id' ? 0 : 1]
}
