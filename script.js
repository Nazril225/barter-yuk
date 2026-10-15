/* ==========================================================================
   BarterYuk! — script.js
   Week 3 : Interaksi JavaScript, DOM Manipulation & Event Handling
   Week 4 : Fetch API (request HTTP, Promise, async/await, loading & error state)
   Week 5 : PHP JSON API (api/barang.php) + LocalStorage (penyimpanan lokal)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. KONFIGURASI & KONSTANTA
   -------------------------------------------------------------------------- */
const API_URL = "api/barang.php"; // Endpoint PHP yang mengembalikan JSON
const STORAGE_KEY = "barteryuk.barang.v1"; // Kunci data pengguna di LocalStorage
const DRAFT_KEY = "barteryuk.penawaran.v1"; // Kunci draft penawaran (LOKAL, bukan transaksi)

// Kategori + ikon representatif (dipakai untuk kartu & chip filter)
const KATEGORI = [
    { nama: "Elektronik", ikon: "💻" },
    { nama: "Buku & Edukasi", ikon: "📚" },
    { nama: "Hobi", ikon: "🎸" },
    { nama: "Kendaraan", ikon: "🚲" },
    { nama: "Fashion", ikon: "👟" },
    { nama: "Rumah Tangga", ikon: "🪑" },
    { nama: "Olahraga", ikon: "🏀" },
    { nama: "Lainnya", ikon: "📦" },
];

const DAFTAR_KONDISI = ["Segel / Baru", "Seperti Baru", "Mulus 90%+", "Layak Pakai", "Ada Minus"];

// Gambar aset lokal untuk data contoh (agar katalog tetap tampil tanpa internet).
// Dipakai juga untuk memperbarui gambar lama yang masih menunjuk ke URL eksternal.
const GAMBAR_SEED = {
    "seed-1": "assets/images/macbook-air-m1.svg",
    "seed-2": "assets/images/gitar-akustik.svg",
    "seed-3": "assets/images/sepeda-lipat.svg",
    "seed-4": "assets/images/buku-pemrograman.svg",
    "seed-5": "assets/images/nintendo-switch-lite.svg",
    "seed-6": "assets/images/rak-buku-kayu.svg",
};

// Data awal kini disediakan oleh API PHP (api/barang.php) dan dipakai sebagai
// data awal hanya saat belum ada data tersimpan di LocalStorage pengguna.

/* --------------------------------------------------------------------------
   2. STATE APLIKASI
   -------------------------------------------------------------------------- */
const state = {
    barang: [],          // Array of Objects (sumber data utama)
    keyword: "",         // kata kunci live search
    kategori: "Semua",   // filter kategori aktif
    urutan: "terbaru",   // urutan tampilan
    isLoading: true,     // status async
    idAktifModal: null,  // id barang yang sedang dibuka di modal
    sumberData: null,    // "api" | "lokal" | "lokal-fallback" | null
    gagalMemuat: true,   // true bila memuat data gagal dan tidak ada data lokal
    idTargetPenawaran: null, // id barang tujuan saat menyusun penawaran barter
    draftPenawaran: [],      // draft penawaran (lokal, BUKAN transaksi)
};

/* --------------------------------------------------------------------------
   3. SELECTOR DOM
   -------------------------------------------------------------------------- */
const el = {
    itemList: document.querySelector("#item-list"),
    loading: document.querySelector("#loading"),
    emptyState: document.querySelector("#empty-state"),
    errorState: document.querySelector("#error-state"),
    errorMessage: document.querySelector("#error-message"),
    btnRetry: document.querySelector("#btn-retry"),
    resultInfo: document.querySelector("#result-info"),
    inputPencarian: document.querySelector("#input-pencarian"),
    btnClearSearch: document.querySelector("#btn-clear-search"),
    filterKategori: document.querySelector("#filter-kategori"),
    urutkan: document.querySelector("#urutkan"),
    btnKatalog: document.querySelector("#btn-katalog"),
    btnReload: document.querySelector("#btn-reload"),
    katalog: document.querySelector("#katalog"),
    form: document.querySelector("#form-tambah"),
    formFields: {
        nama: document.querySelector("#nama-barang"),
        kategori: document.querySelector("#kategori-barang"),
        kondisi: document.querySelector("#kondisi-barang"),
        pemilik: document.querySelector("#pemilik-barang"),
        lokasi: document.querySelector("#lokasi-barang"),
        nilai: document.querySelector("#nilai-barang"),
        gambar: document.querySelector("#gambar-barang"),
        deskripsi: document.querySelector("#deskripsi-barang"),
    },
    charCounter: document.querySelector("#char-counter"),
    modal: document.querySelector("#modal-detail"),
    modalEmoji: document.querySelector("#modal-emoji"),
    modalGambar: document.querySelector("#modal-gambar"),
    modalNama: document.querySelector("#modal-nama"),
    modalKategori: document.querySelector("#modal-kategori"),
    modalKondisi: document.querySelector("#modal-kondisi-badge"),
    modalDeskripsi: document.querySelector("#modal-deskripsi"),
    modalPemilik: document.querySelector("#modal-pemilik"),
    modalLokasi: document.querySelector("#modal-lokasi"),
    modalNilai: document.querySelector("#modal-nilai"),
    modalWaktu: document.querySelector("#modal-waktu"),
    modalId: document.querySelector("#modal-id"),
    btnAjukan: document.querySelector("#btn-ajukan-modal"),
    btnHapus: document.querySelector("#btn-hapus-modal"),
    closeBtn: document.querySelector("#modal-detail .close-btn"),
    modalHargaDisepakati: document.querySelector("#modal-harga-disepakati"),
    toast: document.querySelector("#toast-container"),
    // --- Modal & seksi penawaran barter (prototipe) ---
    modalPenawaran: document.querySelector("#modal-penawaran"),
    closePenawaran: document.querySelector("#close-penawaran"),
    penawaranSection: document.querySelector("#penawaran"),
    penawaranTargetNama: document.querySelector("#penawaran-target-nama"),
    penawaranTargetNilai: document.querySelector("#penawaran-target-nilai"),
    penawaranTargetEmoji: document.querySelector("#penawaran-target-emoji"),
    penawaranTargetImg: document.querySelector("#penawaran-target-img"),
    penawaranPilih: document.querySelector("#penawaran-pilih"),
    penawaranCompare: document.querySelector("#penawaran-compare"),
    compareNamaKamu: document.querySelector("#compare-nama-kamu"),
    compareNilaiKamu: document.querySelector("#compare-nilai-kamu"),
    compareNamaTarget: document.querySelector("#compare-nama-target"),
    compareNilaiTarget: document.querySelector("#compare-nilai-target"),
    compareSelisih: document.querySelector("#compare-selisih"),
    uangTanpa: document.querySelector("#uang-tanpa"),
    uangDengan: document.querySelector("#uang-dengan"),
    penawaranUangWrap: document.querySelector("#penawaran-uang-wrap"),
    penawaranUang: document.querySelector("#penawaran-uang"),
    penawaranArah: document.querySelector("#penawaran-arah"),
    penawaranReviewList: document.querySelector("#penawaran-review-list"),
    penawaranSimpan: document.querySelector("#penawaran-simpan"),
    draftList: document.querySelector("#draft-list"),
    draftEmpty: document.querySelector("#draft-empty"),
    btnHapusDraft: document.querySelector("#btn-hapus-draft"),
    stat: {
        total: document.querySelector("#stat-total"),
        kategori: document.querySelector("#stat-kategori"),
        kota: document.querySelector("#stat-kota"),
    },
};

