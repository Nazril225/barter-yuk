-- ============================================================================
-- BarterYuk! — Skema Database (RANCANGAN)
-- Target   : MySQL 8.0+ / MariaDB 10.5+  (InnoDB, utf8mb4)
-- Berkas   : database/skema.sql
--
-- STATUS PENTING
--   File ini adalah RANCANGAN dan BELUM dijalankan, karena MySQL/MariaDB
--   belum tersedia di komputer pengembang (lihat database/README.md).
--   Jangan menganggap database sudah terhubung hanya karena file ini ada.
--
-- PRINSIP DESAIN
--   * NILAI UANG disimpan sebagai BILANGAN BULAT rupiah (BIGINT UNSIGNED),
--     BUKAN FLOAT/DOUBLE, agar tidak ada galat pembulatan desimal.
--   * Kata sandi disimpan sebagai HASH (password_hash() PHP: bcrypt/argon2),
--     TIDAK PERNAH dalam teks biasa.
--   * Estimasi nilai dan harga transaksi yang DISEPAKATI dipisahkan:
--     `barang.nilai_estimasi` = perkiraan; `penawaran.harga_disepakati`
--     hanya terisi setelah penawaran disetujui.
--   * Nomor urut anak -> induk pada DROP agar mudah mengulang dari nol.
-- ============================================================================

SET NAMES utf8mb4;

