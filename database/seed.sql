-- ============================================================================
-- BarterYuk! — Data contoh (seed) untuk skema database
-- Berkas : database/seed.sql
--
-- Isi standalone ini konsisten dengan 6 barang contoh pada api/barang.php,
-- sehingga katalog tidak "kehilangan" data saat migrasi ke MySQL nanti.
--
-- PENTING SOAL KATA SANDI:
--   Pemilik contoh di bawah adalah AKUN DEMO katalog, BUKAN akun login.
--   password_hash diisi sentinel '!' (hash yang sengaja TIDAK VALID) agar
--   akun ini tidak dapat dipakai login. Saat pendaftaran/login dibuat,
--   akun nyata akan memakai password_hash() PHP (bcrypt/argon2).
--   Tidak ada kata sandi dalam bentuk teks biasa di berkas ini.
--
-- ID barang dipertahankan 1..6 agar berkorespondensi dengan seed-1..seed-6
-- pada data PHP saat ini (lihat kolom pemetaan di database/README.md).
-- ============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- Pemilik contoh (1..6) — akun demo, tidak bisa login
-- ----------------------------------------------------------------------------
INSERT INTO users (id, nama, email, password_hash, lokasi) VALUES
    (1, 'Nazril', 'nazril@contoh.test',  '!', 'Bandung'),
    (2, 'Dinda',  'dinda@contoh.test',   '!', 'Jakarta'),
    (3, 'Bagas',  'bagas@contoh.test',   '!', 'Surabaya'),
    (4, 'Rina',   'rina@contoh.test',    '!', 'Yogyakarta'),
    (5, 'Fajar',  'fajar@contoh.test',   '!', 'Semarang'),
    (6, 'Sinta',  'sinta@contoh.test',   '!', 'Bandung');

-- ----------------------------------------------------------------------------
-- Barang contoh (id 1..6  <=>  seed-1..seed-6); gambar memakai aset lokal
-- ----------------------------------------------------------------------------
INSERT INTO barang
    (id, id_pemilik, nama, kategori, kondisi, deskripsi, lokasi, nilai_estimasi, gambar, status, dibuat_pada)
VALUES
    (1, 1, 'MacBook Air M1 2020', 'Elektronik', 'Mulus 90%+',
        'Baterai masih sehat 89%, kelengkapan box dan charger original.',
        'Bandung', 8500000, 'assets/images/macbook-air-m1.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 26 HOUR)),

    (2, 2, 'Gitar Akustik Yamaha F310', 'Hobi', 'Seperti Baru',
        'Baru dipakai 3 bulan, suara masih jernih tanpa baret berarti.',
        'Jakarta', 1200000, 'assets/images/gitar-akustik.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 52 HOUR)),

    (3, 3, 'Sepeda Lipat Pacific Noris', 'Kendaraan', 'Layak Pakai',
        'Sudah servis rutin, siap dipakai harian untuk commuting.',
        'Surabaya', 2100000, 'assets/images/sepeda-lipat.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 78 HOUR)),

    (4, 4, 'Buku Pemrograman Web Lengkap', 'Buku & Edukasi', 'Mulus 90%+',
        'Paket 4 buku HTML, CSS, JavaScript, dan PHP. Minim coretan.',
        'Yogyakarta', 450000, 'assets/images/buku-pemrograman.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 96 HOUR)),

    (5, 5, 'Nintendo Switch Lite', 'Elektronik', 'Seperti Baru',
        'Full box, bonus 2 game fisik dan casing pelindung.',
        'Semarang', 2800000, 'assets/images/nintendo-switch-lite.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 120 HOUR)),

    (6, 6, 'Rak Buku Kayu Minimalis', 'Rumah Tangga', 'Mulus 90%+',
        'Kayu jati solid, cocok untuk ruang kerja atau kamar.',
        'Bandung', 900000, 'assets/images/rak-buku-kayu.svg', 'tersedia',
        DATE_SUB(NOW(), INTERVAL 150 HOUR));

-- Selaraskan AUTO_INCREMENT setelah penyisipan id eksplisit.
ALTER TABLE users    AUTO_INCREMENT = 7;
ALTER TABLE barang   AUTO_INCREMENT = 7;