/* --------------------------------------------------------------------------
   4. UTILITAS (Helper Functions)
   -------------------------------------------------------------------------- */

// Membuat id unik sederhana
const buatId = () => `barter-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Mengamankan teks agar tidak bisa menyisipkan HTML (mencegah XSS)
function escapeHTML(teks = "") {
    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Format angka menjadi Rupiah
function formatRupiah(angka) {
    const nilai = Number(angka) || 0;
    if (nilai <= 0) return "Tidak disebutkan";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(nilai);
}

// Teks nilai ESTIMASI pada kartu/detail: angka Rupiah, atau penanda bila belum diisi.
// Dibedakan dari harga transaksi disepakati yang hanya ada setelah deal.
function teksNilai(angka) {
    const nilai = Number(angka) || 0;
    return nilai > 0 ? formatRupiah(nilai) : "Belum diisi";
}

// Format waktu relatif (misal "2 jam lalu")
function waktuRelatif(timestamp) {
    const selisih = Date.now() - Number(timestamp);
    const menit = Math.floor(selisih / 60000);
    if (menit < 1) return "Baru saja";
    if (menit < 60) return `${menit} menit lalu`;
    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam lalu`;
    const hari = Math.floor(jam / 24);
    if (hari < 30) return `${hari} hari lalu`;
    return new Date(timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Ambil ikon berdasarkan nama kategori
function ikonKategori(nama) {
    const ketemu = KATEGORI.find((k) => k.nama === nama);
    return ketemu ? ketemu.ikon : "📦";
}

// Debounce: menunda eksekusi agar live search tidak berjalan terlalu sering
function debounce(fn, delay = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/* --------------------------------------------------------------------------
   5. LOCALSTORAGE (Week 5 — Persistensi Data)
   -------------------------------------------------------------------------- */
function simpanKeStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.barang));
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        tampilkanToast("Penyimpanan lokal penuh. Data gagal disimpan.", "error");
    }
}

function muatDariStorage() {
    try {
        const tersimpan = localStorage.getItem(STORAGE_KEY);
        if (!tersimpan) return null;
        const data = JSON.parse(tersimpan);
        return Array.isArray(data) ? normalisasiGambar(data) : null;
    } catch (error) {
        console.error("Data lokal rusak, memakai data awal.", error);
        return null;
    }
}

// Menyeragamkan gambar data contoh: barang bawaan (id "seed-*") memakai aset
// lokal bila gambar tersimpan masih kosong atau masih menunjuk URL eksternal.
// Barang tambahan pengguna tidak diubah.
function normalisasiGambar(data) {
    data.forEach((barang) => {
        const asetLokal = barang && GAMBAR_SEED[barang.id];
        if (!asetLokal) return;
        const gambarLama = typeof barang.gambar === "string" ? barang.gambar : "";
        if (gambarLama === "" || /^https?:\/\//i.test(gambarLama)) {
            barang.gambar = asetLokal;
        }
    });
    return data;
}

/* --------------------------------------------------------------------------
   6. FETCH API & LOADING / ERROR STATE (Week 4 — Request HTTP nyata)
   -------------------------------------------------------------------------- */

// Mengambil data barang dari endpoint PHP (api/barang.php) sebagai JSON
async function ambilDataBarang() {
    const respons = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    // Cek status HTTP sebelum membaca isi respons
    if (!respons.ok) {
        throw new Error(`Permintaan gagal (HTTP ${respons.status})`);
    }

    const isi = await respons.json(); // parsing JSON -> bisa throw bila bukan JSON
    const data = Array.isArray(isi) ? isi : isi.data;

    if (!Array.isArray(data)) {
        throw new Error("Respons API tidak berupa daftar barang");
    }
    return data;
}

function tampilkanErrorState(pesan) {
    if (el.errorMessage) el.errorMessage.textContent = pesan;
    if (el.errorState) el.errorState.hidden = false;
    if (el.emptyState) el.emptyState.hidden = true;
    if (el.itemList) el.itemList.innerHTML = "";
}

function sembunyikanErrorState() {
    if (el.errorState) el.errorState.hidden = true;
}

/**
 * Memuat katalog.
 * - Data dari API menjadi data awal jika belum ada data tersimpan di perangkat.
 * - Data pengguna (hasil tambah/hapus) TIDAK ditimpa oleh API secara diam-diam.
 * - opsi.paksaApi = true hanya dipakai setelah pengguna mengonfirmasi sinkronisasi.
 */
