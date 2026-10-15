# BarterYuk!

Platform barter barang sederhana: tukar barang yang tidak terpakai dengan barang yang dibutuhkan, tanpa uang tunai.
Proyek ini disusun untuk memenuhi materi Pemrograman Web Week 1–5.

---

## 1. Masalah pengguna

Banyak orang punya barang yang masih layak pakai tetapi sudah tidak dibutuhkan (gadget lama, buku, alat musik, sepeda, dan lain-lain).
Menjualnya sering merepotkan: harus menentukan harga, menunggu pembeli, dan berurusan dengan transaksi uang.
Padahal kebutuhan sebenarnya bisa dipenuhi dengan menukar barang secara langsung.

## 2. Solusi

**BarterYuk!** menyediakan katalog barang barter. Pengguna dapat:

- mencari barang berdasarkan nama, kategori, pemilik, atau kota;
- menyaring katalog per kategori dan mengurutkannya;
- memasang barang miliknya sendiri lengkap dengan detail kondisi;
- membuka detail barang; dan
- mengajukan penawaran barter (masih simulasi, lihat bagian Batasan).

## 3. Target pengguna & ruang lingkup

- **Target pengguna**: mahasiswa dan masyarakat umum yang ingin menukar barang layak pakai tanpa membeli baru.
- **Ruang lingkup**: satu halaman web (katalog + form tambah barang + modal detail). Tidak ada proses login, chat antar pengguna, pembayaran, maupun pengiriman pada tahap ini.

## 4. Fitur yang tersedia

| Fitur | Keterangan |
| --- | --- |
| Katalog barang | Data awal diambil dari endpoint PHP `api/barang.php` (JSON) |
| Live search | Mencari nama barang, kategori, pemilik, dan kota (dengan debounce) |
| Filter kategori | Chip kategori, status aktif ditandai `aria-pressed` |
| Sorting | Terbaru, terlama, nama A–Z, nama Z–A |
| Tambah barang | Form dengan validasi di sisi klien (nama, kategori, kondisi, pemilik, URL gambar, nilai) |
| Detail modal | Menampilkan detail lengkap barang, bisa ditutup via tombol/backdrop/Escape |
| Hapus barang | Menghapus barang dari katalog setelah konfirmasi |
| Toast notification | Umpan balik untuk aksi pengguna |
| Penyimpanan lokal | Perubahan pengguna disimpan di `localStorage` dan bertahan setelah refresh |
| Loading & error state | Skeleton loading saat memuat, serta pesan error + tombol "Coba Lagi" bila API gagal |
| Responsif | Layout adaptif untuk layar kecil sampai besar |

## 5. Teknologi

- HTML semantic (header, main, section, footer, article)
- CSS Grid, Flexbox, dan media query (tanpa framework)
- JavaScript vanilla: DOM API, event handling, array of objects
- Fetch API + `async/await` + `try/catch/finally` untuk memanggil endpoint
- PHP sebagai JSON API (`api/barang.php`) menggunakan variabel, function, `if/else`, `foreach`, dan `json_encode()`
- `localStorage` untuk menyimpan data di perangkat pengguna

Tidak ada database (MySQL/PDO/mysqli), tidak ada dependency eksternal, dan tidak ada tools build.

## 6. Cara menjalankan

Aplikasi memakai Fetch API, jadi **harus dijalankan lewat server**, bukan dibuka langsung sebagai `file://`.

```bash
# dari folder proyek (folder yang berisi index.html)
php -S localhost:8000
```

Lalu buka <http://localhost:8000> di browser.

Endpoint data bisa dicek langsung:

- <http://localhost:8000/api/barang.php> → seluruh data katalog
- <http://localhost:8000/api/barang.php?kategori=Hobi> → hanya kategori Hobi (contoh `foreach` + `if` di PHP)

## 7. Alur data

1. Browser memuat `index.html`.
2. `script.js` memanggil `fetch("api/barang.php")`.
3. Jika **belum ada data tersimpan** di `localStorage`, data dari API dipakai sebagai data awal dan disimpan.
4. Jika **sudah ada data tersimpan**, data lokal dipertahankan (API tidak menimpa perubahan pengguna secara diam-diam).
5. Tombol **Muat Ulang Data** mengambil data terbaru dari API, dengan konfirmasi sebelum menimpa data lokal.
6. Jika API gagal:
   - ada data lokal → data lokal dipakai dan UI menyebut sumbernya "penyimpanan lokal";
   - tidak ada data lokal → muncul error state dan tombol **Coba Lagi**.

Sumber data yang sedang ditampilkan selalu ditulis di bawah katalog ("Sumber data: …").

Informasi teknis: request kedua dan seterusnya ke `api/barang.php` akan tercatat di tab Network browser (status 200) walaupun data lokal yang ditampilkan.

## 8. Batasan saat ini

- **Penawaran barter masih simulasi.** Tombol "Ajukan Penawaran Barter" hanya menampilkan notifikasi; belum ada data penawaran yang disimpan atau dikirim ke server.
- Data katalog pada `api/barang.php` masih berupa array statis di dalam file PHP. Belum ada database, dan tidak ada klaim koneksi database apa pun.
- Belum ada autentikasi/pemilik akun, jadi siapa pun yang membuka halaman dapat menambah atau menghapus barang.
- Data pengguna disimpan per browser (`localStorage`), sehingga tidak tersinkron antar perangkat.

## 9. Struktur file

```
barter-yuk/
├── index.html      # Halaman utama (katalog, form tambah, modal detail)
├── style.css       # Seluruh tampilan dan layout responsif
├── script.js       # Fetch API, DOM, event, validasi, localStorage
├── api/
│   └── barang.php  # Endpoint JSON katalog (PHP)
├── koneksi.php     # Variabel & function PHP latihan (tidak dipakai index.html)
└── README.md
```
