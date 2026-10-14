// 1. Tangkap elemen tombol dan bagian katalog
const btnKatalog = document.querySelector("#btn-katalog");
const katalogSection = document.querySelector("#katalog");

// 2. Event Handling: Scroll halus saat tombol "Lihat Katalog" diklik
btnKatalog.addEventListener("click", () => {
    katalogSection.scrollIntoView({ behavior: "smooth" });
});

// 3. Data Barang Barter (Simulasi Array of Objects - Materi Week 4)
const daftarBarangBaru = [
    { nama: "Buku Pemrograman Web", kondisi: "Mulus 90%", kategori: "Buku & Edukasi" },
    { nama: "Gitar Akustik", kondisi: "Layak Pakai", kategori: "Hobi" },
    { nama: "Sepeda Lipat", kondisi: "Seperti Baru", kategori: "Kendaraan" },
    { nama: "Headset Bluetooth", kondisi: "Segel / Baru", kategori: "Elektronik" }
];

// 4. Render Banyak Data ke DOM menggunakan loop (forEach & Template Literals)
const container = document.querySelector("#item-list");
container.innerHTML = ""; // Bersihkan konten statis awal

daftarBarangBaru.forEach(barang => {
    const cardHTML = `
        <article class="card">
            <h3>${barang.nama}</h3>
            <p><strong>Kondisi:</strong> ${barang.kondisi}</p>
            <p><strong>Kategori:</strong> ${barang.kategori}</p>
            <button class="btn-tukar" style="margin-top: 15px; padding: 8px 15px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Ajukan Barter</button>
        </article>
    `;
    container.innerHTML += cardHTML;
});

// 5. Event Interaktif Tambahan untuk Tombol Ajukan Barter
const tombolTukar = document.querySelectorAll(".btn-tukar");
tombolTukar.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const namaBarang = e.target.parentElement.querySelector("h3").textContent;
        alert(`Form pengajuan barter untuk item "${namaBarang}" berhasil dibuka! Silakan login untuk melanjutkan.`);
    });
});