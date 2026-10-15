<?php
/**
 * api/koneksi-db.php — Helper koneksi PDO (BELUM dipakai oleh API/halaman)
 * ==========================================================================
 *
 * Tujuan: menyiapkan koneksi database yang aman TANPA mengubah
 * `api/barang.php` yang masih memakai data statis.
 *
 * Berkas ini SENGAJA TIDAK di-*include* oleh `api/barang.php` ataupun
 * `index.html`, karena database MySQL belum tersedia/teruji di mesin ini.
 * Setelah MySQL terpasang dan skema diimpor (lihat database/README.md),
 * berkas ini dapat mulai dipakai secara bertahap.
 *
 * Keamanan:
 *  - Kredensial dibaca dari variabel lingkungan ATAU berkas lokal
 *    api/config.local.php (tidak di-commit). Tidak ada sandi di repo.
 *  - PDO::ERRMODE_EXCEPTION  -> galat dilaporkan sebagai exception.
 *  - PDO::ATTR_EMULATE_PREPARES => false -> prepared statement asli
 *    (mencegah SQL injection, bukan sekadar menyisipkan string).
 */

declare(strict_types=1);

/**
 * Menyusun konfigurasi koneksi dari (urutan prioritas):
 *   1. Variabel lingkungan BARTERYUK_DB_*
 *   2. Berkas lokal api/config.local.php
 *   3. Nilai bawaan yang aman (localhost, nama db barteryuk)
 *
 * @return array<string, mixed>
 */
function konfigurasiDatabase(): array
{
    $bawaan = [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'dbname'  => 'barteryuk',
        'user'    => '',
        'pass'    => '',
        'charset' => 'utf8mb4',
    ];

    $berkasLokal = __DIR__ . '/config.local.php';
    $dariBerkas  = is_file($berkasLokal) ? require $berkasLokal : [];

    $dariEnv = [];
    foreach (['host', 'port', 'dbname', 'user', 'pass'] as $kunci) {
        $nilai = getenv('BARTERYUK_DB_' . strtoupper($kunci));
        if ($nilai !== false && $nilai !== '') {
            $dariEnv[$kunci] = $nilai;
        }
    }

    $konfig = array_merge(
        $bawaan,
        is_array($dariBerkas) ? $dariBerkas : [],
        $dariEnv
    );

    if ($konfig['user'] === '' || $konfig['dbname'] === '') {
        throw new RuntimeException(
            'Konfigurasi database belum lengkap. Salin api/config.example.php ' .
            'menjadi api/config.local.php, atau set variabel lingkungan BARTERYUK_DB_*.'
        );
    }

    return $konfig;
}

/**
 * Membuat koneksi PDO ke MySQL/MariaDB.
 *
 * Contoh pemakaian (nanti, setelah database siap):
 *   require __DIR__ . '/koneksi-db.php';
 *   $pdo  = koneksiDatabase();
 *   $stmt = $pdo->prepare('SELECT * FROM barang WHERE status = ?');
 *   $stmt->execute(['tersedia']);
 *   $baris = $stmt->fetchAll();
 */
function koneksiDatabase(): PDO
{
    $k = konfigurasiDatabase();

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        (string) $k['host'],
        (int) $k['port'],
        (string) $k['dbname'],
        (string) ($k['charset'] ?? 'utf8mb4')
    );

    return new PDO($dsn, (string) $k['user'], (string) $k['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
}
