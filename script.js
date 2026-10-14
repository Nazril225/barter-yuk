// Week 3: Selector & Event Handling
const btnKatalog = document.querySelector("#btn-katalog");
const katalogSection = document.querySelector("#katalog");
const loadingIndicator = document.querySelector("#loading");
const container = document.querySelector("#item-list");

// Event Scroll Halus
btnKatalog.addEventListener("click", () => {
    katalogSection.scrollIntoView({ behavior: "smooth" });
});

// Week 4: Array of Objects & Asynchronous Data Simulation (Handling Loading State)
const daftarBarang = [
    { id: 1, nama: "Buku Pemrograman Web", kondisi: "Mulus 90%", kategori: "Buku & Edukasi" },
    { id: 2, nama: "Gitar Akustik", kondisi: "Layak Pakai", kategori: "Hobi" },
    { id: 3, nama: "Sepeda Lipat", kondisi: "Seperti Baru", kategori: "Kendaraan" },
    { id: 4, nama: "Headset Bluetooth", kondisi: "Segel / Baru", kategori: "Elektronik" }
];

// Simulasi pengambilan data asynchronous (Week 4: Promise & Timeout)
setTimeout(() => {
    // Sembunyikan indikator loading
    loadingIndicator.style.display = "none";

    // Render Data ke DOM
    container.innerHTML = "";
    daftarBarang.forEach(barang => {
        const cardHTML = `
            <article class="card">
                <h3>${barang.nama}</h3>
                <p><strong>Kondisi:</strong> ${barang.kondisi}</p>
                <p><strong>Kategori:</strong> ${barang.kategori}</p>
                <button class="btn-tukar" onclick="ajukanBarter('${barang.nama}')" style="margin-top: 15px; padding: 8px 15px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Ajukan Barter</button>
            </article>
        `;
        container.innerHTML += cardHTML;
    });
}, 800); // Simulasi delay loading 0.8 detik

// Function Interaktif
function ajukanBarter(namaItem) {
    alert(`Permintaan barter untuk "${namaItem}" berhasil diajukan!`);
}