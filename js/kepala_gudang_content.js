// kepala_gudang_content.js

let allBarangKepalaGudang = [];
let currentPageKepalaGudang = 1;
const itemsPerPageKepalaGudang = 10;

document.addEventListener("DOMContentLoaded", () => {
  fetchBarangKepalaGudang();

  document
    .getElementById("searchInputKepalaGudang")
    .addEventListener("input", searchBarangKepalaGudang);
  document
    .getElementById("resetFiltersKepalaGudang")
    .addEventListener("click", resetFiltersKepalaGudang);

  [
    "tipeBarangFilterKepalaGudang",
    "lokasiDaerahFilterKepalaGudang",
    "lokasiAreaFilterKepalaGudang",
    "gudangFilterKepalaGudang",
    "lemariFilterKepalaGudang",
  ].forEach((id) => {
    document
      .getElementById(id)
      .addEventListener("change", filterBarangKepalaGudang);
  });
});

function fetchBarangKepalaGudang() {
  fetch("https://inventorybe.glitch.me/api/barang_daerah")
    .then((res) => res.json())
    .then((data) => {
      allBarangKepalaGudang = data;
      renderBarangKepalaGudang();
    })
    .catch((err) => console.error("Error fetching barang:", err));
}

function renderBarangKepalaGudang() {
  const filteredBarang = getFilteredBarangKepalaGudang();
  const start = (currentPageKepalaGudang - 1) * itemsPerPageKepalaGudang;
  const paginatedBarang = filteredBarang.slice(
    start,
    start + itemsPerPageKepalaGudang
  );
  const tbody = document.getElementById("barangKepalaGudangTableBody");
  tbody.innerHTML = "";

  paginatedBarang.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
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
    tbody.appendChild(tr);
  });

  renderPaginationKepalaGudang(filteredBarang.length);
}

function getFilteredBarangKepalaGudang() {
  const search = document
    .getElementById("searchInputKepalaGudang")
    .value.toLowerCase();
  const tipe = document.getElementById("tipeBarangFilterKepalaGudang").value;
  const daerah = document.getElementById(
    "lokasiDaerahFilterKepalaGudang"
  ).value;
  const area = document.getElementById("lokasiAreaFilterKepalaGudang").value;
  const gudang = document.getElementById("gudangFilterKepalaGudang").value;
  const lemari = document.getElementById("lemariFilterKepalaGudang").value;

  return allBarangKepalaGudang.filter((item) => {
    const matchesSearch =
      item.nama_barang.toLowerCase().includes(search) ||
      item.kode_barang.toLowerCase().includes(search);
    const matchesTipe = !tipe || item.tipe_barang === tipe;
    const matchesDaerah = !daerah || item.lokasi_daerah === daerah;
    const matchesArea = !area || item.lokasi_area === area;
    const matchesGudang = !gudang || item.gudang === gudang;
    const matchesLemari = !lemari || item.lemari === lemari;

    return (
      matchesSearch &&
      matchesTipe &&
      matchesDaerah &&
      matchesArea &&
      matchesGudang &&
      matchesLemari
    );
  });
}

function searchBarangKepalaGudang() {
  currentPageKepalaGudang = 1;
  renderBarangKepalaGudang();
}

function filterBarangKepalaGudang() {
  currentPageKepalaGudang = 1;
  renderBarangKepalaGudang();
}

function resetFiltersKepalaGudang() {
  document.getElementById("searchInputKepalaGudang").value = "";
  document.getElementById("tipeBarangFilterKepalaGudang").value = "";
  document.getElementById("lokasiDaerahFilterKepalaGudang").value = "";
  document.getElementById("lokasiAreaFilterKepalaGudang").value = "";
  document.getElementById("gudangFilterKepalaGudang").value = "";
  document.getElementById("lemariFilterKepalaGudang").value = "";
  currentPageKepalaGudang = 1;
  renderBarangKepalaGudang();
}

function renderPaginationKepalaGudang(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPageKepalaGudang);
  const paginationContainer = document.getElementById(
    "paginationControlsKepalaGudang"
  );
  paginationContainer.innerHTML = "";

  const maxButtons = 10;
  const half = Math.floor(maxButtons / 2);
  let startPage = Math.max(1, currentPageKepalaGudang - half);
  let endPage = Math.min(totalPages, currentPageKepalaGudang + half);

  if (currentPageKepalaGudang <= half) {
    endPage = Math.min(totalPages, maxButtons);
  }
  if (currentPageKepalaGudang + half >= totalPages) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  // Tombol Previous
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPageKepalaGudang === 1;
  prevButton.classList.add("page-btn");
  prevButton.addEventListener("click", () => {
    if (currentPageKepalaGudang > 1) {
      currentPageKepalaGudang--;
      renderBarangKepalaGudang();
    }
  });
  paginationContainer.appendChild(prevButton);

  // Tombol Halaman
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");
    if (i === currentPageKepalaGudang) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      currentPageKepalaGudang = i;
      renderBarangKepalaGudang();
    });
    paginationContainer.appendChild(pageButton);
  }

  // Tombol Next
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPageKepalaGudang === totalPages;
  nextButton.classList.add("page-btn");
  nextButton.addEventListener("click", () => {
    if (currentPageKepalaGudang < totalPages) {
      currentPageKepalaGudang++;
      renderBarangKepalaGudang();
    }
  });
  paginationContainer.appendChild(nextButton);
}
