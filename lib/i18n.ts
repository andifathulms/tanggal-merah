import { civilOf, weekdayOf, type DayNumber, type Month } from '@/lib/day'
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

/** Spoken forms. The grid's column heads are abbreviated; a read-aloud name is not. */
const HARI_PANJANG_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const
const HARI_PANJANG_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

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

export function namaHari(hari: DayNumber, locale: Locale): string {
  return (locale === 'id' ? HARI_PANJANG_ID : HARI_PANJANG_EN)[weekdayOf(hari)]!
}

/**
 * e.g. "Senin, 17 Agustus 2026". The weekday is the whole point of a leave
 * planner — which day a holiday lands on is what decides whether a bridge exists —
 * and the grid conveys it only by column position, which a screen reader cannot
 * see. The abbreviated column heads above the grid are not associated with the
 * cells, so the name has to carry it (WCAG 1.3.1).
 */
export function tanggalDenganHari(hari: DayNumber, locale: Locale): string {
  return `${namaHari(hari, locale)}, ${tanggalPanjang(hari, locale)}`
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
  // The language switcher. "id" / "en" on their own do not say what the link does.
  bahasaId: ['Baca dalam Bahasa Indonesia', 'Read in Indonesian'],
  bahasaEn: ['Baca dalam bahasa Inggris', 'Read in English'],

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
  // Every date in this app names the decree it came from. The entitlement figure
  // named nothing — it was simply defaulted to 12 — even though it is the input most
  // likely to be wrong for any given reader.
  jatahDasar: [
    'Bawaannya 12 hari: itu batas minimum menurut UU Ketenagakerjaan bagi pekerja yang sudah 12 bulan bekerja terus-menerus. Kontrak atau peraturan perusahaan Anda bisa memberi lebih — angka ini milik Anda untuk diperiksa, bukan hasil hitungan aplikasi.',
    'The default is 12 days: that is the statutory minimum under the Manpower Law for an employee with twelve months of continuous service. Your contract or company rules may give more — this figure is yours to check, not something the app worked out.',
  ],
  jatahDasarBelumDicek: [
    'Nomor pasalnya belum dicocokkan dengan dokumen undang-undangnya, sama seperti nomor SKB tahun ini.',
    'The article number has not been checked against the statute, the same as this year’s decree numbers.',
  ],
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
  // The four facts behind the deduction used to live in four separate components
  // with nothing joining them, and the principle that makes the middle step matter
  // — a day off you already had costs nobody anything — was never stated at all.
  rantaiJudul: ['Dari mana potongan itu', 'Where the deduction comes from'],
  rantaiTotal: ['hari cuti bersama ditetapkan tahun ini.', 'cuti bersama days are decreed this year.'],
  rantaiAkhirPekan: [
    'jatuh pada hari yang Anda sudah libur. Hari yang sudah libur tidak memakan cuti siapa pun, jadi tidak ikut dihitung.',
    'fall on a day you were already off. A day you already had off costs nobody any leave, so it is not counted.',
  ],
  rantaiTidakAdaAkhirPekan: [
    'Tahun ini tidak ada yang jatuh di akhir pekan — kalau ada, hari itu tidak akan memakan cuti siapa pun.',
    'None fall on a weekend this year — if one did, it would cost nobody any leave.',
  ],
  rantaiHariKerja: [
    'jatuh pada hari yang seharusnya Anda kerja. Hanya hari-hari inilah yang bisa dipotong.',
    'fall on a day you would otherwise have worked. Only these can be charged.',
  ],
  rantaiDipotong: [
    'Perusahaan Anda ikut cuti bersama dan memotongnya, jadi semuanya dipotong:',
    'Your company takes cuti bersama and deducts it, so all of them are charged:',
  ],
  rantaiTidakDipotong: [
    'Status Anda tidak memotongnya, jadi potongannya nol.',
    'Your status does not charge them, so the deduction is zero.',
  ],
  rantaiLihat: [
    'Hari yang dipotong ditandai −1 di kalender.',
    'The charged days are marked −1 on the calendar.',
  ],
  ledgerDasar: ['Dasar', 'Basis'],
  ledgerInstrumen: ['Instrumen', 'Instrument'],

  sheetJudul: ['Setahun penuh', 'The year'],
  legendaLibur: ['Libur nasional', 'Public holiday'],
  legendaCutiBersama: ['Cuti bersama', 'Joint leave'],
  legendaCutiPribadi: ['Cuti Anda', 'Your leave'],
  legendaAkhirPekan: ['Akhir pekan', 'Weekend'],
  legendaRun: ['Rentetan 3 hari atau lebih', 'Stretch of 3+ days'],
  legendaDipotong: ['Dipotong dari cuti Anda (−1)', 'Charged to your leave (−1)'],
  // Spoken form of the −1 on a charged cuti bersama cell.
  selDipotong: ['dipotong satu hari dari cuti tahunan Anda', 'one day charged to your annual leave'],

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
    'Ini kombinasi terbaik yang benar-benar ada, bukan yang pertama ditemukan. Cara cepat yang biasa dipakai — ambil harpitnas dengan leverage tertinggi lebih dulu, lalu yang berikutnya — bisa melewatkan pasangan yang kalau diambil bersama justru menyambung tiga blok sekaligus. Aplikasi ini memeriksa semua kombinasi yang muat dalam anggaran Anda, dan hasilnya diuji ulang dengan pencarian menyeluruh.',
    'This is the best combination that exists, not the first one found. The usual shortcut — take the highest-leverage harpitnas, then the next — can miss a pair that only pays off taken together, joining three blocks at once. This app checks every combination that fits your budget, and the answer is re-tested against an exhaustive search.',
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
  hilangYangMana: ['Yang termakan:', 'The ones eaten:'],
  hilangTidakDitandai: [
    'Hari-hari ini tidak bisa dibedakan di kalender: aplikasi menampilkannya sebagai akhir pekan, karena memang itulah nilainya bagi Anda.',
    'These are not distinguishable on the calendar: the app draws them as weekend, because that is what they are worth to you.',
  ],
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

  ringkasHari: ['hari', 'days'],

  eksporJudul: ['Ekspor', 'Export'],
  eksporIcs: ['Unduh .ics', 'Download .ics'],
  eksporPng: ['Unduh PNG', 'Download PNG'],
  eksporSalinTautan: ['Salin tautan', 'Copy link'],
  eksporTersalin: ['Tersalin', 'Copied'],

  // A3 — the disagreement, priced. The ledger recorded both readings in prose;
  // the number is what makes the stakes legible and the app's choice checkable.
  bandingJudul: ['Kalau bacaan yang lain dipakai', 'If the other reading were used'],
  bandingPenjelasan: [
    'Sumber tentang aturan ini saling bertentangan di ruang publik. Aplikasi mengikuti instrumen, bukan pemberitaan — dan inilah angka yang dihasilkan tiap bacaan untuk Anda, supaya pilihan itu bisa Anda periksa sendiri.',
    'Public sources contradict each other on this rule. The app follows the instruments rather than the reporting — and here is the figure each reading produces for you, so you can check that choice yourself.',
  ],
  bandingDipakai: ['dipakai', 'used'],
  bandingSisa: ['sisa cuti', 'leave left'],
  bandingSepakat: [
    'Untuk status Anda, kedua bacaan menghasilkan angka yang sama. Perselisihannya tentang ASN.',
    'For your status both readings give the same figure. The disagreement is about ASN.',
  ],
  bandingSelisih: [
    'Selisihnya %s hari — dan itulah sebabnya kontradiksi ini dicatat, bukan diputuskan diam-diam.',
    'A %s-day difference — which is why this contradiction is recorded rather than quietly decided.',
  ],

  aturanJudul: ['Aturan dan sitasi', 'Rules and citations'],
  aturanSumber: ['Sumber', 'Sources'],
  // Names the citation table. One table per year, so each needs its own name for
  // a reader navigating by table (WCAG 1.3.1).
  aturanTabelJudul: [
    'Libur nasional dan cuti bersama yang ditetapkan untuk',
    'Public holidays and cuti bersama decreed for',
  ],
  aturanTanggal: ['Tanggal', 'Date'],
  aturanNama: ['Nama', 'Name'],
  aturanJenis: ['Jenis', 'Type'],
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
    'Cuti Anda mungkin tidak sebanyak yang Anda kira. Setiap tahun pemerintah menetapkan libur nasional dan cuti bersama lewat SKB — Surat Keputusan Bersama tiga menteri — dan yang sering tidak disadari: di banyak perusahaan swasta, hari cuti bersama dipotong dari jatah cuti tahunan Anda. Halaman ini menghitung berapa sisa cuti Anda sebenarnya, lalu menunjukkan di tanggal mana cuti itu paling berguna.',
    'You may have less leave than you think. Each year the government sets public holidays and cuti bersama (joint leave) by an SKB — a joint decree of three ministers — and what most people miss is that at many private companies those cuti bersama days are deducted from your annual leave. This page works out what you actually have left, then shows you which dates buy the most time off.',
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
  // Disclosed where the choice is made. The model is all-or-nothing and real
  // companies take a subset, so saying nothing would be an unstated simplification.
  statusSederhana: [
    'Aplikasi ini menganggap perusahaan mengambil semua hari cuti bersama atau tidak sama sekali. Kalau perusahaan Anda hanya mengambil sebagian, kurangi angka jatah cuti di panel Pengaturan sebanyak hari yang dipotong.',
    'This app assumes a company takes all the cuti bersama days or none of them. If yours takes only some, reduce the entitlement figure in the Settings panel by the number of days it charges you.',
  ],
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
  // The headline figure was unlocatable: a number with no dates and no way to find it
  // on the grid, which made the page's largest claim the one thing on it a reader
  // could not check.
  hasilRentang: ['yaitu', 'that is'],
  hasilSampai: ['sampai', 'to'],

  // Spoken when the computed result changes. A polite live region, not an alert:
  // the reader asked for this by toggling a day, so it must not interrupt.
  hasilDiumumkan: [
    'Rentetan terpanjang %r hari. Sisa cuti %s hari.',
    'Longest stretch %r days. Leave remaining %s days.',
  ],
  eksporTersalinDiumumkan: ['Tautan tersalin ke papan klip.', 'Link copied to the clipboard.'],

  sheetPetunjuk: [
    'Klik hari kerja mana pun untuk menandainya sebagai cuti. Batang merah menunjukkan hari libur yang menyambung.',
    'Click any working day to mark it as leave. The red bar shows days off joining up.',
  ],
  sheetLihatSemua: ['Lihat semua usulan', 'See all suggestions'],
  saranTeratas: ['Harpitnas teratas', 'Top harpitnas'],
  // The definition used to say leverage was "days off gained per leave day spent".
  // That number is 1.0 for every bridge that has ever existed: buying the N working
  // days in a gap gains exactly those N days off, because the blocks either side
  // were already off. What a harpitnas buys is not more days — it is contiguity, and
  // leverage measures the stretch it produces per day spent. Saying "gained" told
  // the reader a false version of the app's own headline metric.
  saranPenjelasan: [
    'Harpitnas adalah hari kerja yang terjepit di antara dua blok libur. Mengambilnya tidak menambah jumlah hari libur Anda — yang bertambah tepat sebanyak hari yang Anda beli. Yang berubah: hari libur yang tadinya terpisah jadi satu rentetan panjang. Leverage adalah panjang rentetan itu dibagi hari cuti yang dipakai; istilah ini dipakai di aplikasi ini, bukan istilah resmi. Bukan saran untuk mengambil cuti — hanya hitungannya.',
    'A harpitnas is a working day pinched between two blocks of days off. Taking one does not increase how many days off you have — that goes up by exactly what you bought. What changes is that days off which were separate become one long stretch. Leverage is that stretch divided by the leave days spent; the term is this app\u2019s own, not an official one. Not a recommendation to take leave — just the arithmetic.',
  ],
  // The unit on a bridge card. "hari libur" read as "days off gained", which is the
  // error above in miniature; the stretch is what the figure counts.
  saranHasilRingkas: ['hari berturut-turut', 'days in a row'],
  saranLeverageRumus: [
    'panjang rentetan ÷ hari cuti',
    'stretch length ÷ leave days',
  ],
  tahunLain: ['Tahun lain', 'Other years'],
} satisfies Kamus

export type KunciTeks = keyof typeof KAMUS

export function t(kunci: KunciTeks, locale: Locale): string {
  return KAMUS[kunci][locale === 'id' ? 0 : 1]
}
