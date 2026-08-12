# Tanggal Merah

Libur nasional dan cuti bersama Indonesia, dan di mana cuti tahunan Anda menghasilkan rentetan libur terpanjang — dengan aturan yang paling sering salah dipahami dibuat eksplisit: **apakah cuti bersama memotong cuti tahunan Anda.**

Situs statis. Tanpa backend, tanpa akun, tanpa jaringan saat dijalankan.

## Yang membuatnya tidak sepele

Daftar hari liburnya mudah. Dua hal tidak.

**Cuti bersama tidak gratis, dan aturannya berbeda menurut siapa Anda.** SKB menyatakan cuti bersama mengurangi hak cuti tahunan pekerja, dan bahwa bagi lembaga swasta pelaksanaannya diserahkan pada masing-masing manajemen — jadi bagi pekerja swasta ia bersifat fakultatif dan berbiaya. Sementara Keppres mengatur bahwa bagi ASN cuti bersama tidak memotong cuti tahunan. Aplikasi ini menanyakan status Anda dan menyebut instrumen untuk setiap cabangnya.

**Sumber-sumbernya saling bertentangan, secara terbuka.** Pemberitaan atas SKB 2026 pernah membalik penetapan ASN dan swasta. Ketimbang diam-diam memilih, aplikasi ini mencatat kedua bacaan beserta sumbernya di [catatan kontradiksi](data/contradictions/), dan menyitasi ke instrumen, bukan ke pemberitaan.

## Hari libur ditetapkan, bukan dihitung

Idulfitri, Nyepi, Waisak, dan Imlek punya dasar astronomis atau kalendris, tetapi **hari libur resminya adalah apa yang ditetapkan SKB** — dan SKB sendiri menyerahkan penetapan 1 Ramadan, Idulfitri, serta Iduladha kepada Kementerian Agama.

Karena itu aplikasi ini mengirimkan data SKB per tahun dan **tidak pernah menghitung tanggal keagamaan.** Tidak ada hisab, konversi Hijriah, atau aritmetika kalender Saka di mana pun dalam kode ini. Tahun tanpa SKB terbit menghasilkan **penolakan terstruktur**, bukan proyeksi.

## Optimisasi

Setiap kandidat hari cuti adalah **jembatan** — hari kerja yang terjepit di antara dua blok hari libur. Metriknya **leverage**: hari libur berturut-turut yang didapat per hari cuti yang dibelanjakan.

Optimisernya **eksak**, bukan greedy, dan hasilnya dicocokkan dengan pencarian menyeluruh (`lib/optimise/brute.ts`, khusus pengujian) di setiap anggaran yang realistis.

## Status data

> **`data/skb/2026.json` masih berstatus `perluVerifikasi`.** Tanggalnya disusun dari kalender 2026 yang beredar luas, tetapi nomor SKB dan Keppresnya belum dicocokkan dengan dokumen terbitan. Aplikasi menampilkan banner peringatan selama status itu belum berubah. Daftar yang harus dicek ada di [UPDATING.md](UPDATING.md).

Nomor instrumen tidak pernah dikarang. Kalau belum diverifikasi, ia ditulis apa adanya sebagai belum diverifikasi.

## Perintah

```bash
pnpm dev                    # pengembangan
pnpm build                  # ekspor statis ke ./out; rules:validate jalan lebih dulu
pnpm preview                # menyajikan ./out di basePath produksi
pnpm test:run               # vitest sekali — sebelum setiap commit
pnpm test:optimiser         # kesepakatan dengan brute force + properti
pnpm test:status            # fixture ASN vs swasta, dua arah
pnpm rules:validate         # sitasi SKB, kontinuitas tanggal, tidak ada tanggal terhitung
pnpm typecheck
pnpm lint
```

## Struktur

```
app/[locale]/{tahun,rencana,aturan}   # id (bawaan), en
components/{sheet,ledger,suggest}
lib/
  day/        integer day numbers, aritmetika minggu. Tanpa Date.
  rules/      skema, loader, resolver, validator, penolakan
  status/     cabang hak cuti ASN vs swasta
  runs/       blok hari libur berturut-turut
  optimise/   enumerasi jembatan + seleksi eksak (brute.ts: khusus tes)
  trace/      LeaveTrace
  export/     ICS + PNG
data/skb/               satu berkas per tahun, bersitasi
data/contradictions/    bacaan yang bertentangan beserta sumbernya
```

## Menambah tahun

Baca [UPDATING.md](UPDATING.md). Ringkasnya: transkripsikan dari dokumen SKB, jangan dari pemberitaan; jangan pernah menghitung tanggal hari raya; tahun tanpa SKB dibiarkan kosong.

## Penafian

Proyek pribadi, bukan nasihat hukum ketenagakerjaan. Di sektor swasta, kebijakan perusahaan yang menentukan pelaksanaan cuti bersama — pastikan ke HR Anda. Setiap tanggal di sini menyebut SKB asalnya sehingga Anda bisa memeriksanya sendiri.