async function inisialisasiData(opsi = {}) {
    const { paksaApi = false } = opsi;
    const dataLokal = muatDariStorage();

    state.isLoading = true;
    state.gagalMemuat = false;
    tampilkanLoading(true);

    try {
        const dataApi = await ambilDataBarang();

        if (dataLokal && !paksaApi) {
            // Data pengguna dipertahankan, hasil API tidak menimpanya
            state.barang = dataLokal;
            state.sumberData = "lokal";
        } else {
            // Belum ada data lokal, atau pengguna meminta sinkronisasi dari API
            state.barang = dataApi;
            state.sumberData = "api";
            simpanKeStorage();
        }
        sembunyikanErrorState();
    } catch (error) {
        console.error("Gagal memuat data dari API:", error);

        if (dataLokal) {
            // Fallback lokal hanya jika tersedia
            state.barang = dataLokal;
            state.sumberData = "lokal-fallback";
            tampilkanToast(
                "API tidak tersedia. Menampilkan data tersimpan di perangkat ini (bukan dari server).",
                "info"
            );
        } else {
            state.barang = [];
            state.sumberData = null;
            state.gagalMemuat = true;
            tampilkanErrorState(
                "Data barang gagal dimuat. Pastikan server PHP berjalan (php -S localhost:8000), lalu tekan tombol di bawah."
            );
        }
    } finally {
        state.isLoading = false;
        tampilkanLoading(false);
        perbaruiStatistik();
        renderSemua();
    }
}

/* --------------------------------------------------------------------------
   7. RENDER (Week 3 — DOM Manipulation)
   -------------------------------------------------------------------------- */
function tampilkanLoading(aktif) {
    if (!el.loading) return;
    el.loading.hidden = !aktif;
    if (aktif) {
        // Skeleton loading
        el.loading.innerHTML = Array.from({ length: 6 })
            .map(() => '<div class="skeleton-card"></div>')
            .join("");
        el.itemList.innerHTML = "";
        el.emptyState.hidden = true;
        if (el.errorState) el.errorState.hidden = true;
        el.resultInfo.textContent = "Memuat data dari API...";
    }
}

// Mengambil data setelah difilter (search + kategori) dan diurutkan
function ambilBarangTampil() {
    const keyword = state.keyword.trim().toLowerCase();

    let hasil = state.barang.filter((barang) => {
        const cocokKategori = state.kategori === "Semua" || barang.kategori === state.kategori;
        if (!cocokKategori) return false;
        if (!keyword) return true;

        // Live search: cek nama, kategori, pemilik, dan lokasi
        const target = [barang.nama, barang.kategori, barang.pemilik, barang.lokasi]
            .join(" ")
            .toLowerCase();
        return target.includes(keyword);
    });

    const pembanding = {
        terbaru: (a, b) => b.waktu - a.waktu,
        terlama: (a, b) => a.waktu - b.waktu,
        "nama-asc": (a, b) => a.nama.localeCompare(b.nama, "id"),
        "nama-desc": (a, b) => b.nama.localeCompare(a.nama, "id"),
    };
    hasil = [...hasil].sort(pembanding[state.urutan] || pembanding.terbaru);

    return hasil;
}

// Membuat HTML satu kartu barang
function templateKartu(barang) {
    const deskripsi = barang.deskripsi
        ? escapeHTML(barang.deskripsi)
        : "Belum ada deskripsi untuk barang ini.";
    // Placeholder selalu dirender; gambar (bila ada) menutupinya setelah termuat.
    // Aset lokal dimuat langsung (eager) karena sudah tersedia di server;
    // gambar dari URL eksternal dimuat saat dibutuhkan (lazy) agar hemat kuota.
    const gambarLokal = typeof barang.gambar === "string" && !/^https?:\/\//i.test(barang.gambar);
    const imgHtml = barang.gambar
        ? `<img class="card-img" src="${escapeHTML(barang.gambar)}" alt="${escapeHTML(barang.nama)}" loading="${gambarLokal ? "eager" : "lazy"}" decoding="async">`
        : "";

    return `
        <article class="card" data-id="${escapeHTML(barang.id)}" tabindex="0" role="button"
                 aria-label="Lihat detail ${escapeHTML(barang.nama)}">
            <div class="card-media">
                <span class="media-placeholder" aria-hidden="true">
                    <span class="media-emoji">${ikonKategori(barang.kategori)}</span>
                    <small class="media-placeholder-text">Foto belum tersedia</small>
                </span>
                ${imgHtml}
                <span class="badge">${escapeHTML(barang.kondisi)}</span>
            </div>
            <div class="card-body">
                <span class="card-category">${escapeHTML(barang.kategori)}</span>
                <h3>${escapeHTML(barang.nama)}</h3>
                <p class="card-desc">${deskripsi}</p>
                <div class="card-nilai">
                    <span class="nilai-label">Estimasi nilai</span>
                    <span class="nilai-angka">${escapeHTML(teksNilai(barang.nilai))}</span>
                </div>
            </div>
            <div class="card-footer">
                <span class="card-owner">👤 ${escapeHTML(barang.pemilik)} • ${escapeHTML(barang.lokasi || "-")}</span>
                <span class="card-cta">Detail &rarr;</span>
            </div>
        </article>
    `;
}

function renderDaftarBarang() {
    if (!el.itemList || state.isLoading) return;

    // Kondisi gagal memuat tanpa data lokal: tampilkan blok error, bukan empty state
    if (state.gagalMemuat) {
        tampilkanErrorState(
            "Data barang gagal dimuat. Pastikan server PHP berjalan (php -S localhost:8000), lalu tekan tombol di bawah."
        );
        el.resultInfo.textContent = "Data belum bisa dimuat.";
        return;
    }

    const data = ambilBarangTampil();

    el.emptyState.hidden = data.length !== 0;
    el.itemList.innerHTML = data.map(templateKartu).join("");
    pasangFallbackGambar();

    // Info jumlah hasil + sumber data yang jujur
    const total = state.barang.length;
    const sumber = {
        api: "api/barang.php",
        lokal: "penyimpanan lokal",
        "lokal-fallback": "penyimpanan lokal (API tidak tersedia)",
    }[state.sumberData];

    el.resultInfo.innerHTML =
        (data.length === total
            ? `Menampilkan <strong>${total}</strong> barang barter.`
            : `Menampilkan <strong>${data.length}</strong> dari ${total} barang.`) +
        (sumber ? ` <span class="source-note">Sumber data: ${escapeHTML(sumber)}</span>` : "");
}

