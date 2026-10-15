<?php
declare(strict_types=1);

/**
 * koneksi.php — Konfigurasi & koneksi database PDO untuk BarterYuk!
 * ==================================================================
 *
 * Peran berkas ini:
 *   - Menyediakan fungsi koneksiDatabase()/koneksi() berbasis PDO ke MySQL.
 *   - Membaca kredensial dari ENVIRONMENT VARIABLE, bukan kode.
 *
 * PENTING SOAL KONFIGURASI
 *   PHP TIDAK otomatis memuat berkas `.env`. Karena proyek ini tanpa
 *   Composer/framework, berkas ini memuat `.env` sendiri lewat fungsi
 *   muatEnvLokal() (format sederhana KEY=VALUE). Urutan prioritas:
 *     1) environment variable asli (mis. dari `export VAR=...` atau
 *        konfigurasi web server) -> SELALU MENANG;
 *     2) berkas `.env` di folder proyek (diabaikan Git);
 *     3) nilai bawaan aman (host 127.0.0.1, port 3306).
 *
 *   Jadi, ada dua cara mengonfigurasi secara lokal:
 *     a) Buat `.env` dari `.env.example`, ATAU
 *     b) `export BARTERYUK_DB_PASS=...` sebelum menjalankan PHP.
 *
 * KEAMANAN
 *   - Tidak ada kata sandi yang ditulis di kode/repositori.
 *   - PDO::ERRMODE_EXCEPTION  -> galat dilaporkan sebagai exception.
 *   - PDO::ATTR_EMULATE_PREPARES => false -> prepared statement asli
 *     (mencegah SQL injection, bukan sekadar menyisipkan string).
 *   - JANGAN memakai akun `root` untuk aplikasi; pakai `barteryuk_app`.
 */

/**
 * Memuat berkas `.env` lokal bila ada.
 *
 * Environment variable asli TIDAK ditimpa. Baris komentar (#) dan baris
 * kosong dilewati. Nilai boleh dikutip ganda/tunggal.
 */
function muatEnvLokal(string $berkas): void
{
    if (!is_file($berkas) || !is_readable($berkas)) {
        return;
    }

    $baris = file($berkas, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($baris === false) {
        return;
    }

    foreach ($baris as $satuBaris) {
        $satuBaris = trim($satuBaris);
        if ($satuBaris === '' || $satuBaris[0] === '#') {
            continue;
        }

        $posisi = strpos($satuBaris, '=');
        if ($posisi === false) {
            continue;
        }

        $kunci = trim(substr($satuBaris, 0, $posisi));
        if ($kunci === '') {
            continue;
        }

        $nilai = trim(substr($satuBaris, $posisi + 1));
        $panjang = strlen($nilai);
        if ($panjang >= 2) {
            $awal   = $nilai[0];
            $akhir  = $nilai[$panjang - 1];
            if (($awal === '"' && $akhir === '"') || ($awal === "'" && $akhir === "'")) {
                $nilai = substr($nilai, 1, -1);
            }
        }

        // Hanya isi bila belum ada di environment asli.
        if (getenv($kunci) === false) {
            putenv($kunci . '=' . $nilai);
            $_ENV[$kunci] = $nilai;
        }
    }
}

muatEnvLokal(__DIR__ . '/.env');

/**
 * Menyusun konfigurasi koneksi dari environment variable.
 *
 * @return array{host:string,port:int,dbname:string,user:string,pass:string,charset:string}
 * @throws RuntimeException bila kredensial wajib belum diisi.
 */
function konfigurasiDb(): array
{
    $host = getenv('BARTERYUK_DB_HOST');
    $port = getenv('BARTERYUK_DB_PORT');
    $nama = getenv('BARTERYUK_DB_NAME');
    $user = getenv('BARTERYUK_DB_USER');
    $pass = getenv('BARTERYUK_DB_PASS');

    $konfig = [
        'host'    => ($host !== false && $host !== '') ? $host : '127.0.0.1',
        'port'    => ($port !== false && $port !== '') ? (int) $port : 3306,
        'dbname'  => ($nama !== false) ? $nama : '',
        'user'    => ($user !== false) ? $user : '',
        'pass'    => ($pass !== false) ? $pass : '',
        'charset' => 'utf8mb4',
    ];

    // Kunci PASSWORD harus benar-benar diset (boleh berisi string kosong),
    // supaya kita tidak diam-diam terhubung tanpa sandi.
    if ($konfig['dbname'] === '' || $konfig['user'] === '' || $pass === false) {
        throw new RuntimeException(
            'Konfigurasi database belum lengkap. Salin .env.example menjadi .env lalu isi ' .
            'BARTERYUK_DB_NAME, BARTERYUK_DB_USER, dan BARTERYUK_DB_PASS; atau set ' .
            'environment variable dengan nama yang sama (opsional BARTERYUK_DB_HOST/PORT).'
        );
    }

    return $konfig;
}

/**
 * Membuat koneksi PDO ke MySQL.
 *
 * Contoh pemakaian:
 *   require_once __DIR__ . '/koneksi.php';
 *   $pdo  = koneksi();
 *   $stmt = $pdo->prepare('SELECT * FROM barang WHERE kategori = ?');
 *   $stmt->execute(['Hobi']);
 *   $baris = $stmt->fetchAll();
 */
function koneksi(): PDO
{
    $k = konfigurasiDb();

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $k['host'],
        $k['port'],
        $k['dbname'],
        $k['charset']
    );

    return new PDO($dsn, $k['user'], $k['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
}

/**
 * Alias agar berkas lama (api/koneksi-db.php) dan pemanggil lama tetap
 * kompatibel. Disarankan memakai koneksi() untuk kode baru.
 */
function koneksiDatabase(): PDO
{
    return koneksi();
}
