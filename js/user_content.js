document.addEventListener("DOMContentLoaded", function () {
  let allBarang = [];
  let filteredBarang = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  const userId = localStorage.getItem("userId");

  function fetchBarang() {
    fetch("http://localhost:3000/api/barang_daerah")
      .then((response) => response.json())
      .then((data) => {
        allBarang = data;
        filteredBarang = allBarang;
        displayBarang(filteredBarang, currentPage);
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

  // Fungsi untuk mendapatkan informasi pengguna dari localStorage
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

      // Cek apakah stok barang habis
      const selectedBarang = allBarang.find(
        (item) => item.kode_barang === kode_barang
      );

      if (selectedBarang.quantity <= 0) {
        // Tampilkan SweetAlert jika stok habis
        Swal.fire({
          title: "Stok Habis!",
          text: "Lakukan permintaan ke gudang?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya",
          cancelButtonText: "Tidak",
        }).then((result) => {
          if (result.isConfirmed) {
            // Jika pengguna memilih "Ya", tampilkan form pencarian barang di gudang
            showGudangRequestForm();
          }
        });
      } else {
        // Jika stok cukup, tampilkan form permintaan barang biasa
        showRequestForm(kode_barang);
      }
    }
  });

  function showGudangRequestForm() {
    Swal.fire({
      title: "Cari Barang di Gudang",
      html: `
        <form id="gudangRequestForm">
          <label for="namaBarangGudang">Nama Barang:</label>
          <input type="text" id="namaBarangGudang" name="nama_barang" required>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Cari",
      preConfirm: () => {
        const namaBarangGudang =
          document.getElementById("namaBarangGudang").value;
        return namaBarangGudang
          ? namaBarangGudang
          : Swal.showValidationMessage("Nama barang diperlukan");
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Lakukan pencarian barang di gudang berdasarkan nama
        searchBarangGudang(result.value);
      }
    });
  }

  function searchBarangGudang(namaBarang) {
    fetch(
      `http://localhost:3000/api/barang_gudang/by-name/${encodeURIComponent(
        namaBarang
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // Jika barang ditemukan, tampilkan SweetAlert untuk konfirmasi request
          Swal.fire({
            title: "Barang Ditemukan!",
            text: `Nama Barang: ${data.nama_barang}. Lakukan permintaan?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Ya, Lakukan Permintaan",
            cancelButtonText: "Tidak",
          }).then((result) => {
            if (result.isConfirmed) {
              // Kirim request ke admin gudang untuk disetujui
              submitGudangRequest(data.nama_barang);
            }
          });
        } else {
          Swal.fire({
            title: "Barang Tidak Ditemukan!",
            text: "Tidak ada barang yang sesuai dengan pencarian.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) =>
        console.error("Error mencari barang di gudang:", error)
      );
  }

  function submitGudangRequest(namaBarang) {
    const userInfo = getUserInfo();

    const data = {
      nama_user: userInfo.nama,
      nama_barang: namaBarang, // Tambahkan nama_barang
      quantity_diminta: parseInt(
        prompt("Masukkan jumlah barang yang diminta:")
      ),
      status: "Menunggu Persetujuan Admin",
      catatan: "Permintaan ke gudang",
      id_user: userInfo.id_user,
    };

    fetch("http://localhost:3000/api/requests_gudang", {
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
      .then(() => {
        Swal.fire({
          title: "Permintaan Berhasil!",
          text: "Permintaan Anda telah dikirim ke admin gudang untuk persetujuan.",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((error) => {
        console.error("Error submitting gudang request:", error);
        Swal.fire({
          title: "Gagal!",
          text: "Gagal mengirim permintaan ke gudang: " + error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  }

  // Menangani pengiriman formulir permintaan
  document
    .getElementById("requestForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const userInfo = getUserInfo();

      const data = {
        kode_barang: formData.get("kode_barang"),
        nama_user: userInfo.nama,
        quantity_diminta: parseInt(formData.get("quantity")),
        status: "Disetujui",
        catatan: formData.get("catatan") || "",
        id_user: userInfo.id_user,
      };

      if (data.id_user === 0) {
        Swal.fire({
          title: "Gagal!",
          text: "User ID tidak valid. Silakan login terlebih dahulu.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
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
          console.log("Request berhasil:", data);
          updateStock(data.kode_barang, data.quantity_diminta);
          Swal.fire({
            title: "Permintaan Berhasil!",
            text: "Permintaan Anda telah berhasil dikirim. Stok barang akan diperbarui.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            hideRequestForm(); // Tutup modal setelah permintaan dikirim
            window.location.reload(); // Refresh halaman setelah modal ditutup
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire({
            title: "Gagal!",
            text: "Gagal mengajukan permintaan barang: " + error.message,
            icon: "error",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload(); // Refresh halaman setelah SweetAlert2 ditutup
          });
        });
    });

  // Fungsi untuk mengupdate stok barang
  function updateStock(kode_barang, quantity_diminta) {
    quantity_diminta = parseFloat(quantity_diminta);

    if (isNaN(quantity_diminta) || quantity_diminta <= 0) {
      console.error("Jumlah yang diminta tidak valid.");
      return;
    }

    fetch(`http://localhost:3000/api/barang_daerah/${kode_barang}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity: -quantity_diminta }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || "Network response was not ok");
          });
        }
        return response.json();
      })
      .then(() => {
        console.log("Menampilkan SweetAlert");
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Permintaan Berhasil!",
            text: "Barang bisa diambil di lokasi. Stok barang telah diperbarui.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            hideRequestForm(); // Tutup modal setelah permintaan dikirim
          });
        } else {
          console.error("SweetAlert2 tidak terdefinisi.");
        }
      })
      .catch((error) => {
        console.error("Error updating stock:", error);
        alert("Gagal memperbarui stok barang: " + error.message);
      });
  }

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
    tbody.innerHTML = "";

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
    paginationControls.innerHTML = "";

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
    displayBarang(filteredBarang, currentPage);
  }

  // Fungsi pencarian dan filter
  document
    .getElementById("searchInput")
    .addEventListener("input", searchAndFilterBarang);
  document
    .getElementById("tipeBarangFilter")
    .addEventListener("change", searchAndFilterBarang);
  document
    .getElementById("lokasiDaerahFilter")
    .addEventListener("change", searchAndFilterBarang);
  document
    .getElementById("lokasiAreaFilter")
    .addEventListener("change", searchAndFilterBarang);

  // Fungsi gabungan pencarian dan filter
  function searchAndFilterBarang() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const tipeBarang = document.getElementById("tipeBarangFilter").value;
    const lokasiDaerah = document.getElementById("lokasiDaerahFilter").value;
    const lokasiArea = document.getElementById("lokasiAreaFilter").value;

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

    displayBarang(filteredBarang, 1);
  }

  function fetchUserRequests() {
    fetch(`http://localhost:3000/api/requests/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        displayUserRequests(data);
      })
      .catch((error) => console.error("Error fetching user requests:", error));
  }

  // Fungsi untuk menampilkan request user dalam tabel
  function displayUserRequests(requests) {
    const tbody = document.getElementById("userRequestTableBody");
    tbody.innerHTML = "";

    requests.forEach((request) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${request.kode_barang}</td>
        <td>${request.nama_user}</td>
        <td>${request.quantity_diminta}</td>
        <td>${request.status}</td>
        <td>${request.tanggal_request}</td>
        <td>${request.catatan}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Ambil data barang dan request user saat halaman dimuat
  fetchBarang();
  fetchUserRequests();
});
