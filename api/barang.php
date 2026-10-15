<?php
/**
 * api/barang.php — Endpoint JSON katalog BarterYuk!
 *
 * Sumber data: tabel `barang` di MySQL (via PDO + prepared statements).
 * Tidak ada lagi array statis di dalam berkas ini.
 *
 * Kontrak respons (DIPERTAHANKAN agar script.js tidak perlu diubah):
 *   sukses : { ok: true,  total: <int>, pesan: <string>, data: [ ... ] }
 *   kosong : { ok: true,  total: 0,      pesan: <string>, data: [] }
 *   salah  : { ok: false, pesan: <string> }               (405 / 500)
 *
 * Field tiap barang persis seperti yang dipakai frontend:
 *   id, nama, kategori, kondisi, deskripsi, pemilik, lokasi, nilai, gambar, waktu
 *   - "nilai" = kolom nilai_estimasi (Rupiah bulat).
 *   - "waktu" = epoch MILIDETIK, dihitung dari kolom dibuat_pada agar
 *     kompatibel dengan waktuRelatif() di script.js.
 *
 * Keamanan:
 *   - Filter kategori memakai prepared statement (parameter terikat),
 *     bukan penggabungan string.
 *   - Galat koneksi/query TIDAK dibocorkan ke klien; detail teknis hanya
 *     ditulis ke log server (error_log). Klien menerima pesan generik.
 *   - TIDAK ada fallback diam-diam ke data statis bila database gagal.
 */

declare(strict_types=1);

// Semua keluaran memakai tipe konten JSON
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../koneksi.php';

/** Mengirim respons JSON dengan status HTTP tertentu lalu berhenti. */
function kirimJSON(int $kodeStatus, array $isi): void
{
    http_response_code($kodeStatus);
    echo json_encode($isi, JSON_UNESCAPED_UNICODE);
    exit;
}

$metode = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Hanya GET yang didukung (405 untuk metode lain).
if ($metode !== 'GET') {
    header('Allow: GET');
    kirimJSON(405, [
        'ok'    => false,
        'pesan' => 'Metode ' . $metode . ' tidak didukung. Gunakan GET.',
    ]);
}

$filterKategori = trim((string) ($_GET['kategori'] ?? ''));

try {
    $pdo = koneksi();

    $sql = 'SELECT id, nama, kategori, kondisi, deskripsi, pemilik, lokasi, '
         . 'nilai_estimasi, gambar, UNIX_TIMESTAMP(dibuat_pada) AS detik '
         . 'FROM barang WHERE status = :status';
    $parameter = ['status' => 'tersedia'];

    if ($filterKategori !== '') {
        $sql .= ' AND kategori = :kategori';
        $parameter['kategori'] = $filterKategori;
    }

    $sql .= ' ORDER BY dibuat_pada DESC, id ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($parameter);
    $baris = $stmt->fetchAll();

    // Susun field agar sama persis dengan yang dipakai frontend.
    $daftarBarang = [];
    foreach ($baris as $r) {
        $daftarBarang[] = [
            'id'        => (string) $r['id'],
            'nama'      => (string) $r['nama'],
            'kategori'  => (string) $r['kategori'],
            'kondisi'   => (string) $r['kondisi'],
            'deskripsi' => (string) ($r['deskripsi'] ?? ''),
            'pemilik'   => (string) $r['pemilik'],
            'lokasi'    => (string) ($r['lokasi'] ?? ''),
            'nilai'     => (int) $r['nilai_estimasi'],
            'gambar'    => (string) ($r['gambar'] ?? ''),
            'waktu'     => ((int) $r['detik']) * 1000,
        ];
    }

    $total = count($daftarBarang);

    if ($total === 0) {
        kirimJSON(200, [
            'ok'    => true,
            'total' => 0,
            'pesan' => $filterKategori !== ''
                ? 'Tidak ada barang yang cocok dengan filter.'
                : 'Belum ada barang pada katalog.',
            'data'  => [],
        ]);
    }

    kirimJSON(200, [
        'ok'    => true,
        'total' => $total,
        'pesan' => 'Data katalog berhasil dimuat dari database.',
        'data'  => $daftarBarang,
    ]);
} catch (Throwable $galat) {
    // Detail teknis hanya ke log server, TIDAK ke klien.
    error_log('[BarterYuk][barang.php] ' . $galat->getMessage());
    kirimJSON(500, [
        'ok'    => false,
        'pesan' => 'Data katalog gagal dimuat. Silakan coba lagi beberapa saat lagi.',
    ]);
}
