document
  .getElementById("barangDaerahForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
      kode_barang: formData.get("kode_barang"),
      nama_barang: formData.get("nama_barang"),
      quantity: formData.get("quantity"),
      satuan: formData.get("satuan"),
      harga_satuan: formData.get("harga_satuan"),
      lokasi_daerah: formData.get("lokasi_daerah"),
      lokasi_area: formData.get("lokasi_area"),
      tipe_barang: formData.get("tipe_barang"),
    };

    fetch("http://localhost:3000/api/barang_daerah", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        alert("Barang berhasil ditambahkan");
        document.getElementById("barangDaerahForm").reset(); // Clear form fields
        fetchBarang(); // Reload data after adding
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Gagal menambahkan barang: " + error.message);
      });
  });

let allBarang = []; // Menyimpan semua barang
let currentPage = 1; // Halaman saat ini
const itemsPerPage = 10; // Jumlah barang per halaman

// Fungsi untuk mengambil data barang dari server
function fetchBarang() {
  fetch("http://localhost:3000/api/barang_daerah")
    .then((response) => response.json())
    .then((data) => {
      allBarang = data; // Simpan semua barang
      displayBarangWithPagination(); // Tampilkan barang dengan pagination
    })
    .catch((error) => console.error("Error fetching barang:", error));
}

// Fungsi untuk menampilkan barang dengan pagination
function displayBarangWithPagination() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBarang = allBarang.slice(startIndex, endIndex);

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
  const filteredBarang = allBarang.filter((item) =>
    item.nama_barang.toLowerCase().includes(query)
  );
  displayBarang(filteredBarang);
}

// Fungsi filter
function filterBarang() {
  const tipeBarang = document.getElementById("tipeBarangFilter").value;
  const lokasiDaerah = document.getElementById("lokasiDaerahFilter").value;
  const lokasiArea = document.getElementById("lokasiAreaFilter").value;

  const filteredBarang = allBarang.filter((item) => {
    const matchesTipe = !tipeBarang || item.tipe_barang === tipeBarang;
    const matchesLokasiDaerah =
      !lokasiDaerah || item.lokasi_daerah === lokasiDaerah;
    const matchesLokasiArea = !lokasiArea || item.lokasi_area === lokasiArea;

    return matchesTipe && matchesLokasiDaerah && matchesLokasiArea;
  });

  displayBarang(filteredBarang);
}

// Fungsi untuk menampilkan kontrol pagination
function displayPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Kosongkan elemen pagination

  const totalPages = Math.ceil(allBarang.length / itemsPerPage);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayBarangWithPagination();
    }
  });
  paginationContainer.appendChild(prevButton);

  const pageDisplay = document.createElement("span");
  pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(pageDisplay);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayBarangWithPagination();
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Fungsi untuk menjalankan pencarian dan pagination bersamaan
function searchWithPagination() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filteredBarang = allBarang.filter((item) =>
    item.nama_barang.toLowerCase().includes(query)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBarang = filteredBarang.slice(startIndex, endIndex);

  displayBarang(paginatedBarang);
  displayPagination();
}

// Panggil fetchBarang saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  fetchBarang();
});
