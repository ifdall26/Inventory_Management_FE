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
      <td>${item.kode_lokasi}</td>
      <td>${item.kode_barang}</td>
      <td>${item.nama_barang}</td>
      <td>${item.quantity}</td>
      <td>${item.satuan}</td>
      <td>${item.harga_satuan}</td>
      <td>${item.lokasi_daerah}</td>
      <td>${item.lokasi_area}</td>
      <td>${item.tipe_barang}</td>
      <td>${item.gudang}</td>
      <td>${item.lemari}</td>
    `;
    tbody.appendChild(row);
  });
}

// Fungsi untuk menampilkan pagination untuk barang
function displayBarangPagination() {
  const paginationElement = document.getElementById("pagination");
  paginationElement.innerHTML = ""; // Kosongkan pagination

  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);
  const maxButtons = 10; // Maksimal 10 tombol
  const half = Math.floor(maxButtons / 2);

  // Hitung halaman awal dan akhir yang akan ditampilkan
  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  // Jika halaman awal terlalu dekat ke awal
  if (currentPage <= half) {
    endPage = Math.min(totalPages, maxButtons);
  }

  // Jika halaman akhir terlalu dekat ke akhir
  if (currentPage + half >= totalPages) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  // Tombol Previous
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1; // Nonaktifkan jika di halaman pertama
  prevButton.classList.add("page-btn");
  prevButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      displayBarangWithPagination();
    }
  });
  paginationElement.appendChild(prevButton);

  // Tombol untuk halaman dalam range
  for (let i = startPage; i <= endPage; i++) {
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

  // Tombol Next
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages; // Nonaktifkan jika di halaman terakhir
  nextButton.classList.add("page-btn");
  nextButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      displayBarangWithPagination();
    }
  });
  paginationElement.appendChild(nextButton);
}

// Fungsi untuk mereset filter admin
function resetAdminFilters() {
  document.getElementById("adminSearchInput").value = ""; // Reset input pencarian
  document.getElementById("adminTipeBarangFilter").value = ""; // Reset tipe barang
  document.getElementById("adminLokasiDaerahFilter").value = ""; // Reset lokasi daerah
  document.getElementById("adminLokasiAreaFilter").value = ""; // Reset lokasi area
  document.getElementById("adminGudangFilter").value = ""; // Reset gudang
  document.getElementById("adminLemariFilter").value = ""; // Reset lemari

  // Panggil kembali fungsi pencarian dan filter untuk menerapkan reset
  applySearchAndFilter();
}

// Event listener untuk tombol reset filter admin
document
  .getElementById("resetFilterAdmin")
  .addEventListener("click", resetAdminFilters);

// Fungsi pencarian dan filter
function applySearchAndFilter() {
  const query = document.getElementById("adminSearchInput").value.toLowerCase();
  const tipeBarang = document.getElementById("adminTipeBarangFilter").value;
  const lokasiDaerah = document.getElementById("adminLokasiDaerahFilter").value;
  const lokasiArea = document.getElementById("adminLokasiAreaFilter").value;
  const gudang = document.getElementById("adminGudangFilter").value; // Tambahkan filter gudang
  const lemari = document.getElementById("adminLemariFilter").value; // Tambahkan filter lemari

  filteredBarang = allBarang.filter((item) => {
    const matchesSearch =
      item.nama_barang.toLowerCase().includes(query) ||
      item.kode_barang.toLowerCase().includes(query);
    const matchesTipe = !tipeBarang || item.tipe_barang === tipeBarang;
    const matchesLokasiDaerah =
      !lokasiDaerah || item.lokasi_daerah === lokasiDaerah;
    const matchesLokasiArea = !lokasiArea || item.lokasi_area === lokasiArea;
    const matchesGudang = !gudang || item.gudang === gudang; // Tambahkan kondisi filter gudang
    const matchesLemari = !lemari || item.lemari === lemari; // Tambahkan kondisi filter lemari

    return (
      matchesSearch &&
      matchesTipe &&
      matchesLokasiDaerah &&
      matchesLokasiArea &&
      matchesGudang && // Periksa kecocokan gudang
      matchesLemari // Periksa kecocokan lemari
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
  const maxButtons = 10; // Maksimal 10 tombol
  const half = Math.floor(maxButtons / 2);

  // Hitung halaman awal dan akhir yang akan ditampilkan
  let startPage = Math.max(1, currentRequestPage - half);
  let endPage = Math.min(totalPages, currentRequestPage + half);

  // Jika halaman awal terlalu dekat ke awal
  if (currentRequestPage <= half) {
    endPage = Math.min(totalPages, maxButtons);
  }

  // Jika halaman akhir terlalu dekat ke akhir
  if (currentRequestPage + half >= totalPages) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  // Tombol Previous
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentRequestPage === 1; // Nonaktifkan jika di halaman pertama
  prevButton.classList.add("page-btn");
  prevButton.addEventListener("click", function () {
    if (currentRequestPage > 1) {
      currentRequestPage--;
      displayRequestsWithPagination();
    }
  });
  paginationElement.appendChild(prevButton);

  // Tombol untuk halaman dalam range
  for (let i = startPage; i <= endPage; i++) {
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

  // Tombol Next
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentRequestPage === totalPages; // Nonaktifkan jika di halaman terakhir
  nextButton.classList.add("page-btn");
  nextButton.addEventListener("click", function () {
    if (currentRequestPage < totalPages) {
      currentRequestPage++;
      displayRequestsWithPagination();
    }
  });
  paginationElement.appendChild(nextButton);
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
document
  .getElementById("adminGudangFilter") // Tambahkan event listener untuk filter gudang
  .addEventListener("change", applySearchAndFilter);
document
  .getElementById("adminLemariFilter") // Tambahkan event listener untuk filter lemari
  .addEventListener("change", applySearchAndFilter);

// Panggil fetchBarang saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchBarang();
  loadRequests(); // Panggil fungsi untuk load requests
});
