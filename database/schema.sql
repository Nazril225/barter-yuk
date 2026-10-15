-- ============================================================================
-- BarterYuk! — Migrasi tabel `barang` (katalog)
-- Berkas   : database/schema.sql
-- Target   : MySQL 8.0+ / MySQL 9.x (InnoDB, utf8mb4)
--
-- CAKUPAN
--   Berkas ini HANYA membuat tabel `barang`, karena saat ini satu-satunya
--   kebutuhan backend adalah membaca katalog. Tabel pengguna (`users`) dan
--   transaksi (`penawaran`, `riwayat_penawaran`) BELUM dibuat di sini karena
--   fitur autentikasi & pengiriman penawaran belum diimplementasikan (draft
--   penawaran masih tersimpan di localStorage). Rancangan lengkapnya ada di
--   `skema.sql` (belum dijalankan).
--
-- SIFAT OPERASI
--   - Idempoten & aman diulang: memakai CREATE TABLE IF NOT EXISTS.
--   - TIDAK ada DROP TABLE / DELETE, sehingga data yang sudah ada TIDAK
--     dihapus atau ditimpa.
--
-- PEMETAAN KE FIELD FRONTEND (lihat script.js)
--   id             -> "id"        (teks, mis. "seed-1")
--   nama           -> "nama"
--   kategori       -> "kategori"
--   kondisi        -> "kondisi"
--   deskripsi      -> "deskripsi"
--   pemilik        -> "pemilik"
--   lokasi         -> "lokasi"
--   nilai_estimasi -> "nilai"     (Rupiah BULAT, bukan FLOAT/DOUBLE)
--   gambar         -> "gambar"    (path aset lokal, mis. assets/images/...)
--   dibuat_pada    -> "waktu"     (dikonversi ke epoch milidetik oleh API)
-- ============================================================================

-- Database `barteryuk` sudah dibuat oleh pengguna. Baris USE memudahkan
-- menjalankan berkas ini tanpa menambahkan opsi -D pada klien mysql.
USE barteryuk;

CREATE TABLE IF NOT EXISTS barang (
    -- Primary key berupa teks agar ID seed lama ("seed-1".."seed-6") dan ID
    -- yang dibuat frontend ("barter-...") tetap kompatibel.
    id              VARCHAR(40)     NOT NULL,

    nama            VARCHAR(150)    NOT NULL,
    kategori        VARCHAR(50)     NOT NULL,
    kondisi         VARCHAR(50)     NOT NULL,
    deskripsi       TEXT            NULL,
    pemilik         VARCHAR(80)     NOT NULL,
    lokasi          VARCHAR(80)     NULL,

    -- Nilai ESTIMASI dalam Rupiah bulat. BIGINT UNSIGNED, BUKAN FLOAT/DOUBLE,
    -- agar tidak ada galat pembulatan desimal.
    nilai_estimasi  BIGINT UNSIGNED NOT NULL DEFAULT 0,

    -- Path aset lokal (mis. assets/images/macbook-air-m1.svg) atau URL.
    gambar          VARCHAR(255)    NULL,

    status          ENUM('tersedia', 'ditahan', 'tertukar', 'dihapus')
                                    NOT NULL DEFAULT 'tersedia',

    dibuat_pada     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_barang_status   (status),
    KEY idx_barang_kategori (kategori),
    KEY idx_barang_lokasi   (lokasi),
    KEY idx_barang_dibuat   (dibuat_pada),
    CONSTRAINT chk_barang_nilai CHECK (nilai_estimasi >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
