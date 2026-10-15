# BarterYuk! — Database (Integrasi & Rancangan)

MySQL sudah tersedia dan katalog kini dibaca dari tabel `barang` melalui PDO
(`koneksi.php` + `api/barang.php`). Folder ini berisi (a) migrasi minimal yang
**dipakai sekarang** dan (b) rancangan lengkap yang **belum dijalankan**.

> **Status:** `api/barang.php` membaca data dari MySQL. Bila konfigurasi
> database (`.env`) belum lengkap atau koneksi gagal, endpoint mengembalikan
> HTTP `500` dengan pesan JSON aman — **bukan** data statis.

---

## 1. Berkas di folder ini

| Berkas | Status | Isi |
| --- | --- | --- |
| `schema.sql` | **Dipakai sekarang** | Membuat tabel `barang` (idempoten; tanpa `DROP`/`DELETE`) |
| `seed_katalog.sql` | **Dipakai sekarang** | 6 barang contoh; aman diulang (tanpa duplikat) |
| `skema.sql` | Rancangan (belum dijalankan) | Rancangan 4 tabel: `users`, `barang`, `penawaran`, `riwayat_penawaran` |
| `seed.sql` | Rancangan (belum dijalankan) | Seed untuk rancangan 4 tabel di atas |
| `trigger-opsional.sql` | Rancangan (belum dijalankan) | Trigger integritas untuk rancangan penuh |

Cara menjalankan migrasi minimal (konfigurasi `.env`, buat tabel, seed, uji)
ada di [`../README.md`](../README.md) bagian 12.

Bagian 2 dan seterusnya di bawah ini menjelaskan **rancangan lengkap** (belum
dijalankan) sebagai acuan tahap berikutnya.

---

## 2. Ringkasan skema

- **`users`** — `id`, `nama`, `email` (UNIK), `password_hash` (hash, bukan teks),
  `lokasi`, `status`, stempel waktu.
- **`barang`** — `id_pemilik` (FK → `users`), `nama`, `kategori`, `kondisi`,
  `deskripsi`, `lokasi`, `nilai_estimasi`, `gambar`, `status`
  (`tersedia`/`ditahan`/`tertukar`/`dihapus`), stempel waktu.
- **`penawaran`** — `id_pengaju` (FK), `id_barang_ditawarkan` (FK),
  `id_barang_tujuan` (FK), `id_pemilik_tujuan` (FK), `pakai_uang`,
  `nominal_uang`, `arah_uang`, `catatan`, `status`, snapshot estimasi,
  `harga_disepakati`, stempel waktu.
- **`riwayat_penawaran`** — jejak audit perubahan status (FK ke `penawaran`).

### Mengapa nominal uang memakai `BIGINT UNSIGNED`, bukan `FLOAT`/`DOUBLE`

Nilai rupiah adalah satuan diskrit (tidak ada pecahan sen). Tipe pecahan
biner (`FLOAT`/`DOUBLE`) menimbulkan **galat pembulatan** (mis. `0.1 + 0.2`),
sehingga berbahaya untuk uang. Karena itu seluruh nominal disimpan sebagai
**bilangan bulat rupiah** dengan `BIGINT UNSIGNED`. Jika nanti butuh pecahan
(mis. sen), gunakan `DECIMAL` — tetap bukan `FLOAT`/`DOUBLE`.

### Estimasi vs harga transaksi

- `barang.nilai_estimasi` = **perkiraan** yang dapat dinegosiasikan.
- `penawaran.harga_disepakati` = harga final, **hanya terisi** saat
  `status = 'disetujui'` (dijaga `CHECK` dan trigger opsional).
- Snapshot `nilai_estimasi_tujuan` / `nilai_estimasi_ditawarkan` menyimpan
  estimasi **pada saat** penawaran diajukan, agar riwayat tidak berubah bila
  pemilik mengubah estimasi kemudian.

### Pemetaan id lama → baru

`api/barang.php` memakai id teks `seed-1`..`seed-6`. Pada `seed.sql`, barang
disimpan dengan id angka `1`..`6` pada urutan yang sama:

| id PHP | id `barang` | Nama |
| --- | --- | --- |
| `seed-1` | 1 | MacBook Air M1 2020 |
| `seed-2` | 2 | Gitar Akustik Yamaha F310 |
| `seed-3` | 3 | Sepeda Lipat Pacific Noris |
| `seed-4` | 4 | Buku Pemrograman Web Lengkap |
| `seed-5` | 5 | Nintendo Switch Lite |
| `seed-6` | 6 | Rak Buku Kayu Minimalis |

Frontend memperlakukan `id` sebagai teks, sehingga id angka tetap aman.
Data lama di `localStorage` (ber-id `seed-*`) sebaiknya disegarkan lewat
tombol **Muat Ulang Data** setelah migrasi API, atau dibiarkan memakai
fallback lokal.

---

## 3. Aturan integritas & pencegahannya

