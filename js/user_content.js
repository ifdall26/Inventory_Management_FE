document.addEventListener("DOMContentLoaded", function () {
  let allBarang = [];
  let currentPage = 1;
  const itemsPerPage = 10; // Menentukan jumlah item per halaman

  // Fungsi untuk mengambil data barang dari server dan menyimpan di allBarang
  function fetchBarang() {
    fetch("http://localhost:3000/api/barang_daerah")
      .then((response) => response.json())
      .then((data) => {
        allBarang = data; // Simpan semua barang
        displayBarang(allBarang, currentPage); // Tampilkan barang untuk halaman saat ini
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

  // Fungsi untuk menampilkan barang dalam tabel berdasarkan halaman
  function displayBarang(barang, page) {
    const tbody = document.getElementById("barangDaerahUserTableBody");
    tbody.innerHTML = ""; // Kosongkan tabel

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = barang.slice(start, end);

    paginatedItems.forEach((item) => {
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

    setupPaginationControls(barang.length, page);
  }
  // Fungsi untuk membuat tombol pagination
  function setupPaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationControls = document.getElementById("paginationControls");
    paginationControls.innerHTML = ""; // Kosongkan pagination

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className = i === currentPage ? "active" : "";
      pageButton.addEventListener("click", function () {
        changePage(i);
      });
      paginationControls.appendChild(pageButton);
    }
  }

  // Fungsi untuk mengubah halaman
  function changePage(page) {
    currentPage = page;
    displayBarang(allBarang, currentPage);
  }

  // Fungsi pencarian dan filter tetap menggunakan displayBarang dengan parameter page
  document
    .getElementById("searchInput")
    .addEventListener("input", searchBarang);

  function searchBarang() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filteredBarang = allBarang.filter((item) =>
      item.nama_barang.toLowerCase().includes(query)
    );
    displayBarang(filteredBarang, 1); // Tampilkan hasil pencarian mulai dari halaman pertama
  }

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

    displayBarang(filteredBarang, 1); // Tampilkan hasil filter mulai dari halaman pertama
  }

  // Ambil data barang saat halaman dimuat
  fetchBarang();
});
