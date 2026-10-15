# BarterYuk!

**Marketplace barter & tukar tambah** — tukar barang yang tidak terpakai dengan barang yang dibutuhkan, opsional menambah uang bila kedua pihak setuju.

Aplikasi web satu halaman yang terdiri dari katalog barang, form tambah barang, modal detail, dan alur penawaran barter. Data katalog disajikan oleh endpoint JSON PHP (`api/barang.php`) dan diambil dari browser memakai Fetch API.

> **Status kejujuran:** penawaran barter pada versi ini masih **prototipe UI**. Penawaran belum dikirim ke server, belum divalidasi pihak kedua, dan **belum menjadi transaksi nyata**. Tidak ada pembayaran atau payment gateway. Nilai barang hanya **estimasi** yang dapat dinegosiasikan.

| Informasi | Keterangan |
| --- | --- |
| Nama proyek | BarterYuk! |
| Jenis | Aplikasi web statis (HTML/CSS/JavaScript) + JSON API PHP |
| Konteks | Tugas mata kuliah Pemrograman Web, mengacu materi Week 1–5 |
| Penyusun | Nazril — NIM: `[202410370110395]` |
| Penyusun | Adha - NIM: `[202410370110396]` |
| Penyusun | Mukmin - NIM: `[202410370110397]` |
| Berkas utama | `index.html`, `style.css`, `script.js`, `api/barang.php` |

---

## Daftar Isi

