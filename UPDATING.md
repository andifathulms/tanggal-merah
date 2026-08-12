# UPDATING — menambah atau memverifikasi tahun

Ditulis untuk orang asing. Kalau Anda menemukan repo ini dan tahunnya sudah lewat, ini yang perlu dikerjakan.

## Aturan yang tidak boleh dilanggar

1. **Jangan pernah menghitung tanggal hari raya.** Tidak ada hisab, tidak ada konversi Hijriah, tidak ada aritmetika kalender Saka di dalam repo ini. Tanggal libur *ditetapkan pemerintah*, bukan dihitung. SKB sendiri menyatakan bahwa penetapan 1 Ramadan, Idulfitri, dan Iduladha dilakukan terpisah oleh Kementerian Agama.
2. **Jangan menyalin dari pemberitaan.** Buka dokumen SKB dan Keppresnya. Pemberitaan atas SKB 2026 sudah pernah membalik ketentuan ASN dan swasta.
3. **Tahun tanpa SKB tidak diisi.** Aplikasi menolak dengan pesan terstruktur. Itu perilaku yang benar, bukan bug.
4. **Jangan melemahkan validator supaya data lolos.** Kalau pack gagal validasi, packnya yang salah.

## Status pack

Setiap berkas di `data/skb/` punya `status`:

| status | artinya |
|---|---|
| `terverifikasi` | Setiap tanggal dan setiap nomor instrumen sudah dicocokkan dengan dokumen terbitan oleh manusia. |
| `perluVerifikasi` | Transkripsi draf. Aplikasi tetap memakainya, tetapi menampilkan banner peringatan di setiap halaman dan menyatakan datanya belum dicocokkan. |

`pnpm rules:validate` memberi peringatan untuk pack draf, dan **menolak** pack `terverifikasi` yang nomor instrumennya masih placeholder.

## Keadaan sekarang

**`data/skb/2026.json` berstatus `perluVerifikasi`.** Tanggalnya disusun dari kalender 2026 yang beredar luas, tetapi belum dicocokkan baris demi baris dengan dokumen SKB. Yang masih harus dikerjakan:

- [ ] Nomor SKB 3 Menteri untuk tahun 2026 (tiga nomor: Menaker, MenPANRB, Menag) dan tanggal penetapannya
- [ ] Nomor Keppres tentang cuti bersama ASN dan tanggal penetapannya
- [ ] Cocokkan 17 tanggal libur nasional dengan lampiran SKB
- [ ] Cocokkan 8 tanggal cuti bersama dengan lampiran SKB
- [ ] Isi `tautan` ke dokumen resmi pada setiap `sitasi`
- [ ] Perbarui `data/contradictions/cuti-bersama-entitlement.json` dengan nomor instrumen yang sebenarnya
- [ ] Ubah `status` menjadi `terverifikasi`

## Menambah tahun baru

1. Salin `data/skb/<tahun sebelumnya>.json` ke `data/skb/<tahun>.json`. Nama berkas harus sama dengan `tahun` di dalamnya.
2. Kosongkan `hari`, lalu transkripsikan dari lampiran SKB. Urut menurut tanggal.
3. Setiap baris: `tanggal` (YYYY-MM-DD), `nama` (bahasa Indonesia, seperti tertulis di SKB), `namaEn`, `jenis` (`liburNasional` **atau** `cutiBersama` — jangan digabung, keduanya berbeda biaya), dan `sitasi` lengkap.
4. Mulai dengan `"status": "perluVerifikasi"`. Ubah ke `terverifikasi` setelah dicocokkan ulang.
5. Kalau Anda menemukan sumber yang saling bertentangan, buat entri baru di `data/contradictions/` — jangan diam-diam memilih.
6. `pnpm rules:validate && pnpm test:run`.

## Setelah SKB baru terbit di tengah tahun

Pemerintah kadang menambah atau menggeser cuti bersama lewat SKB perubahan. Tambahkan barisnya dengan `sitasi` yang menunjuk ke **SKB perubahan**, bukan SKB awal. Nomor yang tampil di halaman itulah yang dibaca pengguna untuk mengecek sendiri.
