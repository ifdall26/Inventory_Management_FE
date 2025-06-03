let allBarang = []; // Menyimpan semua barang
let filteredBarang = []; // Menyimpan barang setelah difilter atau dicari
let currentPage = 1; // Halaman saat ini untuk barang
const itemsPerPage = 10; // Jumlah barang per halaman

let allRequests = []; // Menyimpan semua request
let currentRequestPage = 1; // Halaman saat ini untuk request
const requestsPerPage = 10; // Jumlah request per halaman

// Fungsi untuk mengambil data barang dari server
function fetchBarang() {
  fetch("https://inventorybe.glitch.me/api/barang_daerah")
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
      <td>Rp.${item.harga_satuan}</td>
      <td>${item.lokasi_daerah}</td>
      <td>${item.lokasi_area}</td>
      <td>${item.tipe_barang}</td>
      <td>${item.gudang}</td>
      <td>${item.lemari}</td>
      <td>
        <button class="edit-button" data-id="${item.kode_lokasi}"><i class="fas fa-pencil-alt"></i></button>
        <button class="delete-button" data-id="${item.kode_lokasi}"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });

  attachActionListeners(); // Pasang event listener setelah render
}

// Memasang event listener untuk tombol edit dan delete
function attachActionListeners() {
  // Edit
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      editBarang(id);
    });
  });

  // Delete
  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");

      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteBarang(id);
        }
      });
    });
  });
}