// Jika gambar gagal dimuat, sembunyikan gambar sehingga placeholder
// (ikon kategori + "Foto belum tersedia") yang ada di belakangnya terlihat.
function pasangFallbackGambar() {
    if (!el.itemList) return;
    el.itemList.querySelectorAll(".card-img").forEach((img) => {
        const tampilkanPlaceholder = () => {
            img.style.display = "none";
        };
        img.addEventListener("error", tampilkanPlaceholder, { once: true });
        if (img.complete && img.naturalWidth === 0) tampilkanPlaceholder();
    });
}

function renderFilterKategori() {
    if (!el.filterKategori) return;

    const opsi = ["Semua", ...KATEGORI.map((k) => k.nama)];
    el.filterKategori.innerHTML = opsi
        .map(
            (nama) => `
            <button type="button" class="chip ${state.kategori === nama ? "is-active" : ""}"
                    data-kategori="${escapeHTML(nama)}"
                    aria-pressed="${state.kategori === nama}">${escapeHTML(nama)}</button>`
        )
        .join("");
}

function renderSemua() {
    renderFilterKategori();
    renderDaftarBarang();
}

function perbaruiStatistik() {
    if (!el.stat.total) return;
    el.stat.total.textContent = state.barang.length;
    el.stat.kategori.textContent = new Set(state.barang.map((b) => b.kategori)).size;
    el.stat.kota.textContent = new Set(state.barang.map((b) => b.lokasi).filter(Boolean)).size;
}

/* --------------------------------------------------------------------------
   8. MODAL DETAIL POPUP (Week 5)
   -------------------------------------------------------------------------- */
let elemenFokusTerakhir = null;

function bukaModal(id) {
    const barang = state.barang.find((b) => b.id === id);
    if (!barang) return;

    state.idAktifModal = id;
    elemenFokusTerakhir = document.activeElement;

    el.modalEmoji.textContent = ikonKategori(barang.kategori);
    if (el.modalGambar) {
        // Reset: sembunyikan gambar agar placeholder tampil sampai gambar siap.
        el.modalGambar.onload = null;
        el.modalGambar.onerror = null;
        el.modalGambar.hidden = true;
        el.modalGambar.removeAttribute("src"); // jangan kirim request ke halaman kosong
        el.modalGambar.alt = "";

        if (barang.gambar) {
            el.modalGambar.alt = barang.nama;
            el.modalGambar.onload = () => {
                el.modalGambar.hidden = false;
            };
            el.modalGambar.onerror = () => {
                // Gambar gagal dimuat -> tampilkan placeholder (ikon kategori)
                el.modalGambar.hidden = true;
            };
            el.modalGambar.src = barang.gambar;
            // Gambar dari cache bisa langsung selesai tanpa memicu onload.
            if (el.modalGambar.complete && el.modalGambar.naturalWidth > 0) {
                el.modalGambar.hidden = false;
            }
        }
    }
    el.modalNama.textContent = barang.nama;
    el.modalKategori.textContent = barang.kategori;
    el.modalKondisi.textContent = barang.kondisi;
    el.modalDeskripsi.textContent = barang.deskripsi || "Belum ada deskripsi untuk barang ini.";
    el.modalPemilik.textContent = barang.pemilik;
    el.modalLokasi.textContent = barang.lokasi || "-";
    el.modalNilai.textContent = formatRupiah(barang.nilai);
    if (el.modalHargaDisepakati) el.modalHargaDisepakati.textContent = "Belum ada";
    el.modalWaktu.textContent = waktuRelatif(barang.waktu);
    if (el.modalId) el.modalId.textContent = barang.id;

    el.modal.hidden = false;
    document.body.classList.add("modal-open");
    el.closeBtn.focus();
}

// kembalikanFokus=false dipakai saat modal detail ditutup untuk membuka modal penawaran,
// agar fokus tidak "melompat" ke tombol di dalam modal yang akan disembunyikan.
function tutupModal(kembalikanFokus = true) {
    el.modal.hidden = true;
    if (!el.modalPenawaran || el.modalPenawaran.hidden) {
        document.body.classList.remove("modal-open");
    }
    state.idAktifModal = null;
    if (kembalikanFokus && elemenFokusTerakhir) elemenFokusTerakhir.focus();
}

/* --------------------------------------------------------------------------
   8b. PENAWARAN BARTER (prototipe UI — BELUM terhubung ke server)
   --------------------------------------------------------------------------
   Semua nilai di sini adalah ESTIMASI yang dapat dinegosiasikan. Penawaran
   belum dikirim ke mana pun dan belum menjadi transaksi; hanya disimpan
   sebagai DRAFT di LocalStorage perangkat pengguna.
   -------------------------------------------------------------------------- */

// Tahan fokus (Tab) agar tetap berputar di dalam dialog yang aktif.
function pasangPerangkapFokus(modalEl) {
    if (!modalEl) return;
    modalEl.addEventListener("keydown", (event) => {
        if (event.key !== "Tab") return;

        const kandidat = modalEl.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const daftarFokus = Array.from(kandidat).filter(
            (node) => !node.disabled && node.offsetParent !== null
        );
        if (daftarFokus.length === 0) return;

        const pertama = daftarFokus[0];
        const terakhir = daftarFokus[daftarFokus.length - 1];

        if (event.shiftKey && document.activeElement === pertama) {
            event.preventDefault();
            terakhir.focus();
        } else if (!event.shiftKey && document.activeElement === terakhir) {
            event.preventDefault();
            pertama.focus();
        }
    });
}

function muatDraftPenawaran() {
    try {
        const tersimpan = localStorage.getItem(DRAFT_KEY);
        if (!tersimpan) return [];
        const data = JSON.parse(tersimpan);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Draft penawaran rusak, dimulai dari daftar kosong.", error);
        return [];
    }
}

function simpanDraftKeStorage() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state.draftPenawaran));
    } catch (error) {
        console.error("Gagal menyimpan draft penawaran:", error);
        tampilkanToast("Draft gagal disimpan di perangkat ini.", "error");
    }
}

function tampilkanErrorPenawaran(id, pesan) {
    const field = document.getElementById(id);
    const pesanEl = document.querySelector(`[data-error-for="${id}"]`);
    if (pesanEl) pesanEl.textContent = pesan || "";
    if (field) field.classList.toggle("is-invalid", Boolean(pesan));
}

