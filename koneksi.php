<?php
// Week 5: Server-Side Processing & Function PHP
$namaPlatform = "BarterYuk!";
$tahunRilis = 2026;
$statusKoneksi = "Data masih statis di dalam file PHP (belum terhubung ke database)";

function hitungTotalBarang($arrayData) {
    return count($arrayData);
}

// Data simulasi server database
$databaseBarang = [
    ["nama" => "Buku Pemrograman Web", "kategori" => "Edukasi"],
    ["nama" => "Gitar Akustik", "kategori" => "Hobi"],
    ["nama" => "Sepeda Lipat", "kategori" => "Kendaraan"]
];
?>