-- Hapus dalam urutan aman (anak dahulu) bila ingin membangun ulang.
DROP TABLE IF EXISTS riwayat_penawaran;
DROP TABLE IF EXISTS penawaran;
DROP TABLE IF EXISTS barang;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------------------------
-- users — identitas pengguna
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama            VARCHAR(80)     NOT NULL,
    email           VARCHAR(190)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,           -- hash password_hash(), bukan teks biasa
    lokasi          VARCHAR(80)     NULL,
    status          ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    dibuat_pada     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- collation *_ci membuat email unik tanpa membedakan huruf besar/kecil
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_lokasi (lokasi)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- barang — barang yang dipasang pengguna untuk ditukar
-- ----------------------------------------------------------------------------
CREATE TABLE barang (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pemilik      BIGINT UNSIGNED NOT NULL,
    nama            VARCHAR(150)    NOT NULL,
    kategori        VARCHAR(50)     NOT NULL,
    kondisi         VARCHAR(50)     NOT NULL,
    deskripsi       TEXT            NULL,
    lokasi          VARCHAR(80)     NULL,
    nilai_estimasi  BIGINT UNSIGNED NOT NULL DEFAULT 0,  -- ESTIMASI, bukan harga final
    gambar          VARCHAR(255)    NULL,                -- path aset lokal atau URL
    status          ENUM('tersedia', 'ditahan', 'tertukar', 'dihapus')
                                    NOT NULL DEFAULT 'tersedia',
    dibuat_pada     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_barang_pemilik  (id_pemilik),
    KEY idx_barang_status   (status),
    KEY idx_barang_kategori (kategori),
    KEY idx_barang_lokasi   (lokasi),
    CONSTRAINT fk_barang_pemilik FOREIGN KEY (id_pemilik) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_barang_nilai CHECK (nilai_estimasi >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- penawaran — penawaran barter (murni atau dengan uang tambahan)
--
-- Aturan integritas utama (lihat juga database/trigger-opsional.sql):
--   * id_barang_tujuan <> id_barang_ditawarkan  (tidak boleh barang sama).
--   * id_pemilik_tujuan wajib = pemilik id_barang_tujuan (dijaga trigger).
--   * id_barang_ditawarkan wajib milik id_pengaju (dijaga trigger).
--   * Bila pakai_uang = 0 -> nominal_uang = 0 dan arah_uang = 'tidak_ada'.
--   * harga_disepakati hanya boleh terisi saat status = 'disetujui'.
--   * kunci_aktif mencegah penawaran GANDA yang sama selama masih aktif.
-- ----------------------------------------------------------------------------
CREATE TABLE penawaran (
    id                          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pengaju                  BIGINT UNSIGNED NOT NULL,  -- pengguna yang mengajukan
    id_barang_ditawarkan        BIGINT UNSIGNED NOT NULL,  -- barang milik pengaju
    id_barang_tujuan            BIGINT UNSIGNED NOT NULL,  -- barang yang diminta
    id_pemilik_tujuan           BIGINT UNSIGNED NOT NULL,  -- pemilik barang tujuan (denormalisasi)
    pakai_uang                  TINYINT(1)      NOT NULL DEFAULT 0,
    nominal_uang                BIGINT UNSIGNED NOT NULL DEFAULT 0, -- rupiah bulat
    arah_uang                   ENUM('tidak_ada', 'pengaju', 'pemilik')
                                                NOT NULL DEFAULT 'tidak_ada',
    catatan                     VARCHAR(500)    NULL,
    status                      ENUM('draft', 'terkirim', 'dilihat', 'disetujui',
                                     'ditolak', 'dibatalkan', 'kedaluwarsa')
                                                NOT NULL DEFAULT 'draft',
    nilai_estimasi_tujuan       BIGINT UNSIGNED NOT NULL DEFAULT 0, -- snapshot saat diajukan
    nilai_estimasi_ditawarkan   BIGINT UNSIGNED NOT NULL DEFAULT 0, -- snapshot saat diajukan
    harga_disepakati            BIGINT UNSIGNED NULL,               -- hanya saat status disetujui
    dibuat_pada                 DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP,

    -- Kolom turunan: bernilai kombinasi saat penawaran AKTIF, NULL saat tidak.
    -- Banyak nilai NULL diizinkan pada UNIQUE index -> hanya penawaran aktif
    -- yang dibatasi tidak boleh duplikat.
    kunci_aktif                 VARCHAR(120) GENERATED ALWAYS AS (
        CASE
            WHEN status IN ('terkirim', 'dilihat')
                THEN CONCAT(id_pengaju, '-', id_barang_tujuan, '-', id_barang_ditawarkan)
            ELSE NULL
        END
    ) STORED,

    PRIMARY KEY (id),
    UNIQUE KEY uq_penawaran_aktif (kunci_aktif),
    KEY idx_penawaran_pengaju          (id_pengaju),
    KEY idx_penawaran_pemilik_tujuan   (id_pemilik_tujuan),
    KEY idx_penawaran_barang_tujuan    (id_barang_tujuan),
    KEY idx_penawaran_barang_ditawarkan(id_barang_ditawarkan),
    KEY idx_penawaran_status           (status),
    KEY idx_penawaran_dibuat           (dibuat_pada),
    CONSTRAINT fk_penawaran_pengaju FOREIGN KEY (id_pengaju) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_penawaran_pemilik_tujuan FOREIGN KEY (id_pemilik_tujuan) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_penawaran_barang_tujuan FOREIGN KEY (id_barang_tujuan) REFERENCES barang (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_penawaran_barang_ditawarkan FOREIGN KEY (id_barang_ditawarkan) REFERENCES barang (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_penawaran_barang_berbeda CHECK (id_barang_tujuan <> id_barang_ditawarkan),
    CONSTRAINT chk_penawaran_uang CHECK (
        (pakai_uang = 0 AND nominal_uang = 0 AND arah_uang = 'tidak_ada')
        OR
        (pakai_uang = 1 AND nominal_uang > 0)
    ),
    CONSTRAINT chk_penawaran_harga CHECK (
        harga_disepakati IS NULL OR (status = 'disetujui' AND harga_disepakati >= 0)
    )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- riwayat_penawaran — jejak audit setiap perubahan status penawaran
-- ----------------------------------------------------------------------------
CREATE TABLE riwayat_penawaran (
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_penawaran BIGINT UNSIGNED NOT NULL,
    status_lama  ENUM('draft', 'terkirim', 'dilihat', 'disetujui',
                      'ditolak', 'dibatalkan', 'kedaluwarsa') NULL,
    status_baru  ENUM('draft', 'terkirim', 'dilihat', 'disetujui',
                      'ditolak', 'dibatalkan', 'kedaluwarsa') NOT NULL,
    id_aktor     BIGINT UNSIGNED NULL,   -- siapa yang mengubah (NULL = sistem/kedaluwarsa)
    catatan      VARCHAR(255)    NULL,
    dibuat_pada  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_riwayat_penawaran (id_penawaran),
    KEY idx_riwayat_aktor     (id_aktor),
    CONSTRAINT fk_riwayat_penawaran FOREIGN KEY (id_penawaran) REFERENCES penawaran (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_riwayat_aktor FOREIGN KEY (id_aktor) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
