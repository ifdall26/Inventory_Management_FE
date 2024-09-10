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
      // Port yang benar
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
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Gagal menambahkan barang: " + error.message);
      });
  });

// Function to fetch and display barang daerah
function loadBarangDaerah() {
  fetch("http://localhost:3000/api/barang_daerah")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const tableBody = document.querySelector("#barangDaerahTable tbody");
      tableBody.innerHTML = ""; // Clear existing rows

      data.forEach((item) => {
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

        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching barang daerah:", error);
      alert("Gagal memuat data barang daerah: " + error.message);
    });
}

// Call loadBarangDaerah when the page loads or when needed
document.addEventListener("DOMContentLoaded", function () {
  loadBarangDaerah();
});

let allBarang = [];

// Fungsi untuk mengambil data barang dari server dan menyimpan di allBarang
function fetchBarang() {
  fetch("http://localhost:3000/api/barang_daerah")
    .then((response) => response.json())
    .then((data) => {
      allBarang = data; // Simpan semua barang
      displayBarang(allBarang); // Tampilkan semua barang
    })
    .catch((error) => console.error("Error fetching barang:", error));
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

// Ambil data barang saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchBarang);
