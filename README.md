# BarterYuk!

**Platform barter barang** — tukar barang yang tidak terpakai dengan barang yang dibutuhkan, tanpa uang tunai.

Aplikasi web satu halaman yang terdiri dari katalog barang, form tambah barang, dan modal detail. Data katalog disajikan oleh endpoint JSON PHP (`api/barang.php`) dan diambil dari browser memakai Fetch API.

| Informasi | Keterangan |
| --- | --- |
| Nama proyek | BarterYuk! |
| Jenis | Aplikasi web statis (HTML/CSS/JavaScript) + JSON API PHP |
| Konteks | Tugas mata kuliah Pemrograman Web, mengacu materi Week 1–5 |
| Penyusun | *isi nama & NIM* |
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

---

## 1. Latar Belakang

Banyak orang menyimpan barang yang masih layak pakai tetapi sudah tidak dibutuhkan, misalnya gadget lama, buku pelajaran, alat musik, atau sepeda.
Menjual barang seperti itu sering merepotkan: harus menentukan harga, menunggu pembeli, dan berurusan dengan transaksi uang.

Padahal kebutuhan pengguna sering kali bisa dipenuhi dengan **menukar barang secara langsung** dengan orang lain yang membutuhkan barang tersebut.

## 2. Solusi yang Ditawarkan

**BarterYuk!** menyediakan satu halaman katalog tempat pengguna dapat:

