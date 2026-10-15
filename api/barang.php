<?php
/**
 * api/barang.php — Endpoint JSON katalog BarterYuk!
 *
 * Week 5 (PHP):
 *  - variabel
 *  - function (hitungTotalBarang, timestampJamLalu, kirimJSON)
 *  - conditional if/elseif/else untuk penanganan kondisi request & data
 *  - loop foreach untuk memproses data barang
 *  - json_encode() + header Content-Type: application/json
 *  - status HTTP yang sesuai bila terjadi kesalahan (405 / 500)
 *
 * Sumber data: array statis di file ini. Belum terhubung ke database
 * (tidak ada MySQL/PDO/mysqli).
 */

// Semua keluaran memakai tipe konten JSON
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/** Menghitung jumlah data barang. */
function hitungTotalBarang(array $daftarBarang): int
{
    return count($daftarBarang);
}

/** Mengubah "berapa jam lalu" menjadi timestamp milidetik seperti katalog. */
function timestampJamLalu(int $jam): int
{
    return (int) floor(microtime(true) * 1000) - ($jam * 60 * 60 * 1000);
}

/** Mengirim respons JSON dengan status HTTP tertentu lalu berhenti. */
function kirimJSON(int $kodeStatus, array $isi): void
{
    http_response_code($kodeStatus);
    echo json_encode($isi, JSON_UNESCAPED_UNICODE);
}

// Data contoh BarterYuk! — konsisten dengan katalog saat aplikasi pertama dibuka
$databaseBarang = [
    [
        "id" => "seed-1",
        "nama" => "MacBook Air M1 2020",
        "kategori" => "Elektronik",
        "kondisi" => "Mulus 90%+",
        "deskripsi" => "Baterai masih sehat 89%, kelengkapan box dan charger original.",
        "pemilik" => "Nazril",
        "lokasi" => "Bandung",
        "nilai" => 8500000,
        "gambar" => "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 26,
    ],
    [
        "id" => "seed-2",
        "nama" => "Gitar Akustik Yamaha F310",
        "kategori" => "Hobi",
        "kondisi" => "Seperti Baru",
        "deskripsi" => "Baru dipakai 3 bulan, suara masih jernih tanpa baret berarti.",
        "pemilik" => "Dinda",
        "lokasi" => "Jakarta",
        "nilai" => 1200000,
        "gambar" => "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 52,
    ],
    [
        "id" => "seed-3",
        "nama" => "Sepeda Lipat Pacific Noris",
        "kategori" => "Kendaraan",
        "kondisi" => "Layak Pakai",
        "deskripsi" => "Sudah servis rutin, siap dipakai harian untuk commuting.",
        "pemilik" => "Bagas",
        "lokasi" => "Surabaya",
        "nilai" => 2100000,
        "gambar" => "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 78,
    ],
    [
        "id" => "seed-4",
        "nama" => "Buku Pemrograman Web Lengkap",
        "kategori" => "Buku & Edukasi",
        "kondisi" => "Mulus 90%+",
        "deskripsi" => "Paket 4 buku HTML, CSS, JavaScript, dan PHP. Minim coretan.",
        "pemilik" => "Rina",
        "lokasi" => "Yogyakarta",
        "nilai" => 450000,
        "gambar" => "https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 96,
    ],
    [
        "id" => "seed-5",
        "nama" => "Nintendo Switch Lite",
        "kategori" => "Elektronik",
        "kondisi" => "Seperti Baru",
        "deskripsi" => "Full box, bonus 2 game fisik dan casing pelindung.",
        "pemilik" => "Fajar",
        "lokasi" => "Semarang",
        "nilai" => 2800000,
        "gambar" => "https://images.unsplash.com/photo-1610986602538-431d65df4385?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 120,
    ],
    [
        "id" => "seed-6",
        "nama" => "Rak Buku Kayu Minimalis",
        "kategori" => "Rumah Tangga",
        "kondisi" => "Mulus 90%+",
        "deskripsi" => "Kayu jati solid, cocok untuk ruang kerja atau kamar.",
        "pemilik" => "Sinta",
        "lokasi" => "Bandung",
        "nilai" => 900000,
        "gambar" => "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "jamLalu" => 150,
    ],
];

$metode = $_SERVER["REQUEST_METHOD"] ?? "GET";
$filterKategori = trim($_GET["kategori"] ?? "");

// Proses data di server: tambahkan field waktu + filter kategori (loop foreach)
$daftarBarang = [];
foreach ($databaseBarang as $barang) {
    $cocokKategori = $filterKategori === "" || $barang["kategori"] === $filterKategori;
    if ($cocokKategori) {
        $daftarBarang[] = [
            "id" => $barang["id"],
            "nama" => $barang["nama"],
            "kategori" => $barang["kategori"],
            "kondisi" => $barang["kondisi"],
            "deskripsi" => $barang["deskripsi"],
            "pemilik" => $barang["pemilik"],
            "lokasi" => $barang["lokasi"],
            "nilai" => $barang["nilai"],
            "gambar" => $barang["gambar"],
            "waktu" => timestampJamLalu($barang["jamLalu"]),
        ];
    }
}

if ($metode !== "GET") {
    // Kesalahan 1: metode request tidak didukung
    header("Allow: GET");
    kirimJSON(405, ["ok" => false, "pesan" => "Metode " . $metode . " tidak didukung. Gunakan GET."]);
} elseif (hitungTotalBarang($daftarBarang) === 0) {
    // Kondisi data: tidak ada barang yang cocok
    kirimJSON(200, [
        "ok" => true,
        "total" => 0,
        "pesan" => "Tidak ada barang yang cocok dengan filter.",
        "data" => [],
    ]);
} else {
    // Kondisi data: berhasil
    $isiRespons = [
        "ok" => true,
        "total" => hitungTotalBarang($daftarBarang),
        "pesan" => "Data katalog berhasil dimuat dari api/barang.php.",
        "data" => $daftarBarang,
    ];
    $json = json_encode($isiRespons, JSON_UNESCAPED_UNICODE);

    if ($json === false) {
        // Kesalahan 2: data gagal diubah menjadi JSON
        kirimJSON(500, ["ok" => false, "pesan" => "Data gagal diubah menjadi JSON."]);
    } else {
        http_response_code(200);
        echo $json;
    }
}
