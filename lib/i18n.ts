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
  legendaDipotong: ['Dipotong dari cuti Anda (−1)', 'Charged to your leave (−1)'],

  // A6 — the citation inspector below the grid.
  kutipanPetunjuk: [
    'Klik tanggal merah atau hari cuti bersama untuk melihat SKB yang menetapkannya.',
    'Click a red date or a cuti bersama day to see the decree that set it.',
  ],
  kutipanDitandatangani: ['ditandatangani', 'signed'],
  kutipanBelumDiverifikasi: [
    'nomor SKB belum dicocokkan dengan dokumen',
    'decree number not yet checked against the document',
  ],

  // `harpitnas` — hari kejepit nasional. The word people already use for the
  // thing this app computes better than anything else, and the one term from
  // the PRD's copy direction the UI never actually said out loud.
  saranJudul: ['Harpitnas dengan leverage tertinggi', 'Highest-leverage harpitnas'],
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

  // A5 — the objective. Asked inside the suggestion panel rather than up front:
  // making a reader state an objective before they have seen a single result is
  // the friction the hero exists to remove, so this is a re-ask, not a setting.
  tujuanPertanyaan: ['Anda mengejar yang mana?', 'Which are you after?'],
  tujuanTotal: ['Banyak libur panjang', 'Many long weekends'],
  tujuanTotalKet: [
    'Total hari libur terbanyak, tersebar sepanjang tahun.',
    'The most total days off, spread through the year.',
  ],
  tujuanRentetan: ['Satu libur terpanjang', 'One long break'],
  tujuanRentetanKet: [
    'Satu rentetan sepanjang mungkin. Sisa tahun tidak dihitung.',
    'The longest single stretch. The rest of the year is not counted.',
  ],
  optimalNilaiRentetan: [
    'hari libur berturut-turut dalam satu rentetan',
    'consecutive days off in a single stretch',
  ],

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

  // A1 — the value the calendar's colour hides. Neutral wording on purpose:
  // this is arithmetic about a working week, not a grievance about a decree.
  hilangJudul: ['Yang dimakan akhir pekan', 'Eaten by the weekend'],
  hilangDari: ['Dari', 'Of'],
  hilangLiburNasional: ['libur nasional tahun ini', 'public holidays this year'],
  hilangJatuhAkhirPekan: [
    'jatuh pada hari yang Anda sudah libur, jadi tidak menambah apa pun.',
    'fall on a day you were already off, so they add nothing.',
  ],
  hilangMenambah: ['benar-benar menambah hari libur', 'genuinely add a day off'],
  hilangCutiBersamaAkhirPekan: [
    'hari cuti bersama juga jatuh di akhir pekan — dan itu tidak memotong cuti siapa pun.',
    'cuti bersama days also fall on a weekend — and those deduct nobody’s leave.',
  ],
  hilangPolaLima: [
    'Dengan pola enam hari (Sabtu masuk), yang termakan tinggal',
    'On a six-day week, with Saturdays worked, only',
  ],
  hilangPolaEnam: [
    'Dengan pola lima hari (Sabtu libur), yang termakan jadi',
    'On a five-day week, with Saturdays off,',
  ],
  hilangPolaAkhiran: ['hari.', 'are eaten.'],
  hilangSamaSaja: [
    'Pola kerja tidak mengubah angka ini tahun ini.',
    'The working week does not change this figure this year.',
  ],

  // A4 — the price of the nth day. Worded as a price list, not as a
  // recommendation: a flattening curve implies "stop here" and invariant 13
  // means the app states the arithmetic and leaves the decision alone.
  kurvaJudul: ['Harga tiap hari cuti', 'What each leave day buys'],
  kurvaPenjelasan: [
    'Setiap baris adalah satu hari cuti tambahan, dan berapa hari libur yang ditambahkannya jika dipakai sebaik mungkin. Dihitung eksak untuk setiap anggaran, bukan diperkirakan dari yang sebelumnya.',
    'Each row is one more leave day, and how many days off it adds if spent as well as possible. Computed exactly at every budget, not extrapolated from the one before.',
  ],
  kurvaHariKe: ['Hari ke-', 'Day '],
  kurvaTambah: ['menambah', 'adds'],
  kurvaTidakMenambah: ['tidak menambah apa pun', 'adds nothing'],
  kurvaTotal: ['total', 'total'],
  kurvaJenuh: [
    'Dari hari ke-%s ke atas tidak ada lagi harpitnas yang bisa dibeli tahun ini.',
    'From day %s onwards there is no harpitnas left to buy this year.',
  ],
  kurvaKosong: [
    'Tidak ada sisa cuti untuk dihargai.',
    'No remaining leave to price.',
  ],
  // The real curve is lumpy, not falling: a two-day harpitnas is unaffordable at
  // a budget of one and becomes the best buy at two, so day 2 can add more than
  // day 1. Said out loud, because a rising step otherwise reads as a bug.
  kurvaLompatan: [
    'Angkanya tidak selalu menurun. Harpitnas dua hari baru terbeli begitu anggarannya cukup, jadi hari kedua bisa menambah lebih banyak daripada hari pertama.',
    'The figures do not always fall. A two-day harpitnas is unaffordable at a budget of one and becomes the best buy at two, so day 2 can add more than day 1.',
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

  // The warning leads with a plain-language line, because it is read before the
  // reader has any idea what an SKB is. It used to point at UPDATING.md — a
  // repository file a visitor cannot open — so it now points at Aturan, where
  // the citations actually are.
  bannerDrafJudul: [
    'Tanggalnya belum dicocokkan dengan dokumen SKB resmi',
    'These dates have not been checked against the official decree',
  ],
  bannerDraf: [
    'Tanggal untuk tahun ini disalin dari kalender yang beredar luas, belum dicocokkan baris demi baris dengan SKB yang diterbitkan, dan nomor SKB-nya belum diisi. Cukup untuk merencanakan; jangan dipakai untuk memutuskan — pastikan dulu ke HR Anda.',
    'The dates for this year were transcribed from the widely circulated calendar, have not been checked line by line against the published decree, and the decree numbers are not filled in yet. Fine for planning; do not decide on it — confirm with your HR first.',
  ],
  bannerDrafTautan: ['Lihat sumber tiap tanggal', 'See the source for every date'],
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
  // These three describe the three numbered sections of the page, in the order
  // they appear. They used to promise a step 2 ("see what is left") that turned
  // out to be an unnumbered result panel, and a step 3 that appeared twice.
  heroLangkah1: ['Pilih status Anda', 'Pick your status'],
  heroLangkah1Teks: [
    'ASN dan swasta punya aturan berbeda, dan itulah yang paling mengubah hitungannya.',
    'Civil servants and private employees fall under different rules, and that changes the arithmetic most.',
  ],
  heroLangkah2: ['Ambil yang paling untung', 'Take the best trades'],
  heroLangkah2Teks: [
    'Kami hitung sisa cuti Anda setelah cuti bersama, lalu mengurutkan harpitnas menurut leverage.',
    'We work out what genuinely remains after cuti bersama, then rank the harpitnas by leverage.',
  ],
  heroLangkah3: ['Tandai di kalender', 'Mark up the year'],
  heroLangkah3Teks: [
    'Klik hari mana pun di kalender setahun, lalu unduh sebagai .ics atau PNG.',
    'Click any day on the year sheet, then download it as .ics or a PNG.',
  ],

  // The proof line in the hero. States the year's best trade as arithmetic —
  // invariant 13 holds, it is not a suggestion to take the day.
  buktiLabel: ['Contoh dari tahun ini', 'From this year, for example'],
  buktiHasil: ['hari libur berturut-turut', 'consecutive days off'],

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
  saranTeratas: ['Harpitnas teratas', 'Top harpitnas'],
  saranPenjelasan: [
    'Harpitnas adalah hari kerja yang terjepit di antara dua blok libur. Diurutkan menurut leverage: hari libur yang didapat per hari cuti yang dipakai. Bukan saran untuk mengambil cuti — hanya hitungannya.',
    'A harpitnas is a working day pinched between two blocks of days off. Ranked by leverage: days off gained per leave day spent. Not a recommendation to take leave — just the arithmetic.',
  ],
  tahunLain: ['Tahun lain', 'Other years'],
} satisfies Kamus

export type KunciTeks = keyof typeof KAMUS

export function t(kunci: KunciTeks, locale: Locale): string {
  return KAMUS[kunci][locale === 'id' ? 0 : 1]
}
