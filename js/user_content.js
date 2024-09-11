document.addEventListener("DOMContentLoaded", function () {
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

  // Fungsi untuk menampilkan modal formulir permintaan barang
  function showRequestForm(kode_barang) {
    document.getElementById("kodeBarang").value = kode_barang;
    document.getElementById("requestFormModal").style.display = "block";
  }

  // Fungsi untuk menyembunyikan modal formulir permintaan barang
  function hideRequestForm() {
    document.getElementById("requestFormModal").style.display = "none";
  }

  // Fungsi untuk mendapatkan informasi pengguna dari localStorage atau sessionStorage
  function getUserInfo() {
    return {
      id_user: parseInt(localStorage.getItem("userId")) || 0,
      nama: localStorage.getItem("userName") || "Unknown",
    };
  }

  // Menangani klik pada tombol "Minta Barang"
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("request-button")) {
      const kode_barang = event.target.getAttribute("data-kode-barang");
      showRequestForm(kode_barang);
    }
  });

  // Menangani pengiriman formulir permintaan
  document
    .getElementById("requestForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const userInfo = getUserInfo(); // Mendapatkan informasi user

      const data = {
        kode_barang: formData.get("kode_barang"),
        nama_user: userInfo.nama,
        quantity_diminta: parseInt(formData.get("quantity")), // Pastikan quantity adalah number
        status: "Pending",
        catatan: formData.get("catatan") || "", // Jika tidak ada catatan, set menjadi string kosong
        id_user: userInfo.id_user,
      };

      // Tambahkan check untuk id_user agar valid sebelum submit
      if (data.id_user === 0) {
        alert("User ID tidak valid. Silakan login terlebih dahulu.");
        return; // Stop jika user ID tidak valid
      }

      fetch("http://localhost:3000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          alert("Permintaan barang berhasil diajukan.");
          hideRequestForm(); // Tutup modal setelah permintaan dikirim
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Gagal mengajukan permintaan barang: " + error.message);
        });
    });

  // Klik pada tombol close untuk menutup modal
  document
    .querySelector(".modal .close")
    .addEventListener("click", hideRequestForm);

  // Klik di luar modal untuk menutup modal
  window.addEventListener("click", function (event) {
    if (event.target == document.getElementById("requestFormModal")) {
      hideRequestForm();
    }
  });

  // Fungsi untuk menampilkan barang dalam tabel
  function displayBarang(barang) {
    const tbody = document.getElementById("barangDaerahUserTableBody");
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
        <td><button class="request-button" data-kode-barang="${item.kode_barang}">Minta Barang</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Fungsi pencarian
  document
    .getElementById("searchInput")
    .addEventListener("input", searchBarang);

  function searchBarang() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filteredBarang = allBarang.filter((item) =>
      item.nama_barang.toLowerCase().includes(query)
    );
    displayBarang(filteredBarang);
  }

  // Fungsi filter
  document
    .getElementById("tipeBarangFilter")
    .addEventListener("change", filterBarang);
  document
    .getElementById("lokasiDaerahFilter")
    .addEventListener("change", filterBarang);
  document
    .getElementById("lokasiAreaFilter")
    .addEventListener("change", filterBarang);

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
  fetchBarang();
});