| Kasus tidak valid | Cara mencegah |
| --- | --- |
| Menawarkan **barang milik orang lain** | Aplikasi menetapkan `id_pengaju` dari sesi login (bukan dari input klien). Di tingkat DB, trigger `trg_penawaran_sebelum_insert/update` memastikan `barang.id_pemilik = penawaran.id_pengaju`. |
| Menawarkan **barang yang sudah tidak tersedia** | Kolom `barang.status` (`tersedia`/`ditahan`/`tertukar`/`dihapus`) + trigger menolak penawaran berstatus aktif bila salah satu barang ≠ `tersedia`. |
| **Menawarkan barang yang sama** dengan barang tujuan | `CHECK chk_penawaran_barang_berbeda` + trigger. |
| **Penawaran ganda** yang identik & masih aktif | Kolom turunan `kunci_aktif` (berisi kombinasi pengaju+target+ditawarkan **hanya saat status aktif**) dengan `UNIQUE KEY uq_penawaran_aktif`. Banyak nilai `NULL` diizinkan, sehingga penawaran lama yang sudah selesai tidak menghalangi penawaran baru. |
| Uang tambahan tidak konsisten | `CHECK chk_penawaran_uang`: bila `pakai_uang = 0` maka `nominal_uang = 0` & `arah_uang = 'tidak_ada'`; bila `pakai_uang = 1` maka `nominal_uang > 0`. |
| Harga disepakati terisi tanpa persetujuan | `CHECK chk_penawaran_harga` + trigger: hanya boleh terisi saat `status = 'disetujui'`. |
| Menyimpan kata sandi terbaca | Kolom `password_hash` menyimpan hasil `password_hash()` PHP (bcrypt/argon2). Tidak ada teks biasa. Akun demo di `seed.sql` memakai sentinel `'!'` sehingga **tidak bisa login**. |
| Pengguna dihapus saat masih punya barang/penawaran | FK `ON DELETE RESTRICT` pada `barang` & `penawaran`; riwayat memakai `ON DELETE CASCADE`/`SET NULL`. |

> Catatan: MySQL **tidak** bisa melakukan `CHECK` lintas tabel, sehingga
> pemeriksaan “barang milik pengaju” murni dijalankan oleh trigger opsional
> **dan** oleh aplikasi (validasi di server sebelum `INSERT`). Ini pertahanan
> berlapis.

---

## 4. Pemasangan MySQL/MariaDB di macOS (referensi)

> **Status terbaru:** MySQL **sudah terpasang dan berjalan** di lingkungan
> pengembang (Homebrew, `/opt/homebrew`), dan database `barteryuk` serta akun
> `barteryuk_app` sudah dibuat. Langkah pemasangan di bawah ini disimpan
> sebagai referensi bila ingin memasang di komputer lain. **Tidak dijalankan
> otomatis.**

### Opsi A — Homebrew + MySQL (paling umum)

```bash
# 1. Pasang Homebrew (bila belum ada) — menulis ke /opt/homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Pasang & jalankan MySQL
brew install mysql
brew services start mysql

# 3. Amankan instalasi (disarankan)
mysql_secure_installation
```

### Opsi B — Homebrew + MariaDB (pengganti MySQL, kompatibel)

```bash
brew install mariadb
brew services start mariadb
mysql_secure_installation
```

### Opsi C — XAMPP (paling praktis untuk tugas kuliah: Apache + PHP + MySQL)

1. Unduh XAMPP untuk macOS dari <https://www.apachefriends.org>.
2. Pasang, lalu jalankan modul **MySQL** dari panel XAMPP.
3. Letakkan folder proyek di dalam `htdocs`, buka `http://localhost/barter-yuk/`.

### Opsi D — MySQL Community Server (paket resmi / DMG)

Unduh dari <https://dev.mysql.com/downloads/mysql/> lalu jalankan pemasang.
Cocok bila ingin tanpa Homebrew.

---

## 5. Menjalankan migrasi minimal (dipakai sekarang)

Database `barteryuk` dan akun `barteryuk_app` sudah dibuat. Langkah aman
berikut **tidak menghapus data** dan **aman diulang**:

```bash
# 1. Konfigurasi lokal (JANGAN di-commit) — kredensial via .env
cp .env.example .env
# isi pada .env: BARTERYUK_DB_NAME, BARTERYUK_DB_USER, BARTERYUK_DB_PASS
# (opsional BARTERYUK_DB_HOST/PORT). Akun: barteryuk_app (bukan root).

# 2. Buat tabel `barang` (idempoten)
mysql -u barteryuk_app -p barteryuk < database/schema.sql

# 3. Isi 6 barang contoh (idempoten, tanpa duplikat)
mysql -u barteryuk_app -p barteryuk < database/seed_katalog.sql

# 4. Uji koneksi PDO (tidak mencetak kredensial)
php -r 'require "koneksi.php"; koneksi(); echo "Koneksi OK\n";'
```

Bila akun aplikasi belum punya hak `CREATE`, minta admin menjalankan
`GRANT CREATE, INSERT, SELECT, UPDATE, DELETE ON barteryuk.* TO 'barteryuk_app'@'localhost';`.

---

## 6. Rancangan lengkap (belum dikerjakan)

Skema penuh (`users`, `penawaran`, `riwayat_penawaran`) ada di `skema.sql` +
`seed.sql` + `trigger-opsional.sql` dan **belum dijalankan**. Checklist tahap
berikutnya:

1. [x] Pasang MySQL/MariaDB; buat database `barteryuk` + user `barteryuk_app`.
2. [x] Migrasi minimal: `schema.sql` + `seed_katalog.sql`; konfigurasi `.env`.
3. [x] Ubah `api/barang.php` (GET) membaca tabel `barang` — kontrak JSON tetap.
4. [ ] Jalankan & verifikasi jalur sukses (HTTP 200, 6 barang) dengan kredensial DB asli.
5. [ ] Tambah endpoint tulis: barang (POST/DELETE) dan penawaran (POST/GET + setujui/tolak).
6. [ ] Tambah autentikasi & otorisasi (registrasi/login, `password_hash`/`password_verify`, sesi).
7. [ ] Ganti `localStorage` barang & draft agar sinkron ke server; sediakan migrasi data lama.
8. [ ] Uji end-to-end: ajukan → terima/tolak → harga disepakati.

**Jangan melompat ke langkah 6 sebelum langkah 1–5 terverifikasi.**