// Hitung perbandingan nilai estimasi: barang yang ditawarkan vs barang tujuan.
// selisih = nilai target - nilai diri sendiri (>0 artinya kamu perlu menambah uang).
function hitungPerbandingan() {
    const target = state.barang.find((b) => b.id === state.idTargetPenawaran) || null;
    const idPilih = el.penawaranPilih ? el.penawaranPilih.value : "";
    const ditawarkan = state.barang.find((b) => b.id === idPilih) || null;

    const nTarget = target ? Number(target.nilai) || 0 : 0;
    const nKamu = ditawarkan ? Number(ditawarkan.nilai) || 0 : 0;
    const lengkap = Boolean(target) && Boolean(ditawarkan) && nTarget > 0 && nKamu > 0;

    return { target, ditawarkan, selisih: lengkap ? nTarget - nKamu : null, lengkap };
}

function modeUangAktif() {
    return el.uangDengan && el.uangDengan.checked ? "dengan" : "tanpa";
}

function perbaruiPerbandingan() {
    if (!el.penawaranCompare) return;
    const { target, ditawarkan, selisih, lengkap } = hitungPerbandingan();

    if (!target || !ditawarkan) {
        el.penawaranCompare.hidden = true;
        if (el.penawaranArah) el.penawaranArah.textContent = "";
        return;
    }

    el.penawaranCompare.hidden = false;
    el.compareNamaKamu.textContent = ditawarkan.nama;
    el.compareNilaiKamu.textContent = teksNilai(ditawarkan.nilai);
    el.compareNamaTarget.textContent = target.nama;
    el.compareNilaiTarget.textContent = teksNilai(target.nilai);

    if (!lengkap) {
        el.compareSelisih.className = "compare-balance is-unknown";
        el.compareSelisih.textContent =
            "Perkiraan selisih belum bisa dihitung karena salah satu nilai belum diisi. Negosiasikan secara manual.";
        if (el.penawaranArah) el.penawaranArah.textContent = "Isi nominal manual bila ingin menambah uang.";
        return;
    }

    el.compareSelisih.className = "compare-balance";
    let arah;
    if (selisih > 0) arah = "barang tujuan lebih tinggi — kamu dapat menambah uang";
    else if (selisih < 0) arah = "barangmu lebih tinggi — pemilik barang tujuan dapat menambah uang";
    else arah = "nilai estimasi seimbang";
    el.compareSelisih.textContent = `Perkiraan selisih nilai: ${formatRupiah(Math.abs(selisih))} — ${arah}.`;

    if (el.penawaranArah) {
        if (selisih > 0) {
            el.penawaranArah.textContent = `Saran: kamu menambah ± ${formatRupiah(selisih)} (bisa dinegosiasikan).`;
        } else if (selisih < 0) {
            el.penawaranArah.textContent = `Saran: pemilik barang tujuan menambah ± ${formatRupiah(Math.abs(selisih))} (bisa dinegosiasikan).`;
        } else {
            el.penawaranArah.textContent = "Nilai seimbang — uang tambahan tidak diperlukan.";
        }
    }
}

// Tampilkan/sembunyikan input nominal, lalu isi saran otomatis dari selisih.
function sinkronUang() {
    const mode = modeUangAktif();
    if (el.penawaranUangWrap) el.penawaranUangWrap.hidden = mode !== "dengan";

    if (mode === "dengan" && el.penawaranUang) {
        const { selisih, lengkap } = hitungPerbandingan();
        const kosong = !el.penawaranUang.value || Number(el.penawaranUang.value) === 0;
        if (lengkap && selisih !== 0 && kosong) {
            el.penawaranUang.value = String(Math.abs(selisih));
        }
    }
}

function barisTinjauan(label, nilai) {
    return `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(nilai)}</dd></div>`;
}

function perbaruiTinjauan() {
    if (!el.penawaranReviewList) return;
    const { target, ditawarkan, selisih, lengkap } = hitungPerbandingan();
    const mode = modeUangAktif();

    const baris = [];
    baris.push(barisTinjauan("Barangmu", ditawarkan ? ditawarkan.nama : "Belum dipilih"));
    baris.push(barisTinjauan("Estimasi barangmu", ditawarkan ? teksNilai(ditawarkan.nilai) : "-"));
    baris.push(barisTinjauan("Barang tujuan", target ? target.nama : "-"));
    baris.push(barisTinjauan("Estimasi barang tujuan", target ? teksNilai(target.nilai) : "-"));
    baris.push(
        barisTinjauan(
            "Perkiraan selisih nilai",
            lengkap ? formatRupiah(Math.abs(selisih)) : "Belum bisa dihitung"
        )
    );

    if (mode === "dengan") {
        const jumlah = Number(el.penawaranUang.value) || 0;
        let arah = "";
        if (lengkap && selisih !== 0) arah = selisih > 0 ? "(dari kamu)" : "(dari pemilik barang tujuan)";
        baris.push(barisTinjauan("Jenis", "Tukar + uang tambahan"));
        baris.push(barisTinjauan("Uang tambahan", `${formatRupiah(jumlah)} ${arah}`.trim()));
    } else {
        baris.push(barisTinjauan("Jenis", "Tukar murni (tanpa uang)"));
        baris.push(barisTinjauan("Uang tambahan", "Tidak ada"));
    }

    baris.push(barisTinjauan("Status", "Draft — belum dikirim ke server"));
    el.penawaranReviewList.innerHTML = baris.join("");
}

// Isi dropdown "barang yang ditawarkan" dari katalog (semua barang kecuali target).
function isiPilihanPenawaran(targetId) {
    if (!el.penawaranPilih) return;
    const opsi = state.barang
        .filter((b) => b.id !== targetId)
        .map(
            (b) =>
                `<option value="${escapeHTML(b.id)}">${escapeHTML(b.nama)} — ${escapeHTML(teksNilai(b.nilai))}</option>`
        )
        .join("");
    el.penawaranPilih.innerHTML = `<option value="">-- Pilih barangmu --</option>${opsi}`;
}

