let allBarang = []; // Menyimpan semua barang
let filteredBarang = []; // Menyimpan barang setelah difilter atau dicari
let currentPage = 1; // Halaman saat ini untuk barang
const itemsPerPage = 10; // Jumlah barang per halaman

let allRequests = []; // Menyimpan semua request
let currentRequestPage = 1; // Halaman saat ini untuk request
const requestsPerPage = 10; // Jumlah request per halaman

// Fungsi untuk mengambil data barang dari server
function fetchBarang() {
  fetch("http://localhost:3000/api/barang_daerah")
    .then((response) => response.json())
    .then((data) => {
      allBarang = data;
      filteredBarang = allBarang;
      displayBarangWithPagination();
    })
    .catch((error) => console.error("Error fetching barang:", error));
}

// Fungsi untuk menampilkan barang dengan pagination
function displayBarangWithPagination() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBarang = filteredBarang.slice(startIndex, endIndex);

  displayBarang(paginatedBarang);
  displayBarangPagination();
}

// Fungsi untuk menampilkan barang dalam tabel
function displayBarang(barang) {
  const tbody = document.getElementById("barangTableBody");
  tbody.innerHTML = "";

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

// Fungsi untuk menampilkan pagination untuk barang
function displayBarangPagination() {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = ""; // Kosongkan pagination

  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("page-btn");
    if (i === currentPage) {
      pageButton.classList.add("active"); // Tandai halaman aktif
    }
    pageButton.addEventListener("click", function () {
      currentPage = i;
      displayBarangWithPagination();
    });
    paginationElement.appendChild(pageButton);
  }
}

// Fungsi pencarian dan filter
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

// Fungsi untuk load request dari server
function loadRequests() {
  fetch("http://localhost:3000/api/requests")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      allRequests = data;
      displayRequestsWithPagination();
    })
    .catch((error) => console.error("Error loading requests:", error));
}

// Fungsi untuk menampilkan request dengan pagination
function displayRequestsWithPagination() {
  const startIndex = (currentRequestPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const paginatedRequests = allRequests.slice(startIndex, endIndex);

  displayRequests(paginatedRequests);
  displayRequestPagination();
}

// Fungsi untuk menampilkan requests dalam tabel
function displayRequests(requests) {
  const tbody = document.getElementById("requestTableBody");
  tbody.innerHTML = "";

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${request.id_request}</td>
      <td>${request.nama_user}</td>
      <td>${request.kode_barang}</td>
      <td>${request.quantity_diminta}</td>
      <td>${request.status}</td>
      <td>${request.catatan}</td>
    `;
    tbody.appendChild(row);
  });
}

// Fungsi untuk menampilkan pagination untuk requests
function displayRequestPagination() {
  const paginationElement = document.getElementById("requestPagination");
  paginationElement.innerHTML = ""; // Kosongkan pagination

  const totalPages = Math.ceil(allRequests.length / requestsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("page-btn");
    if (i === currentRequestPage) {
      pageButton.classList.add("active"); // Tandai halaman aktif
    }
    pageButton.addEventListener("click", function () {
      currentRequestPage = i;
      displayRequestsWithPagination();
    });
    paginationElement.appendChild(pageButton);
  }
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
  loadRequests(); // Panggil fungsi untuk load requests
});