1. [Latar Belakang](#1-latar-belakang)
2. [Solusi yang Ditawarkan](#2-solusi-yang-ditawarkan)
3. [Target Pengguna & Ruang Lingkup](#3-target-pengguna--ruang-lingkup)
4. [Fitur yang Tersedia](#4-fitur-yang-tersedia)
5. [Teknologi yang Digunakan](#5-teknologi-yang-digunakan)
6. [Struktur Folder](#6-struktur-folder)
7. [Prasyarat & Cara Menjalankan](#7-prasyarat--cara-menjalankan)
8. [Memeriksa Endpoint JSON](#8-memeriksa-endpoint-json)
9. [Alur Data: Fetch API, Loading, Error, dan localStorage](#9-alur-data-fetch-api-loading-error-dan-localstorage)
10. [Pemetaan Materi Week 1–5](#10-pemetaan-materi-week-15)
11. [Batasan Aplikasi Saat Ini](#11-batasan-aplikasi-saat-ini)
12. [Integrasi MySQL (PDO)](#12-integrasi-mysql-pdo)

---

## 1. Latar Belakang

Banyak orang menyimpan barang yang masih layak pakai tetapi sudah tidak dibutuhkan, misalnya gadget lama, buku pelajaran, alat musik, atau sepeda.
Menjual barang seperti itu sering merepotkan: harus menentukan harga, menunggu pembeli, dan berurusan dengan transaksi uang.

Padahal kebutuhan pengguna sering kali bisa dipenuhi dengan **menukar barang secara langsung** dengan orang lain yang membutuhkan barang tersebut.

## 2. Solusi yang Ditawarkan

**BarterYuk!** menyediakan satu halaman katalog tempat pengguna dapat:

- melihat daftar barang yang sedang ditawarkan untuk ditukar, lengkap dengan **estimasi nilai**;
- mencari barang berdasarkan nama, kategori, pemilik, atau kota;
- menyaring katalog per kategori dan mengurutkannya;
- memasang barang miliknya sendiri lengkap dengan detail kondisi;
- membuka detail barang melalui modal, dengan pemisahan jelas antara **estimasi nilai** dan **harga transaksi yang disepakati**;
- menyusun **penawaran barter** (prototipe UI): memilih barang yang ditawarkan, melihat perkiraan selisih nilai kedua barang, memilih opsi uang tambahan atau tukar murni, lalu meninjau penawaran sebelum menyimpannya sebagai **draft lokal**.

## 3. Target Pengguna & Ruang Lingkup

**Target pengguna:** mahasiswa dan masyarakat umum yang ingin menukar barang layak pakai tanpa harus membeli barang baru.

**Termasuk dalam ruang lingkup:**

- satu halaman web (`index.html`) dengan katalog, form tambah barang, modal detail, modal penawaran, dan daftar draft;
- interaksi di sisi browser: pencarian, filter, pengurutan, validasi form, hapus barang, notifikasi, serta penyusunan penawaran barter (prototipe);
- penyimpanan data pengguna dan draft penawaran di `localStorage` browser;
- satu endpoint JSON PHP (`api/barang.php`) yang membaca katalog dari database MySQL (PDO) sebagai sumber data.

**Di luar ruang lingkup (belum dibuat):**

- login, akun pengguna, dan hak akses;
- pengiriman penawaran ke server, validasi pihak kedua, dan riwayat penawaran yang benar-benar tersimpan;
- chat antar pengguna dan proses negosiasi daring;
- penulisan (create/update/delete) ke database dari sisi server, unggah gambar, pembayaran/payment gateway, dan pengiriman barang;
- sinkronisasi penawaran ke server (draft penawaran masih tersimpan lokal di `localStorage`).

## 4. Fitur yang Tersedia

| Fitur | Deskripsi | Bukti di kode |
| --- | --- | --- |
| Katalog barang | Menampilkan daftar barang dalam bentuk kartu | `index.html` (`#item-list`), `script.js` (`templateKartu`, `renderDaftarBarang`) |
| Statistik ringkas | Jumlah barang, kategori, dan kota pada bagian hero | `script.js` (`perbaruiStatistik`) |
| Pencarian langsung | Mencari pada nama, kategori, pemilik, dan kota; memakai debounce | `script.js` (`#input-pencarian`, `debounce`, `ambilBarangTampil`) |
| Filter kategori | Chip kategori dengan 8 kategori + opsi "Semua" | `script.js` (`renderFilterKategori`), `style.css` (`.chip`) |
| Pengurutan | Terbaru, terlama, nama A–Z, nama Z–A | `index.html` (`#urutkan`), `script.js` (`pembanding`) |
| Muat ulang data | Mengambil ulang data dari endpoint; minta konfirmasi bila sudah ada data lokal | `script.js` (`#btn-reload`) |
| Tambah barang | Form 8 field; menyimpan barang baru ke urutan teratas katalog | `index.html` (`#form-tambah`), `script.js` (`tanganiSubmitForm`) |
| Validasi form | Nama minimal 3 karakter, kategori & kondisi wajib, pemilik minimal 2 karakter, nilai tidak negatif, URL gambar harus `http://` atau `https://` | `script.js` (`validasiForm`, `tampilkanError`) |
| Penghitung karakter | Menampilkan `0 / 180` untuk kolom deskripsi | `script.js` (`#char-counter`) |
| Modal detail | Menampilkan gambar/ikon, kondisi, deskripsi, pemilik, lokasi, **estimasi nilai**, **harga transaksi disepakati**, waktu, dan ID barang | `index.html` (`#modal-detail`), `script.js` (`bukaModal`, `tutupModal`) |
| Nilai estimasi pada kartu | Setiap kartu menampilkan baris "Estimasi nilai" (angka Rupiah atau "Belum diisi") | `script.js` (`templateKartu`, `teksNilai`), `style.css` (`.card-nilai`) |
| Pemisahan estimasi vs transaksi | Estimasi nilai ditandai eksplisit; harga transaksi disepakati terpisah dan hanya terisi setelah deal. Banner peringatan di katalog + catatan di modal | `index.html` (`.notice-banner`, `#modal-harga-disepakati`), `style.css` |
| Penawaran barter (prototipe) | Modal: pilih barang yang ditawarkan, bandingkan estimasi kedua barang, hitung perkiraan selisih, pilih uang tambahan/tanpa uang, tinjau penawaran | `index.html` (`#modal-penawaran`), `script.js` (`bukaPenawaran`, `perbaruiPerbandingan`, `perbaruiTinjauan`) |
| Peringatan estimasi & negosiasi | Peringatan "nilai hanya estimasi dan dapat dinegosiasikan" pada modal penawaran dan banner katalog | `index.html` (`.warn-note`, `.notice-banner`) |
| Draft penawaran lokal | Menyimpan penawaran sebagai draft di `localStorage` (kunci `barteryuk.penawaran.v1`), daftar draft, hapus satu/semua. Ditandai "belum dikirim ke server" | `script.js` (`simpanDraftPenawaran`, `renderDraftPenawaran`, `templateDraft`) |
| Validasi penawaran | Wajib memilih barang yang ditawarkan; nominal uang tambahan harus > 0 bila memakai opsi uang | `script.js` (`simpanDraftPenawaran`, `tampilkanErrorPenawaran`) |
| Hapus barang | Menghapus barang dari katalog setelah konfirmasi | `script.js` (`#btn-hapus-modal`) |
| Notifikasi (toast) | Umpan balik untuk aksi berhasil, gagal, atau info | `script.js` (`tampilkanToast`), `style.css` (`.toast`) |
| Penyimpanan lokal | Perubahan pengguna disimpan di `localStorage` dan bertahan setelah refresh | `script.js` (`simpanKeStorage`, `muatDariStorage`, kunci `barteryuk.barang.v1`) |
| Loading state | Skeleton loading saat data sedang dimuat | `index.html` (`#loading`), `script.js` (`tampilkanLoading`) |
| Error state | Pesan kegagalan + tombol "Coba Lagi" bila endpoint tidak dapat diakses | `index.html` (`#error-state`, `#btn-retry`), `script.js` (`tampilkanErrorState`) |
| Empty state | Pesan khusus bila hasil pencarian/filter kosong | `index.html` (`#empty-state`) |
| Gambar produk lokal | Setiap barang contoh memakai ilustrasi di `assets/images/` (SVG orisinal, tampil tanpa internet) | `api/barang.php` (field `gambar`), `assets/images/` |
| Kotak gambar konsisten | Kotak media kartu memakai rasio tetap 4:3 (modal 16:9) dengan `object-fit: cover` | `style.css` (`.card-media`, `.card-img`, `.modal-media`) |
| Placeholder gambar | Bila gambar belum/gagal dimuat, tampil ikon kategori + "Foto belum tersedia" (bukan kotak kosong) | `script.js` (`templateKartu`, `pasangFallbackGambar`), `style.css` (`.media-placeholder`) |
| Aksesibilitas dasar | Skip link, label form, `aria-live`, `aria-pressed` pada chip, focus trap di modal, dukungan `prefers-reduced-motion` | `index.html`, `style.css`, `script.js` |
| Responsif | Layout adaptif (Grid/Flexbox) dengan satu breakpoint di 720 px | `style.css` (`@media (max-width: 720px)`) |

**Contoh data:** katalog awal berisi 6 barang contoh (MacBook Air M1 2020, Gitar Akustik Yamaha F310, Sepeda Lipat Pacific Noris, Buku Pemrograman Web Lengkap, Nintendo Switch Lite, Rak Buku Kayu Minimalis). Keenam barang ini mencakup **5 kategori unik** (Elektronik, Hobi, Kendaraan, Buku & Edukasi, Rumah Tangga), sedangkan filter menyediakan **8 pilihan kategori** (di luar opsi "Semua"). Antarmuka menyediakan **5 pilihan kondisi**, dan data contoh saat ini memakai **3 kondisi unik** (Mulus 90%+, Seperti Baru, Layak Pakai).

## 5. Teknologi yang Digunakan

| Lapisan | Teknologi |
| --- | --- |
| Struktur | HTML semantic (`header`, `nav`, `main`, `section`, `article`, `footer`, `dl`, `form`) dan modal berbasis `div` dengan `role="dialog"` |
| Tampilan | CSS murni: design token (`:root`), CSS Grid, Flexbox, media query, `clamp()`; tanpa framework |
| Interaksi | JavaScript vanilla: DOM API, event handling, debounce, array of objects, `Intl.NumberFormat` |
| Data dari server | Fetch API, `async/await`, `response.ok`, `response.json()`, `try/catch/finally` |
| Backend | PHP sebagai JSON API (`api/barang.php`): **PDO + prepared statement** ke MySQL, `json_encode()`, header `Content-Type: application/json`, penanganan status `405`/`500` |
| Penyimpanan | `localStorage`: data pengguna (`barteryuk.barang.v1`) & draft penawaran (`barteryuk.penawaran.v1`) di browser |

Katalog dibaca dari database **MySQL** melalui **PDO** (detail di [bagian 12](#12-integrasi-mysql-pdo)). Tidak ada framework dan tidak ada dependency eksternal (tanpa Composer); tidak ada proses build. Tidak ada pembayaran/payment gateway.

## 6. Struktur Folder

```
barter-yuk/                  # folder proyek (berisi index.html)
├── index.html               # Halaman utama: hero, katalog, form tambah, seksi draft penawaran, modal detail & modal penawaran, toast
├── style.css                # Design token, layout Grid/Flexbox, komponen (kartu, modal, penawaran, draft), media query
├── script.js                # Fetch API, state, render kartu, event, validasi, localStorage (barang + draft penawaran)
├── koneksi.php              # Konfigurasi + koneksi PDO MySQL (membaca environment variable / .env)
├── .env.example             # Contoh konfigurasi DB lokal (tanpa kredensial); disalin menjadi .env
├── .env                     # Kredensial lokal sebenarnya (DIABAIKAN Git; tidak ikut repositori)
├── assets/
│   └── images/              # Gambar produk lokal (ilustrasi SVG orisinal, bebas dipakai)
│       ├── macbook-air-m1.svg
│       ├── gitar-akustik.svg
│       ├── sepeda-lipat.svg
│       ├── buku-pemrograman.svg
│       ├── nintendo-switch-lite.svg
│       └── rak-buku-kayu.svg
├── api/
│   ├── barang.php           # Endpoint JSON katalog (PHP + PDO MySQL) — satu-satunya berkas PHP yang diakses halaman
│   ├── config.example.php   # Contoh konfigurasi DB alternatif (tanpa kredensial; tidak dipakai alur utama)
│   └── koneksi-db.php       # Legacy/tidak dipakai — helper koneksi lama (digantikan `koneksi.php` root)
├── database/
│   ├── schema.sql           # Migrasi tabel `barang` (idempoten, tanpa DROP)
│   ├── seed_katalog.sql     # Seed 6 barang contoh (idempoten, aman diulang)
│   ├── README.md            # Panduan database
│   ├── skema.sql            # RANCANGAN lengkap (users/penawaran) — belum dijalankan
│   ├── seed.sql             # Seed rancangan lengkap — belum dijalankan
│   └── trigger-opsional.sql # Trigger rancangan — belum dijalankan
└── README.md                # Dokumentasi proyek ini
```

Semua ilustrasi di `assets/images/` dibuat sendiri untuk proyek ini (bukan hasil unduhan dari internet), sehingga bebas dipakai, ringan (beberapa KB per berkas), dan tetap tampil tanpa koneksi internet.

`koneksi.php` menyediakan koneksi **PDO MySQL** (`koneksi()` / `koneksiDatabase()`). Kredensial dibaca dari environment variable, atau dari berkas `.env` lokal yang diabaikan Git — tidak ada kata sandi di dalam kode. Berkas ini di-*include* oleh `api/barang.php`, tetapi tidak pernah dipanggil langsung oleh `index.html`.

## 7. Prasyarat & Cara Menjalankan

**Prasyarat:**

- **PHP 8.x** dengan ekstensi **`pdo_mysql`**. Proyek ini diuji memakai **PHP 8.5.11** (Homebrew).
- **MySQL 8.0+** (diuji pada MySQL 26.7.0, keluarga MySQL 9). Database `barteryuk` dan akun aplikasi `barteryuk_app` (bukan `root`) sudah disiapkan.
- Browser modern (Chrome, Edge, Firefox, atau Safari versi terbaru).
- Koneksi internet **tidak wajib untuk gambar contoh**: seluruh gambar barang bawaan memakai aset lokal di `assets/images/`, jadi katalog tetap tampil lengkap secara offline. Internet hanya diperlukan bila pengguna menambahkan barang dengan URL gambar eksternal. Bila gambar gagal dimuat, kotak media menampilkan placeholder (ikon kategori + "Foto belum tersedia").

> **Penting — siapkan database lebih dulu.** Katalog kini dibaca dari MySQL. Sebelum menjalankan, konfigurasikan koneksi `.env` lalu buat tabel & seed (langkah lengkap di [bagian 12](#12-integrasi-mysql-pdo)). Bila konfigurasi database belum lengkap atau koneksi gagal, `api/barang.php` mengembalikan HTTP `500` dengan pesan JSON aman (tanpa detail kredensial), dan katalog frontend menampilkan error state. Tidak ada fallback diam-diam ke data statis.

**Menjalankan dengan PHP built-in server:**

```bash
# masuk ke folder proyek, yaitu folder yang berisi index.html
cd barter-yuk

# jalankan server
php -S localhost:8000
```

Lalu buka <http://localhost:8000> di browser. Server dihentikan dengan `Ctrl + C`.

**Alternatif bila memakai XAMPP/Laragon:** letakkan folder proyek di dalam direktori web (misalnya `htdocs`), lalu buka <http://localhost/barter-yuk/>.
URL `api/barang.php` dipanggil secara relatif, sehingga tetap bekerja baik aplikasi diakses dari root maupun dari subfolder.

> **Penting:** jangan membuka `index.html` langsung melalui `file://`. Browser memblokir request `fetch()` dari alamat `file://`, sehingga katalog akan menampilkan error state. Aplikasi harus diakses melalui server, misalnya `http://localhost:8000`.

## 8. Memeriksa Endpoint JSON

Alamat endpoint (dengan server pada port 8000):

| URL | Keterangan |
| --- | --- |
| `http://localhost:8000/api/barang.php` | Seluruh data katalog |
| `http://localhost:8000/api/barang.php?kategori=Hobi` | Contoh pemrosesan di server: hanya kategori Hobi |

Contoh pemeriksaan lewat terminal:

```bash
curl http://localhost:8000/api/barang.php
```

Bentuk respons (disingkat):

```json
{
  "ok": true,
  "total": 6,
  "pesan": "Data katalog berhasil dimuat dari database.",
  "data": [
    {
      "id": "seed-1",
      "nama": "MacBook Air M1 2020",
      "kategori": "Elektronik",
      "kondisi": "Mulus 90%+",
      "deskripsi": "Baterai masih sehat 89%, kelengkapan box dan charger original.",
      "pemilik": "Nazril",
      "lokasi": "Bandung",
      "nilai": 8500000,
      "gambar": "assets/images/macbook-air-m1.svg",
      "waktu": "<timestamp_milidetik>"
    }
  ]
}
```

Perilaku yang diterapkan di `api/barang.php`:

- `200` — data berhasil dikirim (termasuk saat hasil filter kosong, dengan `"data": []` dan `"total": 0`);
- `405` — metode selain `GET` (mis. `POST`), disertai header `Allow: GET`;
- `500` — bila konfigurasi database belum lengkap atau koneksi/query gagal. Klien menerima pesan JSON **generik** (`{"ok": false, "pesan": "..."}`); detail teknis (mis. pesan PDO) hanya dicatat ke log server melalui `error_log()`, tidak dibocorkan ke respons.
- **Hardening parameter `kategori`:** nilai hanya diproses bila bertipe string (`is_string()`). Bila klien mengirim bentuk non-string, mis. `?kategori[]=Hobi`, parameter diabaikan dengan aman tanpa memicu peringatan *Array to string conversion*, sehingga respons tetap JSON valid.
- **Anti-kebocoran galat:** `display_errors` dan `html_errors` dimatikan di endpoint, sehingga pesan/notice PHP tidak pernah tercetak ke body respons API.

Nilai `"pesan"` pada respons sukses kini berbunyi `"Data katalog berhasil dimuat dari database."` karena data berasal dari tabel `barang` di MySQL, bukan lagi array statis di berkas PHP.

## 9. Alur Data: Fetch API, Loading, Error, dan localStorage

### 9.1 Pengambilan data dari endpoint

`script.js` memanggil endpoint dengan Fetch API di dalam fungsi `ambilDataBarang()`:

```js
const respons = await fetch(API_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
});

if (!respons.ok) {
    throw new Error(`Permintaan gagal (HTTP ${respons.status})`);
}

const isi = await respons.json();
```

`API_URL` bernilai `"api/barang.php"` (alamat relatif terhadap halaman). Data yang diharapkan adalah array barang, baik berupa array langsung maupun di dalam properti `data`. Bila bentuk data tidak sesuai, fungsi melempar `Error` agar ditangani sebagai error state.

### 9.2 Alur saat halaman dibuka (`inisialisasiData`)

1. Skeleton loading ditampilkan (`tampilkanLoading(true)`).
2. Request ke `api/barang.php` dijalankan.
3. Jika `localStorage` **belum berisi data**, data dari API dipakai sebagai data awal dan disimpan ke `localStorage`.
4. Jika `localStorage` **sudah berisi data**, data pengguna dipertahankan dan hasil API tidak menimpanya.
5. Blok `finally` mematikan loading, memperbarui statistik, lalu merender katalog.

Teks "Sumber data: …" di bawah katalog menunjukkan asal data yang sedang tampil: `api/barang.php`, `penyimpanan lokal`, atau `penyimpanan lokal (API tidak tersedia)`.

### 9.3 Penanganan loading dan error

- **Loading:** `#loading` berisi 6 kartu skeleton (`.skeleton-card`) selama request berjalan.
- **Error:** jika request gagal (server mati, bukan JSON, atau sesi `file://`), maka:
  - bila masih ada data di `localStorage`, data lokal ditampilkan disertai toast pemberitahuan;
  - bila tidak ada data lokal, blok `#error-state` muncul dengan pesan kegagalan dan tombol **Coba Lagi** yang memanggil ulang `inisialisasiData()`.
- **Muat Ulang Data:** tombol `#btn-reload` meminta konfirmasi terlebih dahulu bila sudah ada data lokal, lalu mengambil data terbaru dari API secara eksplisit.

### 9.4 Penyimpanan dengan localStorage

- Kunci penyimpanan: `barteryuk.barang.v1`.
- Data disimpan saat data awal dari API dipakai, saat menambah barang, dan saat menghapus barang (`simpanKeStorage`).
- Data dibaca saat halaman dibuka (`muatDariStorage`), sehingga perubahan pengguna tetap ada setelah refresh.
- `localStorage` bersifat **lokal per browser dan per perangkat**: data tidak tersinkron antar browser/perangkat, dan akan hilang bila penyimpanan situs dibersihkan. Jika penyimpanan kosong, katalog kembali memakai data awal dari API.

### 9.5 Draft penawaran (prototipe, lokal)

Alur penawaran barter berjalan sepenuhnya di browser dan **tidak mengirim apa pun ke server**:

1. Dari modal detail, tombol **Ajukan Penawaran Barter** membuka `#modal-penawaran` (modal detail ditutup lebih dulu).
2. Pengguna memilih **barang yang ditawarkan** dari katalog (barang tujuan dikecualikan dari pilihan).
3. Sistem menampilkan **estimasi nilai kedua barang** dan menghitung **perkiraan selisih** (`nilai tujuan − nilai barangmu`). Bila salah satu nilai belum diisi, selisih tidak dihitung dan pengguna diminta bernegosiasi manual.
4. Pengguna memilih **tanpa uang tambahan** (tukar murni) atau **dengan uang tambahan** beserta nominalnya. Nominal disarankan otomatis dari selisih, tetapi tetap bisa diubah karena nilai hanya estimasi.
5. Pengguna meninjau ringkasan pada bagian **Tinjauan penawaran**, lalu menekan **Simpan Draft Penawaran**.
6. Draft disimpan di `localStorage` (kunci `barteryuk.penawaran.v1`) dan muncul pada seksi **Draft Penawaran (Prototipe)**.

Setiap draft disimpan sebagai objek dengan bentuk berikut:

```js
{
  id, waktu,                                   // id unik + timestamp
  target: { id, nama, nilai, kategori },       // barang yang diinginkan
  ditawarkan: { id, nama, nilai, kategori },   // barang yang ditawarkan
  pakaiUang,                                   // true bila pakai uang tambahan
  uang, arahUang,                              // nominal + "kamu" | "pemilik" | null
  selisih                                      // angka, atau null bila nilai belum lengkap
}
```

> **Bukan transaksi.** Draft hanya catatan lokal di perangkat pengguna. Tidak ada pengiriman ke server, tidak ada validasi pihak kedua, dan tidak ada tabel penawaran. Status draft selalu "belum dikirim".

## 10. Pemetaan Materi Week 1–5

> Pemetaan berikut adalah **ringkasan implementasi proyek** terhadap materi yang dibahas pada Week 1–5, bukan klaim bahwa dosen menetapkan silabus resmi yang persis sama. Setiap baris disertai berkas atau fungsi yang benar-benar ada di kode.

### Week 1 — Perencanaan & dokumentasi proyek

| Materi | Implementasi | Status |
| --- | --- | --- |
| Masalah pengguna, solusi, ruang lingkup | Dijelaskan pada bagian [1](#1-latar-belakang)–[3](#3-target-pengguna--ruang-lingkup) dokumen ini | Terbukti (dokumentasi) |
| Daftar fitur & arah pengembangan | Bagian [4](#4-fitur-yang-tersedia) dan [11](#11-batasan-aplikasi-saat-ini) | Terbukti (dokumentasi) |
| Dokumen perencanaan terpisah (proposal, wireframe, user flow) | Tidak ada | Belum diterapkan |

### Week 2 — HTML & CSS

| Materi | Implementasi | Status |
| --- | --- | --- |
| HTML semantic | `index.html`: `header`, `nav`, `main`, `section`, `article`, `footer`, `dl`, `form`; atribut `lang="id"`, meta deskripsi, dan skip link | Terbukti |
| CSS styling & layout | `style.css`: design token di `:root`, CSS Grid (`.grid-container`, `.stats`, `.form-row`), Flexbox (`.header-inner`, `.toolbar`, `.card-footer`, `.modal-actions`) | Terbukti |
| Responsive design | `@media (max-width: 720px)` dan penggunaan `clamp()` untuk ukuran teks | Terbukti sebagian (baru satu breakpoint) |
| Tata letak gambar | Kotak media kartu `aspect-ratio: 4 / 3` + `object-fit: cover`; gambar diposisikan absolut agar tidak mengubah tinggi kartu; placeholder ikon saat gambar gagal dimuat | Terbukti |
| Tidak ada horizontal overflow | Diuji lewat emulasi ukuran viewport (320–1440 px); belum diverifikasi ulang pada perangkat/browser nyata | Terbukti sebagian (emulasi viewport) |
| Aksesibilitas dasar | Skip link, `:focus-visible`, `prefers-reduced-motion`, label form, `aria-live`, `aria-pressed`, focus trap modal, kontras teks diperbaiki | Terbukti sebagian (belum diuji dengan screen reader) |

### Week 3 — JavaScript, DOM, dan event

| Materi | Implementasi | Status |
| --- | --- | --- |
| Variabel, tipe data, operator | `const`/`let`, array of objects, template literal, operator `?.`, `\|\|`, serta ternary `? :` di `script.js` | Terbukti |
| Function | `escapeHTML`, `formatRupiah`, `waktuRelatif`, `ikonKategori`, `debounce`, `buatId`, `templateKartu`, dan lainnya | Terbukti |
| Struktur kontrol | `if/else`, `filter`, `map`, `forEach`, `Object.keys().forEach` | Terbukti (tanpa `for`/`while` klasik) |
| Selektor DOM | `document.querySelector`, `closest()`, `dataset` | Terbukti |
| Event handling | `click`, `input` (debounce), `change`, `keydown` (Enter/Space pada kartu, `Escape`, dan Tab di modal), `submit`, `reset`, serta event delegation pada chip, kartu, dan tombol hapus draft | Terbukti |
| Manipulasi DOM | `innerHTML`, `textContent`, `createElement`, `classList`, `hidden`, `focus()`, `scrollIntoView` | Terbukti |
| Interaksi pengguna | Pencarian langsung, filter kategori, pengurutan, modal detail, form tambah, hapus barang, toast, serta penyusunan penawaran barter (prototipe) | Terbukti |

### Week 4 — Fetch API, JSON, asynchronous, loading, error handling

| Materi | Implementasi | Status |
| --- | --- | --- |
| Fetch API | `fetch(API_URL, ...)` di `ambilDataBarang()` | Terbukti |
| Pemeriksaan respons | `response.ok` dan validasi bentuk data sebelum dirender | Terbukti |
| Parsing JSON | `response.json()` untuk data katalog; `JSON.stringify`/`JSON.parse` untuk `localStorage` | Terbukti |
| `async/await` | `ambilDataBarang()`, `inisialisasiData()`, `tanganiSubmitForm()` | Terbukti |
| `try/catch/finally` | Pada `inisialisasiData()`: error ditangani, loading selalu dimatikan di `finally` | Terbukti |
| Array of objects → DOM | `state.barang` (array objek) dirender lewat `templateKartu` dan `renderDaftarBarang` | Terbukti |
| Loading state | Skeleton `#loading` | Terbukti |
| Error handling | `#error-state` + tombol `#btn-retry`, fallback data lokal, dan pesan toast | Terbukti |
| Memanggil API publik/pihak ketiga | Tidak ada — request hanya ke endpoint PHP di server sendiri | Belum diterapkan |
| Request paralel (`Promise.all`) / pagination server | Tidak ada | Belum diterapkan |

### Week 5 — PHP

| Materi | Implementasi (semua di `api/barang.php`) | Status |
| --- | --- | --- |
| Variabel | `$metode`, `$kategoriMentah`, `$filterKategori`, `$parameter`, `$pdo`, `$sql`, `$stmt`, `$baris`, `$daftarBarang`, `$total` | Terbukti |
| Function | `kirimJSON()` — mengirim respons JSON beserta kode status HTTP | Terbukti |
| Conditional | `if ($metode !== "GET")` → HTTP 405; `if ($total === 0)` → respons data kosong; selain itu → data tersedia | Terbukti |
| Loop | `foreach ($baris as $r)` untuk memetakan tiap baris database ke field yang dipakai frontend | Terbukti |
| Pemrosesan data di server | Menyusun field `waktu` (epoch milidetik dari kolom `dibuat_pada`) dan menyaring berdasarkan parameter `?kategori=` | Terbukti |
| Penanganan galat | `try { … } catch (Throwable $galat)` menangkap galat koneksi/query; detail teknis dicatat lewat `error_log()`, sedangkan klien menerima JSON **generik** (`500`) | Terbukti |
| Output JSON | `header("Content-Type: application/json; charset=utf-8")` + `json_encode()` | Terbukti |
| PHP menghasilkan HTML dinamis | Tidak ada — tampilan tetap `index.html` statis dan data diambil lewat Fetch API | Belum diterapkan |
| Koneksi database (MySQL/PDO) | Dipakai: `api/barang.php` membaca tabel `barang` lewat PDO + prepared statement (baca-saja). Detail di [bagian 12](#12-integrasi-mysql-pdo) | Diterapkan dan teruji (HTTP `200`, memuat 6 barang) |
| Penyimpanan data ke server (POST) / sesi login | Tidak ada — endpoint hanya melayani `GET` | Belum diterapkan |
| `koneksi.php` | Konfigurasi + koneksi PDO MySQL; kredensial dari environment variable / `.env` (tanpa rahasia di kode); di-*include* oleh `api/barang.php` | Terpakai |

### Bagian yang belum terbukti atau belum dapat diverifikasi

- **PHP versi lain:** pada lingkungan ini dijalankan pada PHP 8.5.11 (memuat ekstensi `pdo_mysql`); versi lain belum diuji.
- **Browser lain:** pengujian otomatis dilakukan pada Chrome versi headless; Safari dan Firefox belum diuji.
- **Perangkat asli:** pengujian responsif memakai emulasi ukuran viewport, bukan perangkat fisik.
- **Screen reader:** atribut ARIA dan urutan fokus diperiksa lewat pengujian DOM, bukan dengan pembaca layar sungguhan.
- **Jalur HTTP 500** pada `api/barang.php` diuji dengan mensimulasikan kegagalan koneksi (respons JSON aman, tanpa kebocoran kredensial/DSN); **jalur sukses (HTTP 200 dari MySQL) sudah teruji** dan memuat 6 barang dari tabel `barang`.

## 11. Batasan Aplikasi Saat Ini

1. **Penawaran barter masih prototipe UI (bukan transaksi).** Tombol "Ajukan Penawaran Barter" membuka formulir penawaran, tetapi penawaran **tidak dikirim ke server** dan **tidak divalidasi pihak kedua**. Yang tersimpan hanyalah **draft lokal** di `localStorage` (`barteryuk.penawaran.v1`) yang ditandai "belum dikirim". Belum ada tabel penawaran, notifikasi ke pemilik, maupun status "disetujui/ditolak". Tidak ada pembayaran atau payment gateway.
2. **Nilai barang hanya estimasi.** Setiap nilai pada kartu/detail adalah **estimasi** yang dapat dinegosiasikan dan tidak mengikat. **Harga transaksi yang disepakati** hanya akan ada setelah alur persetujuan kedua pihak tersedia (belum ada), sehingga saat ini selalu ditampilkan "Belum ada".
3. **Katalog dibaca dari MySQL, tetapi endpoint masih baca-saja (read-only).** `api/barang.php` kini mengambil data dari tabel `barang` (PDO + prepared statement). Namun menambah/menghapus barang di frontend masih hanya mengubah data di browser (`localStorage`) dan belum tersimpan ke server; belum ada endpoint `POST`/`DELETE`. Bila database belum dikonfigurasi, katalog menampilkan error state (bukan data contoh statis).
4. **Penyimpanan bersifat lokal per browser.** `localStorage` menyimpan data pada satu browser dan satu perangkat; data tidak tersinkron antar perangkat dan hilang bila penyimpanan situs dibersihkan.
5. **Belum ada autentikasi.** Tidak ada login maupun kepemilikan data, sehingga siapa pun yang membuka halaman dapat menambah dan menghapus barang dari katalognya sendiri.
6. **Belum ada pembaruan data dari server secara otomatis.** Data API dipakai sebagai data awal; sinkronisasi ke data terbaru hanya terjadi bila pengguna menekan tombol **Muat Ulang Data** dan menyetujui konfirmasi.
7. **Penghapusan bersifat permanen di sisi pengguna.** Tidak ada fitur urungkan (undo), dan konfirmasi hapus memakai dialog bawaan browser (`confirm`).
8. **Detail interaksi yang belum sempurna.** Setelah menghapus barang dari modal, fokus keyboard kembali ke halaman (bukan ke kartu lain), karena kartu asal sudah tidak ada.
9. **Gambar barang bawaan memakai ilustrasi lokal.** Data contoh memakai ilustrasi SVG di `assets/images/` (bukan foto asli produk), sehingga katalog tetap tampil tanpa internet. Bila pengguna memasang URL gambar eksternal dan gambar itu gagal dimuat, kotak media menampilkan placeholder (ikon kategori + "Foto belum tersedia") berukuran wajar, bukan kotak kosong besar.

## 12. Integrasi MySQL (PDO)

Katalog kini dibaca dari **database MySQL** melalui **PDO** dengan prepared statement. Berkas yang berperan:

| Berkas | Peran |
| --- | --- |
| `koneksi.php` | Membaca konfigurasi dari environment variable / `.env`, lalu membuat koneksi PDO (`koneksi()` / `koneksiDatabase()`) |
| `api/barang.php` | Endpoint `GET` JSON; query ke tabel `barang`; kontrak `{ ok, total, pesan, data }` dipertahankan |
| `database/schema.sql` | Membuat tabel `barang` (idempoten; tanpa `DROP`/`DELETE`) |
| `database/seed_katalog.sql` | Mengisi 6 barang contoh (idempoten; aman diulang) |
| `.env.example` | Contoh konfigurasi lokal tanpa kredensial (disalin menjadi `.env`) |

> **Status pengujian (jujur):** di lingkungan ini sudah **diuji** — pemeriksaan sintaks (`php -l`), pemuatan konfigurasi `.env`, respons metode salah (`405`), respons gagal-koneksi (`500`, tanpa kebocoran kredensial), dan **jalur sukses (HTTP `200` membaca 6 barang dari tabel `barang` di MySQL)**. Diverifikasi juga bahwa parameter `kategori` bertipe non-string (mis. `?kategori[]=Hobi`) tidak memicu peringatan PHP dan tetap menghasilkan JSON valid. Pengujian browser visual (mis. overflow tata letak) belum diverifikasi ulang di lingkungan ini.

### 12.1 Konfigurasi koneksi (tanpa rahasia di Git)

Kredensial **tidak** ditulis di kode. `koneksi.php` membacanya dari environment variable dengan urutan prioritas: environment asli → berkas `.env` lokal → nilai bawaan (host `127.0.0.1`, port `3306`). PHP **tidak** memuat `.env` otomatis; karena itu `koneksi.php` memuatnya sendiri.

```bash
# 1. Salin contoh, lalu isi kata sandi akun aplikasi (JANGAN di-commit)
cp .env.example .env
#    .env sudah tercantum di .gitignore

# Isi minimal pada .env:
#   BARTERYUK_DB_NAME=barteryuk
#   BARTERYUK_DB_USER=barteryuk_app
#   BARTERYUK_DB_PASS=<kata sandi akun aplikasi>
```

Alternatif tanpa berkas (untuk sesi sementara):

```bash
export BARTERYUK_DB_NAME=barteryuk
export BARTERYUK_DB_USER=barteryuk_app
export BARTERYUK_DB_PASS='<kata sandi>'
```

> Gunakan akun aplikasi `barteryuk_app`, **jangan** `root`. Jangan pernah menulis kata sandi ke berkas yang di-commit.

### 12.2 Membuat tabel & mengisi data contoh

Database `barteryuk` sudah dibuat. Kedua berkas berikut bersifat aditif: hanya menambah tabel/baris, **tidak** menghapus apa pun, dan aman dijalankan berulang.

```bash
# Buat tabel `barang` (idempoten)
mysql -u barteryuk_app -p barteryuk < database/schema.sql

# Isi 6 barang contoh (idempoten, tanpa duplikat)
mysql -u barteryuk_app -p barteryuk < database/seed_katalog.sql
```

Catatan: bila akun aplikasi belum memiliki hak `CREATE` pada database `barteryuk`, mintalah admin memberikannya (mis. `GRANT CREATE, INSERT, SELECT, UPDATE, DELETE ON barteryuk.* TO 'barteryuk_app'@'localhost';`), lalu jalankan ulang perintah di atas.

### 12.3 Menjalankan server PHP

```bash
cd barter-yuk
php -S localhost:8000
```

Buka <http://localhost:8000>.

### 12.4 Menguji endpoint

```bash
# 1. Uji koneksi PDO (tidak mencetak kredensial)
php -r 'require "koneksi.php"; koneksi(); echo "Koneksi OK\n";'

# 2. Katalog lengkap (harus 6 barang)
curl -s http://localhost:8000/api/barang.php

# 3. Filter kategori
curl -s "http://localhost:8000/api/barang.php?kategori=Hobi"

# 4. Metode salah -> 405
curl -s -X POST http://localhost:8000/api/barang.php
```

Perilaku respons: `200` (data, atau hasil filter kosong dengan `total: 0`), `405` (metode selain `GET`, dengan header `Allow: GET`), dan `500` bila konfigurasi/koneksi/query database gagal — selalu berupa JSON **generik**; detail teknis hanya masuk log server (`error_log`). Tidak ada fallback diam-diam ke data statis.

### 12.5 Pemetaan field & kontrak respons

Kontrak respons tetap `{ ok, total, pesan, data }`. Field tiap barang dipetakan dari kolom MySQL:

| Field frontend | Kolom `barang` | Catatan |
| --- | --- | --- |
| `id` | `id` | Teks, mis. `seed-1` (kompatibel dengan ID seed lama) |
| `nama` | `nama` | |
| `kategori` | `kategori` | Dipakai untuk filter `?kategori=` |
| `kondisi` | `kondisi` | |
| `deskripsi` | `deskripsi` | |
| `pemilik` | `pemilik` | |
| `lokasi` | `lokasi` | |
| `nilai` | `nilai_estimasi` | `BIGINT UNSIGNED` (Rupiah bulat, **bukan** `FLOAT`/`DOUBLE`) |
| `gambar` | `gambar` | Path aset lokal, mis. `assets/images/macbook-air-m1.svg` |
| `waktu` | `dibuat_pada` | Dikonversi ke epoch **milidetik** oleh API (`UNIX_TIMESTAMP(...) * 1000`), agar cocok dengan `waktuRelatif()` di `script.js` |

### 12.6 Belum termasuk (tahap berikutnya)

Autentikasi/`users`, endpoint tulis (`POST`/`DELETE` barang), dan alur penawaran server-side (`penawaran`, `riwayat_penawaran`) belum diimplementasikan. Rancangan lengkapnya tersedia di `database/skema.sql`, `database/seed.sql`, dan `database/trigger-opsional.sql` (belum dijalankan). Catatan desain: kolom nilai sengaja dinamai `nilai_estimasi`; **harga transaksi disepakati** sebaiknya disimpan pada kolom/tabel terpisah yang hanya terisi setelah status `disetujui`, agar estimasi tidak tertukar dengan harga final.
