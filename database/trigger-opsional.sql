-- ============================================================================
-- BarterYuk! — Trigger integritas (OPSIONAL)
-- Berkas : database/trigger-opsional.sql
--
-- STATUS: RANCANGAN. Belum dijalankan karena MySQL belum tersedia.
--         Jalankan HANYA setelah database/skema.sql berhasil diimpor, dan
--         verifikasi sintaks pada server MySQL/MariaDB Anda.
--
-- Tujuan: menegakkan aturan yang TIDAK bisa dijaga oleh FOREIGN KEY /
-- CHECK biasa, khususnya:
--   (1) pengguna hanya boleh menawarkan barang MILIKNYA SENDIRI;
--   (2) barang tujuan harus berstatus 'tersedia';
--   (3) id_pemilik_tujuan & snapshot nilai diisi otomatis dan benar;
--   (4) harga_disepakati hanya boleh diisi saat status 'disetujui';
--   (5) setiap perubahan status penawaran tercatat di riwayat_penawaran.
-- ============================================================================

DELIMITER $$

-- ----------------------------------------------------------------------------
-- (1..3) Sebelum INSERT penawaran
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_penawaran_sebelum_insert $$
CREATE TRIGGER trg_penawaran_sebelum_insert
BEFORE INSERT ON penawaran
FOR EACH ROW
BEGIN
    DECLARE v_pemilik_tujuan      BIGINT UNSIGNED;
    DECLARE v_pemilik_ditawarkan  BIGINT UNSIGNED;
    DECLARE v_status_tujuan       VARCHAR(20);
    DECLARE v_status_ditawarkan   VARCHAR(20);

    SELECT id_pemilik, status INTO v_pemilik_tujuan, v_status_tujuan
        FROM barang WHERE id = NEW.id_barang_tujuan;

    SELECT id_pemilik, status INTO v_pemilik_ditawarkan, v_status_ditawarkan
        FROM barang WHERE id = NEW.id_barang_ditawarkan;

    IF v_pemilik_tujuan IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Barang tujuan tidak ditemukan.';
    END IF;
    IF v_pemilik_ditawarkan IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Barang yang ditawarkan tidak ditemukan.';
    END IF;
    IF v_pemilik_ditawarkan <> NEW.id_pengaju THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pengaju hanya boleh menawarkan barang miliknya sendiri.';
    END IF;
    IF NEW.id_barang_tujuan = NEW.id_barang_ditawarkan THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Barang tujuan dan barang yang ditawarkan tidak boleh sama.';
    END IF;
    IF NEW.status IN ('terkirim', 'dilihat')
       AND (v_status_tujuan <> 'tersedia' OR v_status_ditawarkan <> 'tersedia') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Salah satu barang sudah tidak tersedia untuk ditukar.';
    END IF;

    -- Isi otomatis kolom turunan agar selalu konsisten.
    SET NEW.id_pemilik_tujuan = v_pemilik_tujuan;
    SET NEW.nilai_estimasi_tujuan =
        (SELECT nilai_estimasi FROM barang WHERE id = NEW.id_barang_tujuan);
    SET NEW.nilai_estimasi_ditawarkan =
        (SELECT nilai_estimasi FROM barang WHERE id = NEW.id_barang_ditawarkan);
END $$

-- ----------------------------------------------------------------------------
-- (1..4) Sebelum UPDATE penawaran
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_penawaran_sebelum_update $$
CREATE TRIGGER trg_penawaran_sebelum_update
BEFORE UPDATE ON penawaran
FOR EACH ROW
BEGIN
    DECLARE v_pemilik_ditawarkan BIGINT UNSIGNED;

    SELECT id_pemilik INTO v_pemilik_ditawarkan
        FROM barang WHERE id = NEW.id_barang_ditawarkan;

    IF v_pemilik_ditawarkan IS NULL OR v_pemilik_ditawarkan <> NEW.id_pengaju THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pengaju hanya boleh menawarkan barang miliknya sendiri.';
    END IF;
    IF NEW.id_barang_tujuan = NEW.id_barang_ditawarkan THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Barang tujuan dan barang yang ditawarkan tidak boleh sama.';
    END IF;
    IF NEW.harga_disepakati IS NOT NULL AND NEW.status <> 'disetujui' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Harga disepakati hanya boleh diisi saat status disetujui.';
    END IF;
END $$

-- ----------------------------------------------------------------------------
-- (5) Catat perubahan status ke riwayat_penawaran
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_penawaran_setelah_insert $$
CREATE TRIGGER trg_penawaran_setelah_insert
AFTER INSERT ON penawaran
FOR EACH ROW
BEGIN
    INSERT INTO riwayat_penawaran (id_penawaran, status_lama, status_baru, id_aktor, catatan)
    VALUES (NEW.id, NULL, NEW.status, NEW.id_pengaju, 'Penawaran dibuat.');
END $$

DROP TRIGGER IF EXISTS trg_penawaran_setelah_update $$
CREATE TRIGGER trg_penawaran_setelah_update
AFTER UPDATE ON penawaran
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO riwayat_penawaran (id_penawaran, status_lama, status_baru, catatan)
        VALUES (NEW.id, OLD.status, NEW.status, 'Perubahan status.');
    END IF;
END $$

DELIMITER ;
