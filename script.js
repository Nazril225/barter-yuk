// 1. Selector Elemen DOM (Week 3)
const btnKatalog = document.querySelector("#btn-katalog");
const katalogSection = document.querySelector("#katalog");
const loadingIndicator = document.querySelector("#loading");
const container = document.querySelector("#item-list");
const formTambah = document.querySelector("#form-tambah");
const inputPencarian = document.querySelector("#input-pencarian");

if (btnKatalog && katalogSection) {
    btnKatalog.addEventListener("click", () => {
        katalogSection.scrollIntoView({ behavior: "smooth" });
    });
}

// 2. Data Master (Array of Objects - Week 4)
let daftarBarang = [
    { id: 1, nama: "Buku Pemrograman Web", kondisi: "Mulus 90%", kategori: "Buku & Edukasi" },
    { id: 2, nama: "Gitar Akustik", kondisi: "Layak Pakai", kategori: "Hobi" },
    { id: 3, nama: "Sepeda Lipat", kondisi: "Seperti Baru", kategori: "Kendaraan" },
    { id: 4, nama: "Headset Bluetooth", kondisi: "Segel / Baru", kategori: "Elektronik" }
];

// 3. Fungsi Render Data ke DOM
function renderBarang(dataArray) {
    if (!container) return;
    
    container.innerHTML = "";
    
    if (dataArray.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Barang tidak ditemukan.</p>`;
        return;
    }

    dataArray.forEach(barang => {
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
}

// 4. Simulasi Async & Loading State (Week 4)
setTimeout(() => {
    if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }
    renderBarang(daftarBarang);
}, 600);

// 5. Fitur Pencarian Real-Time (Live Search)
if (inputPencarian) {
    inputPencarian.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase();
        const hasilFilter = daftarBarang.filter(barang => 
            barang.nama.toLowerCase().includes(keyword) || 
            barang.kategori.toLowerCase().includes(keyword)
        );
        renderBarang(hasilFilter);
    });
}

// 6. Form Submit Handling (Tambah Barang Baru)
if (formTambah) {
    formTambah.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const namaInput = document.querySelector("#nama-barang");
        const kondisiInput = document.querySelector("#kondisi-barang");
        const kategoriInput = document.querySelector("#kategori-barang");

        if (!namaInput || !kondisiInput || !kategoriInput) return;

        const barangBaru = {
            id: daftarBarang.length + 1,
            nama: namaInput.value,
            kondisi: kondisiInput.value,
            kategori: kategoriInput.value
        };

        daftarBarang.push(barangBaru);
        renderBarang(daftarBarang);
        formTambah.reset();
        
        alert("Barang barter baru berhasil ditambahkan!");
        katalogSection.scrollIntoView({ behavior: "smooth" });
    });
}

function ajukanBarter(namaItem) {
    alert(`Permintaan barter untuk "${namaItem}" berhasil diajukan!`);
}