<?php
/**
 * api/config.example.php — CONTOH konfigurasi database lokal (BarterYuk!)
 *
 * CARA PAKAI:
 *   1. Salin berkas ini menjadi:  api/config.local.php
 *   2. Isi nilainya sesuai instalasi MySQL/MariaDB di komputer Anda.
 *   3. api/config.local.php DIABAIKAN Git (lihat .gitignore) sehingga
 *      kata sandi tidak akan ikut ter-commit.
 *
 * JANGAN pernah menulis kata sandi asli ke berkas contoh ini.
 * Untuk produksi, lebih aman memakai variabel lingkungan
 * (BARTERYUK_DB_HOST, BARTERYUK_DB_PORT, BARTERYUK_DB_NAME,
 *  BARTERYUK_DB_USER, BARTERYUK_DB_PASS) daripada berkas.
 *
 * Berkas ini TIDAK di-include oleh halaman/API mana pun.
 */

return [
    'host'    => '127.0.0.1',
    'port'    => 3306,
    'dbname'  => 'barteryuk',
    'user'    => 'barteryuk_app',          // jangan gunakan 'root' untuk aplikasi
    'pass'    => 'GANTI-DENGAN-SANDI-LOKAL',
    'charset' => 'utf8mb4',
];
