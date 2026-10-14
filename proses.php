<?php
// Week 5: PHP Procedural, Variabel, dan Function
$namaAplikasi = "BarterYuk!";

// Fungsi untuk memvalidasi status ketersediaan barang
function cekStatusBarang($kondisi) {
    if ($kondisi === "Baru" || $kondisi === "Seperti Baru") {
        return "Sangat Layak & High Demand";
    } else {
        return "Layak Pakai";
    }
}

// Simulasi data barang dari database / server
$katalogBarang = [
    ["nama" => "Buku Pemrograman Web", "kondisi" => "Seperti Baru", "kategori" => "Edukasi"],
    ["nama" => "Gitar Akustik", "kondisi" => "Layak Pakai", "kategori" => "Hobi"],
    ["nama" => "Sepeda Lipat", "kondisi" => "Baru", "kategori" => "Kendaraan"]
];
?>