function bukaPenawaran() {
    const barang = state.barang.find((b) => b.id === state.idAktifModal);
    if (!barang || !el.modalPenawaran) return;

    state.idTargetPenawaran = barang.id;

    // Tutup modal detail tanpa mengembalikan fokus ke dalamnya.
    if (el.modal && !el.modal.hidden) tutupModal(false);

    // Ringkasan barang tujuan
    if (el.penawaranTargetNama) el.penawaranTargetNama.textContent = barang.nama;
    if (el.penawaranTargetNilai) el.penawaranTargetNilai.textContent = teksNilai(barang.nilai);
    if (el.penawaranTargetEmoji) el.penawaranTargetEmoji.textContent = ikonKategori(barang.kategori);
    if (el.penawaranTargetImg) {
        el.penawaranTargetImg.onload = null;
        el.penawaranTargetImg.onerror = null;
        el.penawaranTargetImg.hidden = true;
        el.penawaranTargetImg.removeAttribute("src");
        el.penawaranTargetImg.alt = "";
        if (barang.gambar) {
            el.penawaranTargetImg.alt = barang.nama;
            el.penawaranTargetImg.onload = () => {
                el.penawaranTargetImg.hidden = false;
            };
            el.penawaranTargetImg.onerror = () => {
                el.penawaranTargetImg.hidden = true;
            };
            el.penawaranTargetImg.src = barang.gambar;
            if (el.penawaranTargetImg.complete && el.penawaranTargetImg.naturalWidth > 0) {
                el.penawaranTargetImg.hidden = false;
            }
        }
    }

    // Reset formulir penawaran setiap kali dibuka
    isiPilihanPenawaran(barang.id);
    if (el.penawaranPilih) el.penawaranPilih.value = "";
    if (el.uangTanpa) el.uangTanpa.checked = true;
    if (el.uangDengan) el.uangDengan.checked = false;
    if (el.penawaranUang) el.penawaranUang.value = "0";
    tampilkanErrorPenawaran("penawaran-pilih", "");
    tampilkanErrorPenawaran("penawaran-uang", "");
    perbaruiPerbandingan();
    sinkronUang();
    perbaruiTinjauan();

    el.modalPenawaran.hidden = false;
    document.body.classList.add("modal-open");
    if (el.closePenawaran) el.closePenawaran.focus();
}

function tutupPenawaran() {
    if (!el.modalPenawaran) return;
    el.modalPenawaran.hidden = true;
    if (!el.modal || el.modal.hidden) document.body.classList.remove("modal-open");

    const id = state.idTargetPenawaran;
    state.idTargetPenawaran = null;

    // Kembalikan fokus ke kartu barang tujuan (bukan ke dalam modal yang tertutup).
    if (id && el.itemList) {
        const kartu = Array.from(el.itemList.querySelectorAll(".card")).find((c) => c.dataset.id === id);
        if (kartu) kartu.focus();
    }
}

