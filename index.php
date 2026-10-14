<?php
    $namaWebsite = "BarterYuk!";
    $tahun = 2026;
    $statusServer = "Aktif";
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $namaWebsite; ?> - Platform Barter Barang Online</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="logo">🔄 <?php echo $namaWebsite; ?></div>
        <nav>
            <a href="#beranda">Beranda</a>
            <a href="#katalog">Katalog Barang</a>
            <a href="#tambah">Tambah Barang</a>
        </nav>
    </header>

    <main>
        <section id="hero">
            <h1>Tukar Barangmu dengan yang Kamu Butuhkan</h1>
            <p>Solusi mudah, ramah lingkungan, dan hemat tanpa uang tunai.</p>
            <button id="btn-katalog" class="btn">Lihat Katalog</button>
        </section>

        <section id="katalog">
            <h2>Barang Pilihan untuk Dibarter</h2>
            <div id="item-list" class="grid-container">
                <!-- Konten akan dimuat oleh JavaScript atau PHP -->
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; <?php echo $tahun; ?> <?php echo $namaWebsite; ?> - Status Server: 
           <?php 
               if($statusServer === "Aktif") {
                   echo "<span style='color: #4ade80;'>Berjalan Normal</span>";
               } else {
                   echo "<span style='color: #f87171;'>Maintenance</span>";
               }
           ?>
        </p>
    </footer>

    <script src="script.js"></script>
</body>
</html>