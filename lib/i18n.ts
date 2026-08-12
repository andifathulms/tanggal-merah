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
  // A masthead tagline, not a headline — short enough to be read at a glance
  // beside the wordmark. It names the function, because the product name alone
  // does not tell a first-time visitor what the site is for.
  subjudul: [
    'Perencana libur nasional & cuti bersama',
    'Indonesian public holiday & cuti bersama planner',
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
  polaLimaRingkas: ['5 hari', '5 days'],
  polaEnamRingkas: ['6 hari', '6 days'],
  polaKeterangan: [
    'Banyak orang Indonesia masuk hari Sabtu, dan itu mengubah semua hitungan libur panjang.',
    'Many Indonesians work Saturdays, and that changes every long-weekend calculation.',
  ],

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
  legendaRun: ['Rentetan 3 hari atau lebih', 'Stretch of 3+ days'],

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
  optimalNilai: [
    'total hari libur di rentetan yang tersambung',
    'total days off across the stretches it joins',
  ],
  optimalCatatanRentetan: [
    'Angka ini menjumlahkan beberapa rentetan, bukan satu rentetan panjang.',
    'This figure adds up several stretches; it is not one long run.',
  ],
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

  // — Penjelasan untuk pembaca yang baru pertama kali membuka —
  // The heading leads with what the site does rather than with a claim about
  // the reader. The claim is still the best hook, so it opens the paragraph
  // instead of standing where the reader is looking for a purpose.
  heroJudul: [
    'Semua tanggal merah, dan di mana cuti Anda paling untung.',
    'Every Indonesian public holiday, and where your leave buys the most.',
  ],
  heroTeks: [
    'Cuti Anda mungkin tidak sebanyak yang Anda kira. Setiap tahun pemerintah menetapkan libur nasional dan cuti bersama lewat SKB, dan yang sering tidak disadari: di banyak perusahaan swasta, hari cuti bersama dipotong dari jatah cuti tahunan Anda. Halaman ini menghitung berapa sisa cuti Anda sebenarnya, lalu menunjukkan di tanggal mana cuti itu paling berguna.',
    'You may have less leave than you think. Each year the government sets public holidays and cuti bersama (joint leave) by decree, and what most people miss is that at many private companies those cuti bersama days are deducted from your annual leave. This page works out what you actually have left, then shows you which dates buy the most time off.',
  ],
  heroLangkah1: ['Pilih status Anda', 'Pick your status'],
  heroLangkah1Teks: [
    'ASN dan swasta punya aturan berbeda, dan itulah yang paling mengubah hitungannya.',
    'Civil servants and private employees fall under different rules, and that changes the arithmetic most.',
  ],
  heroLangkah2: ['Lihat sisa cuti Anda', 'See what is left'],
  heroLangkah2Teks: [
    'Kami hitung berapa hari yang benar-benar tersisa setelah cuti bersama.',
    'We work out how many days genuinely remain after cuti bersama.',
  ],
  heroLangkah3: ['Ambil yang paling untung', 'Spend it where it counts'],
  heroLangkah3Teks: [
    'Satu hari cuti yang tepat bisa jadi empat hari libur berturut-turut.',
    'One well-placed leave day can turn into four consecutive days off.',
  ],

  istilahJudul: ['Dua hal yang beda', 'Two different things'],
  istilahLiburTeks: [
    'Tanggal merah. Libur untuk semua orang, dan tidak memotong cuti tahunan siapa pun.',
    'A red date. Everyone is off, and it costs nobody any annual leave.',
  ],
  istilahCutiBersamaTeks: [
    'Libur yang ditetapkan bersama hari raya — tetapi di banyak perusahaan swasta, hari ini dipotong dari jatah cuti tahunan Anda. Inilah yang bikin kaget di bulan November.',
    'Days off set alongside the major holidays — but at many private companies they come out of your annual leave. This is what catches people out in November.',
  ],

  // — Pertanyaan status —
  langkahSatu: ['Langkah 1', 'Step 1'],
  langkahDua: ['Langkah 2', 'Step 2'],
  langkahTiga: ['Langkah 3', 'Step 3'],
  statusPertanyaan: ['Anda bekerja sebagai apa?', 'How are you employed?'],
  statusSisaJadi: ['sisa cuti Anda', 'leave left'],
  statusTidakDipotong: ['Tidak dipotong cuti bersama', 'Cuti bersama not deducted'],
  statusDipotongOleh: ['Dipotong cuti bersama', 'Deducted by cuti bersama'],
  statusAsnRingkas: ['ASN / PNS', 'Civil servant'],
  statusSwastaTanpaRingkas: ['Swasta, kantor tetap masuk', 'Private, office stays open'],
  statusSwastaTanpaPotongRingkas: ['Swasta, libur tanpa potong cuti', 'Private, closed but no deduction'],
  statusSwastaDipotongRingkas: ['Swasta, libur dan cuti dipotong', 'Private, closed and deducted'],
  statusTidakYakin: [
    'Tidak yakin? Tanyakan ke HR apakah cuti bersama memotong jatah cuti tahunan Anda. Aplikasi ini tidak bisa menebaknya.',
    'Not sure? Ask HR whether cuti bersama comes out of your annual leave. This app cannot guess it.',
  ],

  // — Hasil utama —
  hasilJudul: ['Hasilnya', 'The result'],
  hasilKalimat: [
    'Dengan sisa cuti Anda, rentetan libur terpanjang tahun ini bisa jadi',
    'With the leave you have left, your longest stretch this year can reach',
  ],
  hasilTanpaCuti: [
    'Tanpa mengambil cuti sama sekali, rentetan terpanjang Anda',
    'Taking no leave at all, your longest stretch is',
  ],
  hasilBelumPilih: [
    'Pilih hari di kalender, atau ambil salah satu usulan di bawah.',
    'Pick a day on the calendar, or take one of the suggestions below.',
  ],
  hasilSudahPilih: ['hari cuti terpakai', 'leave days spent'],

  sheetPetunjuk: [
    'Klik hari kerja mana pun untuk menandainya sebagai cuti. Batang merah menunjukkan hari libur yang menyambung.',
    'Click any working day to mark it as leave. The red bar shows days off joining up.',
  ],
  sheetLihatSemua: ['Lihat semua usulan', 'See all suggestions'],
  saranTeratas: ['Usulan teratas', 'Top suggestions'],
  saranPenjelasan: [
    'Diurutkan menurut leverage: hari libur yang didapat per hari cuti yang dipakai. Bukan saran untuk mengambil cuti — hanya hitungannya.',
    'Ranked by leverage: days off gained per leave day spent. Not a recommendation to take leave — just the arithmetic.',
  ],
  tahunLain: ['Tahun lain', 'Other years'],
} satisfies Kamus

export type KunciTeks = keyof typeof KAMUS

export function t(kunci: KunciTeks, locale: Locale): string {
  return KAMUS[kunci][locale === 'id' ? 0 : 1]
}