function simpanDraftPenawaran() {
    const { target, ditawarkan, selisih, lengkap } = hitungPerbandingan();

    if (!ditawarkan) {
        tampilkanErrorPenawaran("penawaran-pilih", "Pilih dulu barang yang kamu tawarkan.");
        tampilkanToast("Barang yang ditawarkan belum dipilih.", "error");
        return;
    }
    tampilkanErrorPenawaran("penawaran-pilih", "");

    const mode = modeUangAktif();
    let uang = 0;
    if (mode === "dengan") {
        uang = Number(el.penawaranUang.value) || 0;
        if (!(uang > 0)) {
            tampilkanErrorPenawaran("penawaran-uang", "Isi nominal uang tambahan lebih dari 0.");
            tampilkanToast("Nominal uang tambahan belum valid.", "error");
            return;
        }
        tampilkanErrorPenawaran("penawaran-uang", "");
    }

    // Arah uang hanya bisa dipastikan bila nilai kedua barang diketahui.
    let arahUang = null;
    if (mode === "dengan" && lengkap && selisih !== 0) {
        arahUang = selisih > 0 ? "kamu" : "pemilik";
    }

    const draft = {
        id: buatId(),
        waktu: Date.now(),
        target: {
            id: target.id,
            nama: target.nama,
            nilai: Number(target.nilai) || 0,
            kategori: target.kategori,
        },
        ditawarkan: {
            id: ditawarkan.id,
            nama: ditawarkan.nama,
            nilai: Number(ditawarkan.nilai) || 0,
            kategori: ditawarkan.kategori,
        },
        pakaiUang: mode === "dengan",
        uang: mode === "dengan" ? uang : 0,
        arahUang,
        selisih: lengkap ? selisih : null,
    };

    state.draftPenawaran.unshift(draft);
    simpanDraftKeStorage();
    renderDraftPenawaran();
    tutupPenawaran();
    tampilkanToast(
        "Draft penawaran disimpan di perangkat ini — belum dikirim ke server.",
        "info"
    );
    if (el.penawaranSection) {
        el.penawaranSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function rincianUang(draft) {
    if (!draft.pakaiUang || !(Number(draft.uang) > 0)) return "Tanpa uang tambahan";
    if (draft.arahUang === "kamu") return `${formatRupiah(draft.uang)} (dari kamu)`;
    if (draft.arahUang === "pemilik") return `${formatRupiah(draft.uang)} (dari pemilik barang tujuan)`;
    return `${formatRupiah(draft.uang)} (arah belum pasti — nilai belum lengkap)`;
}

function templateDraft(draft) {
    const selisihTeks =
        draft.selisih === null || draft.selisih === undefined
            ? "Tidak dihitung"
            : formatRupiah(Math.abs(draft.selisih));
    return `
        <article class="draft-card" data-id="${escapeHTML(draft.id)}">
            <div class="draft-head">
                <span class="proto-badge proto-badge-sm">Draft</span>
                <span class="draft-waktu">${escapeHTML(waktuRelatif(draft.waktu))}</span>
            </div>
            <p class="draft-exchange">
                <strong>${escapeHTML(draft.ditawarkan.nama)}</strong>
                <span aria-hidden="true">⇄</span>
                <strong>${escapeHTML(draft.target.nama)}</strong>
            </p>
            <dl class="draft-info">
                <div><dt>Estimasi barangmu</dt><dd>${escapeHTML(teksNilai(draft.ditawarkan.nilai))}</dd></div>
                <div><dt>Estimasi barang tujuan</dt><dd>${escapeHTML(teksNilai(draft.target.nilai))}</dd></div>
                <div><dt>Perkiraan selisih</dt><dd>${escapeHTML(selisihTeks)}</dd></div>
                <div><dt>Uang tambahan</dt><dd>${escapeHTML(rincianUang(draft))}</dd></div>
                <div><dt>Status</dt><dd>Draft lokal — belum dikirim</dd></div>
            </dl>
            <button type="button" class="btn btn-outline btn-sm draft-hapus" data-hapus="${escapeHTML(draft.id)}">Hapus draft</button>
        </article>
    `;
}

function renderDraftPenawaran() {
    if (!el.draftList) return;
    const daftar = state.draftPenawaran;
    el.draftList.innerHTML = daftar.map(templateDraft).join("");
    if (el.draftEmpty) el.draftEmpty.hidden = daftar.length !== 0;
    if (el.btnHapusDraft) el.btnHapusDraft.hidden = daftar.length === 0;
}

/* --------------------------------------------------------------------------
   9. TOAST NOTIFICATION
   -------------------------------------------------------------------------- */
function tampilkanToast(pesan, tipe = "success", durasi = 3200) {
    if (!el.toast) return;

    const ikon = { success: "✅", error: "⚠️", info: "ℹ️" }[tipe] || "ℹ️";
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipe}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span aria-hidden="true">${ikon}</span><span>${escapeHTML(pesan)}</span>`;
    el.toast.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("is-hiding");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, durasi);
}

/* --------------------------------------------------------------------------
   10. FORM TAMBAH BARANG (Week 5)
   -------------------------------------------------------------------------- */
function isiSelectForm() {
    if (el.formFields.kategori) {
        el.formFields.kategori.innerHTML = [
            '<option value="">-- Pilih kategori --</option>',
            ...KATEGORI.map((k) => `<option value="${escapeHTML(k.nama)}">${escapeHTML(k.nama)}</option>`),
        ].join("");
    }
    if (el.formFields.kondisi) {
        el.formFields.kondisi.innerHTML = [
            '<option value="">-- Pilih kondisi --</option>',
            ...DAFTAR_KONDISI.map((k) => `<option value="${escapeHTML(k)}">${escapeHTML(k)}</option>`),
        ].join("");
    }
}

function tampilkanError(nama, pesan) {
    const field = el.formFields[nama];
    const pesanEl = document.querySelector(`[data-error-for="${nama}"]`);
    if (pesanEl) pesanEl.textContent = pesan || "";
    if (field) field.classList.toggle("is-invalid", Boolean(pesan));
}

function validasiForm() {
    const nilai = {
        nama: el.formFields.nama.value.trim(),
        kategori: el.formFields.kategori.value,
        kondisi: el.formFields.kondisi.value,
        pemilik: el.formFields.pemilik.value.trim(),
        lokasi: el.formFields.lokasi.value.trim(),
        nilai: el.formFields.nilai.value,
        gambar: el.formFields.gambar ? el.formFields.gambar.value.trim() : "",
        deskripsi: el.formFields.deskripsi.value.trim(),
    };

    const error = {};
    if (nilai.nama.length < 3) error.nama = "Nama barang minimal 3 karakter.";
    if (!nilai.kategori) error.kategori = "Silakan pilih kategori.";
    if (!nilai.kondisi) error.kondisi = "Silakan pilih kondisi barang.";
    if (nilai.pemilik.length < 2) error.pemilik = "Nama pemilik minimal 2 karakter.";
    if (nilai.nilai && Number(nilai.nilai) < 0) error.nilai = "Nilai tidak boleh negatif.";
    if (nilai.gambar && !/^https?:\/\//i.test(nilai.gambar)) error.gambar = "URL gambar harus diawali http:// atau https://";

    Object.keys(el.formFields).forEach((kunci) => tampilkanError(kunci, error[kunci]));

    return { valid: Object.keys(error).length === 0, nilai };
}

async function tanganiSubmitForm(event) {
    event.preventDefault();

    const { valid, nilai } = validasiForm();
    if (!valid) {
        tampilkanToast("Periksa kembali data yang belum lengkap.", "error");
        return;
    }

    const barangBaru = {
        id: buatId(),
        nama: nilai.nama,
        kategori: nilai.kategori,
        kondisi: nilai.kondisi,
        deskripsi: nilai.deskripsi,
        pemilik: nilai.pemilik,
        lokasi: nilai.lokasi || "Tidak disebutkan",
        nilai: Number(nilai.nilai) || 0,
        gambar: nilai.gambar || "",
        waktu: Date.now(),
    };

    // Simulasi proses simpan async
    el.form.querySelector('button[type="submit"]').disabled = true;
    el.form.querySelector('button[type="submit"]').textContent = "Menyimpan...";
    await new Promise((resolve) => setTimeout(resolve, 550));

    state.barang.unshift(barangBaru);
    simpanKeStorage();
    perbaruiStatistik();
    renderDaftarBarang();

    el.form.reset();
    el.charCounter.textContent = "0 / 180";
    Object.keys(el.formFields).forEach((kunci) => tampilkanError(kunci, ""));

    const btnSubmit = el.form.querySelector('button[type="submit"]');
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Publikasikan Barang";

    tampilkanToast(`"${barangBaru.nama}" berhasil dipublikasikan!`, "success");

    // Reset filter agar barang baru langsung terlihat
    state.keyword = "";
    state.kategori = "Semua";
    el.inputPencarian.value = "";
    el.btnClearSearch.hidden = true;
    renderSemua();

    el.katalog.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* --------------------------------------------------------------------------
   11. EVENT HANDLING (Week 3)
   -------------------------------------------------------------------------- */
function pasangEvent() {
    // --- Smooth scroll tombol hero ---
    el.btnKatalog?.addEventListener("click", () => {
        el.katalog.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // --- Live Search (Week 4) ---
    el.inputPencarian?.addEventListener(
        "input",
        debounce((event) => {
            state.keyword = event.target.value;
            el.btnClearSearch.hidden = state.keyword.length === 0;
            renderDaftarBarang();
        }, 120)
    );

    el.btnClearSearch?.addEventListener("click", () => {
        el.inputPencarian.value = "";
        state.keyword = "";
        el.btnClearSearch.hidden = true;
        renderDaftarBarang();
        el.inputPencarian.focus();
    });

    // --- Filter kategori (Event Delegation) ---
    el.filterKategori?.addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip) return;

        const kategoriDipilih = chip.dataset.kategori;
        state.kategori = kategoriDipilih;
        renderFilterKategori();
        renderDaftarBarang();

        // Fokus dikembalikan ke chip yang sama agar navigasi keyboard tidak hilang
        const chipBaru = el.filterKategori.querySelector(`.chip[data-kategori="${kategoriDipilih}"]`);
        if (chipBaru) chipBaru.focus();
    });

    // --- Urutkan ---
    el.urutkan?.addEventListener("change", (event) => {
        state.urutan = event.target.value;
        renderDaftarBarang();
    });

    // --- Muat ulang: ambil data terbaru dari API ---
    el.btnReload?.addEventListener("click", async () => {
        const adaDataLokal = Boolean(muatDariStorage());

        if (adaDataLokal) {
            const setuju = confirm(
                "Ganti data di perangkat ini dengan data terbaru dari API? Perubahan lokal akan tertimpa."
            );
            if (!setuju) {
                tampilkanToast("Data di perangkat ini dipertahankan.", "info");
                return;
            }
        }

        await inisialisasiData({ paksaApi: true });

        if (state.gagalMemuat) {
            tampilkanToast("Gagal memuat data dari API.", "error");
        } else {
            tampilkanToast("Data katalog dimuat ulang dari API.", "info");
        }
    });

    // --- Tombol "Coba Lagi" pada error state ---
    el.btnRetry?.addEventListener("click", () => {
        inisialisasiData();
    });

    // --- Buka modal dari kartu (Event Delegation + keyboard) ---
    el.itemList?.addEventListener("click", (event) => {
        const card = event.target.closest(".card");
        if (card) bukaModal(card.dataset.id);
    });

    el.itemList?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest(".card");
        if (!card) return;
        event.preventDefault();
        bukaModal(card.dataset.id);
    });

    // --- Tutup modal: tombol close, klik backdrop, dan tombol Escape ---
    el.closeBtn?.addEventListener("click", tutupModal);

    el.modal?.addEventListener("click", (event) => {
        if (event.target === el.modal) tutupModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (el.modalPenawaran && !el.modalPenawaran.hidden) {
            tutupPenawaran();
        } else if (el.modal && !el.modal.hidden) {
            tutupModal();
        }
    });

    // --- Modal: tahan fokus (Tab) agar tetap di dalam dialog ---
    pasangPerangkapFokus(el.modal);
    pasangPerangkapFokus(el.modalPenawaran);

    // --- Buka formulir penawaran barter (prototipe) ---
    el.btnAjukan?.addEventListener("click", bukaPenawaran);
    el.closePenawaran?.addEventListener("click", tutupPenawaran);
    el.modalPenawaran?.addEventListener("click", (event) => {
        if (event.target === el.modalPenawaran) tutupPenawaran();
    });

    // Ubah pilihan barang -> perbarui perbandingan & tinjauan
    el.penawaranPilih?.addEventListener("change", () => {
        tampilkanErrorPenawaran("penawaran-pilih", "");
        perbaruiPerbandingan();
        sinkronUang();
        perbaruiTinjauan();
    });

    // Pilih mode uang tambahan
    el.uangTanpa?.addEventListener("change", () => {
        if (!el.uangTanpa.checked) return;
        sinkronUang();
        perbaruiTinjauan();
    });
    el.uangDengan?.addEventListener("change", () => {
        if (!el.uangDengan.checked) return;
        sinkronUang();
        perbaruiTinjauan();
        el.penawaranUang?.focus();
    });

    el.penawaranUang?.addEventListener("input", () => {
        tampilkanErrorPenawaran("penawaran-uang", "");
        perbaruiTinjauan();
    });

    el.penawaranSimpan?.addEventListener("click", simpanDraftPenawaran);

    // Hapus satu draft (event delegation)
    el.draftList?.addEventListener("click", (event) => {
        const tombol = event.target.closest("[data-hapus]");
        if (!tombol) return;
        const id = tombol.dataset.hapus;
        state.draftPenawaran = state.draftPenawaran.filter((d) => d.id !== id);
        simpanDraftKeStorage();
        renderDraftPenawaran();
        tampilkanToast("Draft penawaran dihapus.", "info");
    });

    // Hapus semua draft
    el.btnHapusDraft?.addEventListener("click", () => {
        if (state.draftPenawaran.length === 0) return;
        const setuju = confirm("Hapus semua draft penawaran di perangkat ini?");
        if (!setuju) return;
        state.draftPenawaran = [];
        simpanDraftKeStorage();
        renderDraftPenawaran();
        tampilkanToast("Semua draft penawaran dihapus.", "info");
    });

    el.btnHapus?.addEventListener("click", () => {
        const barang = state.barang.find((b) => b.id === state.idAktifModal);
        if (!barang) return;

        const setuju = confirm(`Hapus "${barang.nama}" dari katalog?`);
        if (!setuju) return;

        state.barang = state.barang.filter((b) => b.id !== state.idAktifModal);
        simpanKeStorage();
        perbaruiStatistik();
        renderFilterKategori();
        renderDaftarBarang();
        tutupModal();
        tampilkanToast(`"${barang.nama}" telah dihapus dari katalog.`, "info");
    });

    // --- Form tambah barang ---
    el.form?.addEventListener("submit", tanganiSubmitForm);

    el.form?.addEventListener("reset", () => {
        setTimeout(() => {
            el.charCounter.textContent = "0 / 180";
            Object.keys(el.formFields).forEach((kunci) => tampilkanError(kunci, ""));
        }, 0);
    });

    // --- Counter karakter deskripsi ---
    el.formFields.deskripsi?.addEventListener("input", (event) => {
        el.charCounter.textContent = `${event.target.value.length} / 180`;
    });

    // Hapus tanda error saat user mulai memperbaiki input
    Object.entries(el.formFields).forEach(([nama, field]) => {
        field?.addEventListener("input", () => tampilkanError(nama, ""));
        field?.addEventListener("change", () => tampilkanError(nama, ""));
    });
}

/* --------------------------------------------------------------------------
   12. INISIALISASI APLIKASI
   -------------------------------------------------------------------------- */
function mulai() {
    isiSelectForm();
    state.draftPenawaran = muatDraftPenawaran();
    renderDraftPenawaran();
    pasangEvent();
    inisialisasiData();
}

document.addEventListener("DOMContentLoaded", mulai);
