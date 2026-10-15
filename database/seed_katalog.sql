-- ============================================================================
-- BarterYuk! — Data katalog awal (seed) untuk tabel `barang`
-- Berkas : database/seed_katalog.sql
--
-- Isi konsisten dengan 6 barang contoh lama di api/barang.php dan
-- assets/images/*.svg, sehingga katalog tidak "kehilangan" data saat
-- berpindah dari array statis ke MySQL.
--
-- AMAN DIULANG (idempoten):
--   Memakai INSERT ... ON DUPLICATE KEY UPDATE berdasarkan PRIMARY KEY `id`.
--   - Dijalankan sekali   -> 6 baris ditambahkan.
--   - Dijalankan lagi     -> TIDAK ada baris duplikat; baris seed diperbarui.
--   - `status` dan `dibuat_pada` sengaja TIDAK ikut diperbarui, sehingga
--     perubahan status oleh pengguna tidak tertimpa saat seed diulang.
--   - Data lain di tabel (mis. barang tambahan pengguna) TIDAK dihapus.
--
-- Sintaks alias baris (`AS new`) didukung MySQL 8.0.19+ (termasuk MySQL 9.x).
-- ============================================================================

USE barteryuk;

INSERT INTO barang
    (id, nama, kategori, kondisi, deskripsi, pemilik, lokasi,
     nilai_estimasi, gambar, status, dibuat_pada)
VALUES
    ('seed-1', 'MacBook Air M1 2020', 'Elektronik', 'Mulus 90%+',
     'Baterai masih sehat 89%, kelengkapan box dan charger original.',
     'Nazril', 'Bandung', 8500000, 'assets/images/macbook-air-m1.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 26 HOUR)),

    ('seed-2', 'Gitar Akustik Yamaha F310', 'Hobi', 'Seperti Baru',
     'Baru dipakai 3 bulan, suara masih jernih tanpa baret berarti.',
     'Dinda', 'Jakarta', 1200000, 'assets/images/gitar-akustik.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 52 HOUR)),

    ('seed-3', 'Sepeda Lipat Pacific Noris', 'Kendaraan', 'Layak Pakai',
     'Sudah servis rutin, siap dipakai harian untuk commuting.',
     'Bagas', 'Surabaya', 2100000, 'assets/images/sepeda-lipat.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 78 HOUR)),

    ('seed-4', 'Buku Pemrograman Web Lengkap', 'Buku & Edukasi', 'Mulus 90%+',
     'Paket 4 buku HTML, CSS, JavaScript, dan PHP. Minim coretan.',
     'Rina', 'Yogyakarta', 450000, 'assets/images/buku-pemrograman.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 96 HOUR)),

    ('seed-5', 'Nintendo Switch Lite', 'Elektronik', 'Seperti Baru',
     'Full box, bonus 2 game fisik dan casing pelindung.',
     'Fajar', 'Semarang', 2800000, 'assets/images/nintendo-switch-lite.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 120 HOUR)),

    ('seed-6', 'Rak Buku Kayu Minimalis', 'Rumah Tangga', 'Mulus 90%+',
     'Kayu jati solid, cocok untuk ruang kerja atau kamar.',
     'Sinta', 'Bandung', 900000, 'assets/images/rak-buku-kayu.svg',
     'tersedia', DATE_SUB(NOW(), INTERVAL 150 HOUR))
AS new
ON DUPLICATE KEY UPDATE
    nama           = new.nama,
    kategori       = new.kategori,
    kondisi        = new.kondisi,
    deskripsi      = new.deskripsi,
    pemilik        = new.pemilik,
    lokasi         = new.lokasi,
    nilai_estimasi = new.nilai_estimasi,
    gambar         = new.gambar;