- melihat daftar barang yang sedang ditawarkan untuk ditukar;
- mencari barang berdasarkan nama, kategori, pemilik, atau kota;
- menyaring katalog per kategori dan mengurutkannya;
- memasang barang miliknya sendiri lengkap dengan detail kondisi;
- membuka detail barang melalui modal; dan
- menekan tombol ajukan penawaran barter (masih berupa simulasi, lihat [Batasan Aplikasi](#11-batasan-aplikasi-saat-ini)).

## 3. Target Pengguna & Ruang Lingkup

**Target pengguna:** mahasiswa dan masyarakat umum yang ingin menukar barang layak pakai tanpa harus membeli barang baru.

**Termasuk dalam ruang lingkup:**

- satu halaman web (`index.html`) dengan katalog, form tambah barang, dan modal detail;
- interaksi di sisi browser: pencarian, filter, pengurutan, validasi form, hapus barang, notifikasi;
- penyimpanan data pengguna di `localStorage` browser;
- satu endpoint JSON PHP (`api/barang.php`) sebagai sumber data katalog.

**Di luar ruang lingkup (belum dibuat):**

- login, akun pengguna, dan hak akses;
- chat antar pengguna, proses negosiasi, dan riwayat penawaran;
- database, unggah gambar, pembayaran, dan pengiriman barang;
- penyimpanan data di sisi server (endpoint hanya membaca data contoh).

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
| Modal detail | Menampilkan gambar/ikon, kondisi, deskripsi, pemilik, lokasi, nilai, waktu, dan ID barang | `index.html` (`#modal-detail`), `script.js` (`bukaModal`, `tutupModal`) |
| Hapus barang | Menghapus barang dari katalog setelah konfirmasi | `script.js` (`#btn-hapus-modal`) |
| Notifikasi (toast) | Umpan balik untuk aksi berhasil, gagal, atau info | `script.js` (`tampilkanToast`), `style.css` (`.toast`) |
| Penyimpanan lokal | Perubahan pengguna disimpan di `localStorage` dan bertahan setelah refresh | `script.js` (`simpanKeStorage`, `muatDariStorage`, kunci `barteryuk.barang.v1`) |
| Loading state | Skeleton loading saat data sedang dimuat | `index.html` (`#loading`), `script.js` (`tampilkanLoading`) |
| Error state | Pesan kegagalan + tombol "Coba Lagi" bila endpoint tidak dapat diakses | `index.html` (`#error-state`, `#btn-retry`), `script.js` (`tampilkanErrorState`) |
| Empty state | Pesan khusus bila hasil pencarian/filter kosong | `index.html` (`#empty-state`) |
| Fallback gambar | Jika gambar gagal dimuat, kartu menampilkan ikon kategori sebagai pengganti | `script.js` (`pasangFallbackGambar`) |
| Aksesibilitas dasar | Skip link, label form, `aria-live`, `aria-pressed` pada chip, focus trap di modal, dukungan `prefers-reduced-motion` | `index.html`, `style.css`, `script.js` |
| Responsif | Layout adaptif (Grid/Flexbox) dengan satu breakpoint di 720 px | `style.css` (`@media (max-width: 720px)`) |

**Contoh data:** katalog awal berisi 6 barang contoh (MacBook Air M1 2020, Gitar Akustik Yamaha F310, Sepeda Lipat Pacific Noris, Buku Pemrograman Web Lengkap, Nintendo Switch Lite, Rak Buku Kayu Minimalis) yang tersebar pada 8 kategori, dengan 5 pilihan kondisi.

## 5. Teknologi yang Digunakan

| Lapisan | Teknologi |
| --- | --- |
| Struktur | HTML semantic (`header`, `nav`, `main`, `section`, `article`, `footer`, `dl`, `form`) dan modal berbasis `div` dengan `role="dialog"` |
| Tampilan | CSS murni: design token (`:root`), CSS Grid, Flexbox, media query, `clamp()`; tanpa framework |
| Interaksi | JavaScript vanilla: DOM API, event handling, debounce, array of objects, `Intl.NumberFormat` |
| Data dari server | Fetch API, `async/await`, `response.ok`, `response.json()`, `try/catch/finally` |
| Backend | PHP sebagai JSON API (`api/barang.php`): variabel, function, `if/elseif/else`, `foreach`, `json_encode()`, header `Content-Type: application/json` |
| Penyimpanan | `localStorage` (data pengguna di browser) |

Tidak ada database, tidak ada framework, tidak ada dependency eksternal, dan tidak ada proses build.

## 6. Struktur Folder

```
barter-yuk/                  # folder proyek (berisi index.html)
├── index.html               # Halaman utama: hero, katalog, form tambah, modal detail, toast
├── style.css                # Design token, layout Grid/Flexbox, komponen, media query
├── script.js                # Fetch API, state, render kartu, event, validasi, localStorage
├── api/
│   └── barang.php           # Endpoint JSON katalog (PHP) — satu-satunya berkas PHP yang diakses halaman
├── koneksi.php              # Latihan variabel & function PHP; TIDAK dipakai oleh index.html
└── README.md                # Dokumentasi proyek ini
```

`koneksi.php` sengaja dipertahankan sebagai berkas latihan materi PHP. Berkas ini tidak di-*include* maupun dipanggil oleh halaman, dan tidak berisi koneksi database apa pun.

## 7. Prasyarat & Cara Menjalankan

**Prasyarat:**

- **PHP 7.1 atau lebih baru** (disarankan PHP 8.x). Proyek ini diuji memakai PHP 8.4.23.
  PHP versi 7.1+ dibutuhkan karena `api/barang.php` memakai `??`, type hint `array`, serta return type `int` dan `void`.
- Browser modern (Chrome, Edge, Firefox, atau Safari versi terbaru).
- Koneksi internet **opsional** — hanya dibutuhkan untuk memuat foto contoh dari Unsplash. Bila gambar gagal dimuat (tanpa internet atau URL salah), kartu menampilkan ikon kategori sebagai pengganti. Karena gambar memakai `loading="lazy"`, penggantian ikon terjadi saat browser mulai mencoba memuat gambar tersebut.

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
  "pesan": "Data katalog berhasil dimuat dari api/barang.php.",
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
      "gambar": "https://images.unsplash.com/...",
      "waktu": "<timestamp_milidetik>"
    }
  ]
}
```

Perilaku yang diterapkan di `api/barang.php`:

- `200` — data berhasil dikirim (termasuk saat hasil filter kosong, dengan `"data": []` dan `"total": 0`);
- `405` — metode selain `GET` (mis. `POST`), disertai header `Allow: GET`;
- `500` — dijaga oleh kode untuk kasus `json_encode()` gagal. Jalur ini tidak dipicu saat pengujian karena data contoh selalu dapat diubah menjadi JSON.

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
| Tidak ada horizontal overflow | Diuji pada lebar 320, 375, 768, 1024, dan 1440 piksel | Terbukti (pengujian browser) |
| Aksesibilitas dasar | Skip link, `:focus-visible`, `prefers-reduced-motion`, label form, `aria-live`, `aria-pressed`, focus trap modal, kontras teks diperbaiki | Terbukti sebagian (belum diuji dengan screen reader) |

### Week 3 — JavaScript, DOM, dan event

| Materi | Implementasi | Status |
| --- | --- | --- |
| Variabel, tipe data, operator | `const`/`let`, array of objects, template literal, operator `?.`, `\|\|`, serta ternary `? :` di `script.js` | Terbukti |
| Function | `escapeHTML`, `formatRupiah`, `waktuRelatif`, `ikonKategori`, `debounce`, `buatId`, `templateKartu`, dan lainnya | Terbukti |
| Struktur kontrol | `if/else`, `filter`, `map`, `forEach`, `Object.keys().forEach` | Terbukti (tanpa `for`/`while` klasik) |
| Selektor DOM | `document.querySelector`, `closest()`, `dataset` | Terbukti |
| Event handling | `click`, `input` (debounce), `change`, `keydown` (Enter/Space pada kartu, `Escape`, dan Tab di modal), `submit`, `reset`, serta event delegation pada chip dan kartu | Terbukti |
| Manipulasi DOM | `innerHTML`, `textContent`, `createElement`, `classList`, `hidden`, `focus()`, `scrollIntoView` | Terbukti |
| Interaksi pengguna | Pencarian langsung, filter kategori, pengurutan, modal detail, form tambah, hapus barang, toast | Terbukti |

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
| Variabel | `$databaseBarang`, `$metode`, `$filterKategori`, `$daftarBarang`, `$isiRespons`, `$json` | Terbukti |
| Function | `hitungTotalBarang()`, `timestampJamLalu()`, `kirimJSON()` — semuanya dipanggil | Terbukti |
| Conditional | `if ($metode !== "GET")` → HTTP 405, `elseif (hitungTotalBarang(...) === 0)` → data kosong, `else` → data tersedia, plus pemeriksaan gagal `json_encode()` → HTTP 500 | Terbukti |
| Loop | `foreach ($databaseBarang as $barang)` untuk menyusun data dan menyaring kategori | Terbukti |
| Pemrosesan data di server | Menambahkan field `waktu` (timestamp) dan menyaring berdasarkan parameter `?kategori=` | Terbukti |
| Output JSON | `header("Content-Type: application/json; charset=utf-8")` + `json_encode()` | Terbukti |
| PHP menghasilkan HTML dinamis | Tidak ada — tampilan tetap `index.html` statis dan data diambil lewat Fetch API | Belum diterapkan |
| Koneksi database (MySQL/PDO/mysqli) | Tidak ada dan tidak dipakai. Data masih array statis di dalam berkas PHP | Belum diterapkan (sesuai kebutuhan tugas) |
| Penyimpanan data ke server (POST) / sesi login | Tidak ada — endpoint hanya melayani `GET` | Belum diterapkan |
| `koneksi.php` | Berisi latihan variabel (`$namaPlatform`, `$tahunRilis`, `$statusKoneksi`) dan function `hitungTotalBarang()`, tetapi tidak di-*include* halaman | Tidak terpakai |

### Bagian yang belum terbukti atau belum dapat diverifikasi

- **PHP versi lain:** pengujian hanya dilakukan pada PHP 8.4.23; versi lain belum diuji.
- **Browser lain:** pengujian otomatis dilakukan pada Chrome versi headless; Safari dan Firefox belum diuji.
- **Perangkat asli:** pengujian responsif memakai emulasi ukuran viewport, bukan perangkat fisik.
- **Screen reader:** atribut ARIA dan urutan fokus diperiksa lewat pengujian DOM, bukan dengan pembaca layar sungguhan.
- **Jalur HTTP 500** pada `api/barang.php` hanya dijaga oleh kode dan tidak dipicu saat pengujian.

## 11. Batasan Aplikasi Saat Ini

1. **Penawaran barter masih simulasi.** Tombol "Ajukan Penawaran Barter" pada modal hanya menampilkan notifikasi. Penawaran tidak disimpan, tidak dikirim ke server, dan tidak muncul kembali setelah refresh. Belum ada tabel penawaran.
2. **Data katalog API masih statis.** `api/barang.php` berisi array contoh 6 barang di dalam berkas PHP. Tidak ada database dan tidak ada klaim koneksi database. Menambah/menghapus data hanya mengubah data di browser, bukan data di server.
3. **Penyimpanan bersifat lokal per browser.** `localStorage` menyimpan data pada satu browser dan satu perangkat; data tidak tersinkron antar perangkat dan hilang bila penyimpanan situs dibersihkan.
4. **Belum ada autentikasi.** Tidak ada login maupun kepemilikan data, sehingga siapa pun yang membuka halaman dapat menambah dan menghapus barang dari katalognya sendiri.
5. **Belum ada pembaruan data dari server secara otomatis.** Data API dipakai sebagai data awal; sinkronisasi ke data terbaru hanya terjadi bila pengguna menekan tombol **Muat Ulang Data** dan menyetujui konfirmasi.
6. **Penghapusan bersifat permanen di sisi pengguna.** Tidak ada fitur urungkan (undo), dan konfirmasi hapus memakai dialog bawaan browser (`confirm`).
7. **Detail interaksi yang belum sempurna.** Setelah menghapus barang dari modal, fokus keyboard kembali ke halaman (bukan ke kartu lain), karena kartu asal sudah tidak ada.
8. **Foto contoh berasal dari Unsplash.** Bila gambar tidak dapat dimuat (misalnya tanpa koneksi internet atau URL gambar salah), kartu menampilkan ikon kategori sebagai pengganti. Karena gambar dimuat secara *lazy*, penggantian ikon baru terjadi saat gambar tersebut masuk ke area layar.