// Fungsi delete berdasarkan kode_lokasi
function deleteBarang(kode_lokasi) {
  fetch(`https://inventorybe.glitch.me/api/barang_daerah/${kode_lokasi}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Gagal menghapus barang");
      }
      return res.json();
    })
    .then(() => {
      Swal.fire({
        title: "Berhasil!",
        text: "Barang berhasil dihapus.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      loadBarang(); // Reload data
    })
    .catch((err) => {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus barang",
        icon: "error",
      });
    });
}

// Fungsi edit berdasarkan kode_lokasi
function editBarang(kode_lokasi) {
  const modal = document.getElementById("editBarangModal");
  const form = document.getElementById("editBarangForm");

  fetch(`https://inventorybe.glitch.me/api/barang_daerah/${kode_lokasi}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error fetching barang: ${res.statusText}`);
      }
      return res.json();
    })
    .then((barang) => {
      if (!barang) {
        alert("Barang tidak ditemukan.");
        return;
      }

      console.log("Data barang:", barang); // Tambahkan ini untuk debugging
      console.log("Quantity:", barang.quantity);

      // Isi form dengan data barang
      document.getElementById("kode_barang").value = barang.kode_barang ?? "";
      document.getElementById("nama_barang").value = barang.nama_barang ?? "";
      document.getElementById("editQuantity").value = barang.quantity;

      console.log(
        "Quantity yang ditampilkan di form:",
        document.getElementById("editQuantity").value
      );

      document.getElementById("satuan").value = barang.satuan ?? "";
      document.getElementById("harga_satuan").value = barang.harga_satuan ?? "";
      document.getElementById("lokasi_daerah").value =
        barang.lokasi_daerah ?? "";
      document.getElementById("lokasi_area").value = barang.lokasi_area ?? "";
      document.getElementById("tipe_barang").value = barang.tipe_barang ?? "";
      document.getElementById("gudang").value = barang.gudang ?? "";
      document.getElementById("lemari").value = barang.lemari ?? "";

      modal.style.display = "block";

      form.onsubmit = function (event) {
        event.preventDefault();

        const formData = {
          kode_barang: form.kode_barang.value,
          nama_barang: form.nama_barang.value,
          quantity: parseInt(form.quantity.value, 10) || 0,
          satuan: form.satuan.value,
          harga_satuan: parseInt(form.harga_satuan.value, 10) || 0,
          lokasi_daerah: form.lokasi_daerah.value,
          lokasi_area: form.lokasi_area.value,
          tipe_barang: form.tipe_barang.value,
          gudang: form.gudang.value,
          lemari: form.lemari.value,
        };

        fetch(
          `https://inventorybe.glitch.me/api/barang_daerah/${kode_lokasi}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error("Gagal mengupdate barang");
            }
            return res.json();
          })
          .then(() => {
            alert("Barang berhasil diperbarui");
            loadBarang();
            modal.style.display = "none";
            location.reload();
          })
          .catch((err) => {
            console.error("Error:", err);
            alert("Terjadi kesalahan saat mengupdate barang");
          });
      };
    })
    .catch((err) => {
      console.error("Error fetching barang:", err);
      alert(`Terjadi kesalahan saat mengambil data barang: ${err.message}`);
    });
  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

// Fungsi untuk memuat ulang data barang dari server
function loadBarang() {
  fetch("https://inventorybe.glitch.me/api/barang_daerah")
    .then((res) => res.json())
    .then((data) => {
      allBarang = data;
      filteredBarang = allBarang;
      displayBarangWithPagination();
    })
    .catch((err) => console.error("Gagal mengambil data barang:", err));
}

// Panggil loadBarang() saat halaman dimuat
window.addEventListener("DOMContentLoaded", loadBarang);

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
  fetch("https://inventorybe.glitch.me/api/requests") // Ganti endpoint untuk barang daerah
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

function displayRequestsWithPagination() {
  const startIndex = (currentRequestPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const paginatedRequests = allRequests.slice(startIndex, endIndex);

  displayRequests(paginatedRequests);
  displayRequestPagination();
}

function formatTanggalIndonesia(dateString) {
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const date = new Date(dateString);
  const tgl = date.getDate();
  const bln = bulan[date.getMonth()];
  const thn = date.getFullYear();

  return `${tgl} ${bln} ${thn}`;
}

function displayRequests(requests) {
  const tbody = document.getElementById("requestTableBody");
  tbody.innerHTML = "";

  requests.forEach((request) => {
    const formattedDateReq = formatTanggalIndonesia(request.tanggal_request);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${request.id_request}</td>
      <td>${request.nama_user}</td>
      <td>${request.kode_barang}</td>
      <td>${request.quantity_diminta}</td>
      <td>${request.status}</td>
      <td>${formattedDateReq}</td>
      <td>${request.catatan}</td>
    `;
    tbody.appendChild(row);
  });
}

function displayRequestPagination() {
  const paginationElement = document.getElementById("requestPagination");
  paginationElement.innerHTML = "";

  const totalPages = Math.ceil(allRequests.length / requestsPerPage);
  const maxButtons = 10;
  const half = Math.floor(maxButtons / 2);

  let startPage = Math.max(1, currentRequestPage - half);
  let endPage = Math.min(totalPages, currentRequestPage + half);

  if (currentRequestPage <= half) {
    endPage = Math.min(totalPages, maxButtons);
  }

  if (currentRequestPage + half >= totalPages) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentRequestPage === 1;
  prevButton.classList.add("page-btn");
  prevButton.addEventListener("click", function () {
    if (currentRequestPage > 1) {
      currentRequestPage--;
      displayRequestsWithPagination();
    }
  });
  paginationElement.appendChild(prevButton);

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.classList.add("page-btn");
    if (i === currentRequestPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", function () {
      currentRequestPage = i;
      displayRequestsWithPagination();
    });
    paginationElement.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentRequestPage === totalPages;
  nextButton.classList.add("page-btn");
  nextButton.addEventListener("click", function () {
    if (currentRequestPage < totalPages) {
      currentRequestPage++;
      displayRequestsWithPagination();
    }
  });
  paginationElement.appendChild(nextButton);
}

function filterRequestByDate() {
  const selectedMonth = document.getElementById("filterMonth").value;
  const selectedYear = document.getElementById("filterYear").value;

  const filtered = allRequests.filter((req) => {
    const reqDate = new Date(req["tanggal_request"]);
    return (
      (!selectedMonth || reqDate.getMonth() + 1 === parseInt(selectedMonth)) &&
      (!selectedYear || reqDate.getFullYear() === parseInt(selectedYear))
    );
  });

  displayRequests(filtered);
}

function populateYearOptions() {
  const currentYear = new Date().getFullYear();
  const filterYear = document.getElementById("filterYear");
  for (let year = currentYear; year >= currentYear - 5; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    filterYear.appendChild(option);
  }
}
populateYearOptions();

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
