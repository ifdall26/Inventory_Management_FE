// resetfilter.js

// Fungsi untuk mereset semua filter
function resetFilters() {
  document.getElementById("searchInput").value = ""; // Reset input pencarian
  document.getElementById("tipeBarangFilter").value = ""; // Reset tipe barang
  document.getElementById("lokasiDaerahFilter").value = ""; // Reset lokasi daerah
  document.getElementById("lokasiAreaFilter").value = ""; // Reset lokasi area
  document.getElementById("gudangFilter").value = ""; // Reset gudang
  document.getElementById("lemariFilter").value = ""; // Reset lemari

  // Panggil fungsi pencarian dan filter untuk menerapkan reset
  searchAndFilterBarang();
}

// Fungsi untuk menambahkan event listener ke tombol reset
function addResetListener(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    console.log(`Adding event listener to ${buttonId}`);
    button.addEventListener("click", resetFilters);
  } else {
    console.log(`Button with id ${buttonId} not found`);
  }
}

// Menambahkan event listener untuk tombol reset
addResetListener("resetFilters");
addResetListener("resetFilterAdmin");
