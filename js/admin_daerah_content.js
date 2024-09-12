let allBarang = []; // Menyimpan semua barang
let filteredBarang = []; // Menyimpan barang setelah difilter atau dicari
let currentPage = 1; // Halaman saat ini
const itemsPerPage = 10; // Jumlah barang per halaman

// Fungsi untuk mengambil data barang dari server
function fetchBarang() {
  fetch("http://localhost:3000/api/barang_daerah")
    .then((response) => response.json())
    .then((data) => {
      allBarang = data; // Simpan semua barang
      filteredBarang = allBarang; // Inisialisasi filter dengan semua barang
      displayBarangWithPagination(); // Tampilkan barang dengan pagination
    })
    .catch((error) => console.error("Error fetching barang:", error));
}

// Fungsi untuk menampilkan barang dengan pagination
function displayBarangWithPagination() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBarang = filteredBarang.slice(startIndex, endIndex);

  displayBarang(paginatedBarang);
  displayPagination();
}

// Fungsi untuk menampilkan barang dalam tabel
function displayBarang(barang) {
  const tbody = document.getElementById("barangTableBody");
  tbody.innerHTML = ""; // Kosongkan tabel

  barang.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.kode_barang}</td>
      <td>${item.nama_barang}</td>
      <td>${item.quantity}</td>
      <td>${item.satuan}</td>
      <td>${item.harga_satuan}</td>
      <td>${item.lokasi_daerah}</td>
      <td>${item.lokasi_area}</td>
      <td>${item.tipe_barang}</td>
    `;
    tbody.appendChild(row);
  });
}

// Fungsi pencarian
function searchBarang() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  filteredBarang = allBarang.filter((item) =>
    item.nama_barang.toLowerCase().includes(query)
  );
  currentPage = 1; // Reset ke halaman pertama
  displayBarangWithPagination();
}

// Fungsi pencarian
function searchBarang() {
  const query = document.getElementById("adminSearchInput").value.toLowerCase(); // Ubah ID sesuai dengan elemen HTML
  console.log("Search query:", query); // Debugging
  filteredBarang = allBarang.filter((item) =>
    item.nama_barang.toLowerCase().includes(query)
  );
  currentPage = 1; // Reset ke halaman pertama
  displayBarangWithPagination();
}

// Fungsi filter
function filterBarang() {
  const tipeBarang = document.getElementById("adminTipeBarangFilter").value; // Ubah ID sesuai dengan elemen HTML
  const lokasiDaerah = document.getElementById("adminLokasiDaerahFilter").value;
  const lokasiArea = document.getElementById("adminLokasiAreaFilter").value;

  console.log("Filter values:", { tipeBarang, lokasiDaerah, lokasiArea }); // Debugging

  filteredBarang = allBarang.filter((item) => {
    const matchesTipe = !tipeBarang || item.tipe_barang === tipeBarang;
    const matchesLokasiDaerah =
      !lokasiDaerah || item.lokasi_daerah === lokasiDaerah;
    const matchesLokasiArea = !lokasiArea || item.lokasi_area === lokasiArea;

    return matchesTipe && matchesLokasiDaerah && matchesLokasiArea;
  });

  currentPage = 1; // Reset ke halaman pertama
  displayBarangWithPagination();
}

// Fungsi untuk menjalankan filter dan pencarian bersamaan
function applySearchAndFilter() {
  const query = document.getElementById("adminSearchInput").value.toLowerCase();
  const tipeBarang = document.getElementById("adminTipeBarangFilter").value;
  const lokasiDaerah = document.getElementById("adminLokasiDaerahFilter").value;
  const lokasiArea = document.getElementById("adminLokasiAreaFilter").value;

  filteredBarang = allBarang.filter((item) => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(query);
    const matchesTipe = !tipeBarang || item.tipe_barang === tipeBarang;
    const matchesLokasiDaerah =
      !lokasiDaerah || item.lokasi_daerah === lokasiDaerah;
    const matchesLokasiArea = !lokasiArea || item.lokasi_area === lokasiArea;

    return (
      matchesSearch && matchesTipe && matchesLokasiDaerah && matchesLokasiArea
    );
  });

  currentPage = 1; // Reset ke halaman pertama
  displayBarangWithPagination();
}

// Event listeners for search and filter
document
  .getElementById("adminSearchInput")
  .addEventListener("input", applySearchAndFilter);
document
  .getElementById("adminTipeBarangFilter")
  .addEventListener("change", applySearchAndFilter);
document
  .getElementById("adminLokasiDaerahFilter")
  .addEventListener("change", applySearchAndFilter);
document
  .getElementById("adminLokasiAreaFilter")
  .addEventListener("change", applySearchAndFilter);

// Panggil fetchBarang saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchBarang();
});
