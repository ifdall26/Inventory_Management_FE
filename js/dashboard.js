document.addEventListener("DOMContentLoaded", async () => {
  // Get the hamburger button and the navigation menu
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("navMenu");

  // Add event listener to the hamburger button
  hamburgerBtn.addEventListener("click", () => {
    // Toggle the "show" class to either display or hide the menu
    navMenu.classList.toggle("show");
  });

  if (window.location.pathname.endsWith("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("User data:", user); // Debugging output

    if (user) {
      // Tampilkan nama pengguna dan role
      document.getElementById("userName").innerText = user.nama;
      document.getElementById("userRole").innerText = user.role;

      // Tampilkan konten berdasarkan role
      if (user.role === "Super Admin") {
        document.getElementById("superAdminContent").style.display = "block";
        document.getElementById("adminGudangContent").style.display = "none";
        document.getElementById("adminDaerahContent").style.display = "none";
        document.getElementById("userContent").style.display = "none";
        fetchAndDisplayAllDataForSuperAdmin(); // Ambil data lengkap untuk Super Admin
      } else if (user.role === "Admin Gudang") {
        document.getElementById("superAdminContent").style.display = "none";
        document.getElementById("adminGudangContent").style.display = "block";
        document.getElementById("adminDaerahContent").style.display = "none";
        document.getElementById("userContent").style.display = "none";
        document.getElementById("userNavigation").style.display = "none";
        document.getElementById("adminDaerahNavigation").style.display = "none";
        document.getElementById("adminGudangNavigation").style.display = "flex";
        fetchAndDisplayItemsForAdmin(1, 5); // Ambil data barang untuk Admin Gudang
        fetchAndDisplayRequestsForAdmin(1, 5);
      } else if (user.role === "Admin Daerah") {
        document.getElementById("superAdminContent").style.display = "none";
        document.getElementById("adminGudangContent").style.display = "none";
        document.getElementById("adminDaerahContent").style.display = "block";
        document.getElementById("userContent").style.display = "none";
        document.getElementById("userNavigation").style.display = "none";
        document.getElementById("adminDaerahNavigation").style.display = "flex";
        document.getElementById("adminGudangNavigation").style.display = "none";
      } else if (user.role === "User Area") {
        document.getElementById("superAdminContent").style.display = "none";
        document.getElementById("adminGudangContent").style.display = "none";
        document.getElementById("adminDaerahContent").style.display = "none";
        document.getElementById("userContent").style.display = "block";
        document.getElementById("userNavigation").style.display = "flex";
        document.getElementById("adminDaerahNavigation").style.display = "none";
        document.getElementById("adminGudangNavigation").style.display = "none";
      }
    } else {
      // Jika tidak ada user yang login, redirect ke login page
      window.location.href = "loginRegister.html";
    }
  }

  // Entry Data Barang (Admin Gudang)
  document
    .getElementById("itemForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const itemData = {
        kode_barang: document.getElementById("kode_barang").value,
        nama_barang: document.getElementById("nama_barang").value,
        quantity: document.getElementById("quantity").value,
        satuan: document.getElementById("satuan").value,
        harga_satuan: document.getElementById("harga_satuan").value,
        tipe_barang: document.getElementById("tipe_barang").value,
      };

      try {
        const response = await fetch(
          "http://localhost:3000/api/barang_gudang",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemData),
          }
        );

        if (response.ok) {
          const result = await response.json();
          Swal.fire("Success!", "Barang berhasil ditambahkan!", "success");
          document.getElementById("itemForm").reset();
          fetchAndDisplayItemsForAdmin(); // Refresh data barang
        } else {
          const result = await response.json();
          Swal.fire("Error!", `Error: ${result.error}`, "error");
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menambahkan barang.",
          "error"
        );
        console.error("Error:", error);
      }
    });
});

// Pencarian dan Filter untuk Admin Gudang
document
  .getElementById("gudangSearchInput")
  .addEventListener("input", applyGudangSearchAndFilter);
document
  .getElementById("gudangTipeBarangFilter")
  .addEventListener("change", applyGudangSearchAndFilter);

function applyGudangSearchAndFilter() {
  const searchKeyword = document
    .getElementById("gudangSearchInput")
    .value.toLowerCase();
  const tipeFilter = document.getElementById("gudangTipeBarangFilter").value;

  const rows = document.querySelectorAll("#itemsTable tbody tr");

  rows.forEach((row) => {
    const namaBarang = row.cells[1].textContent.toLowerCase();
    const tipeBarang = row.cells[5].textContent;

    const matchesSearch = namaBarang.includes(searchKeyword);
    const matchesTipe = tipeFilter === "" || tipeBarang === tipeFilter;

    if (matchesSearch && matchesTipe) {
      row.style.display = ""; // Tampilkan baris yang cocok
    } else {
      row.style.display = "none"; // Sembunyikan baris yang tidak cocok
    }
  });
}

// Fungsi untuk mengambil dan menampilkan data barang untuk Admin Gudang
async function fetchAndDisplayItemsForAdmin(page = 1, itemsPerPage = 5) {
  try {
    const response = await fetch("http://localhost:3000/api/barang_gudang");
    const barang_gudang = await response.json();

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = barang_gudang.slice(start, end);

    const barangGudangTableBody = document.querySelector("#itemsTable tbody");
    barangGudangTableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data baru

    paginatedItems.forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.kode_barang}</td>
        <td>${item.nama_barang}</td>
        <td>${item.quantity}</td>
        <td>${item.satuan}</td>
        <td>${item.harga_satuan}</td>
        <td>${item.tipe_barang}</td>
        <td>
          <button class="edit-btn" data-id="${item.kode_barang}">Edit</button>
          <button class="delete-btn" data-id="${item.kode_barang}">Hapus</button>
        </td>
      `;

      barangGudangTableBody.appendChild(row);
    });

    setupEditAndDeleteButtons(); // Setup tombol edit dan hapus
    setupPagination(
      barang_gudang.length,
      page,
      itemsPerPage,
      "paginationBarang",
      fetchAndDisplayItemsForAdmin
    ); // Setup pagination
  } catch (error) {
    console.error("Error fetching barang_gudang:", error);
  }
}

// Setup tombol edit dan hapus
function setupEditAndDeleteButtons() {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const kodeBarang = button.getAttribute("data-id");
      editItem(kodeBarang);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const kodeBarang = button.getAttribute("data-id");
      deleteItem(kodeBarang);
    });
  });
}

// Fungsi untuk mengedit barang
async function editItem(kodeBarang) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/barang_gudang/${kodeBarang}`
    );
    const item = await response.json();

    const { value: formValues } = await Swal.fire({
      title: "Edit Barang",
      html: `
        <div class="editBarang" style="text-align: left;">
        <label for="swal-input1">Kode Barang:</label>
        <br>
          <input id="swal-input1" class="swal2-input" value="${item.kode_barang}" disabled style="margin-bottom: 10px;">
          <br>
          
          <label for="swal-input2">Nama Barang:</label>
          <br>
          <input id="swal-input2" class="swal2-input" value="${item.nama_barang}" style="margin-bottom: 10px;">
          
          <br>
          <label for="swal-input3">Quantity:</label>
          <br>
          <input id="swal-input3" class="swal2-input" value="${item.quantity}" style="margin-bottom: 10px;">
          
          <br>
          <label for="swal-input4">Satuan:</label>
          <br>
          <input id="swal-input4" class="swal2-input" value="${item.satuan}" style="margin-bottom: 10px;">
          <br>
          
          <label for="swal-input5">Harga Satuan:</label>
          <br>
          <input id="swal-input5" class="swal2-input" value="${item.harga_satuan}" style="margin-bottom: 10px;">

          <label for="swal-input6">Tipe Barang:</label>
          <br>
          <input id="swal-input6" class="swal2-input" value="${item.tipe_barang}" style="margin-bottom: 10px;">
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const nama_barang = document.getElementById("swal-input2").value;
        const quantity = document.getElementById("swal-input3").value;
        const satuan = document.getElementById("swal-input4").value;
        const harga_satuan = document.getElementById("swal-input5").value;
        const tipe_barang = document.getElementById("swal-input6").value;

        console.log("Nama Barang:", nama_barang);
        console.log("Quantity:", quantity);
        console.log("Satuan:", satuan);
        console.log("Harga Satuan:", harga_satuan);
        console.log("Tipe Barang:", tipe_barang);

        return [nama_barang, quantity, satuan, harga_satuan, tipe_barang];
      },
    });

    if (formValues) {
      const [nama_barang, quantity, satuan, harga_satuan, tipe_barang] =
        formValues;

      const updatedItem = {
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        tipe_barang,
      };

      const updateResponse = await fetch(
        `http://localhost:3000/api/barang_gudang/${kodeBarang}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedItem),
        }
      );

      if (updateResponse.ok) {
        Swal.fire("Success!", "Barang berhasil diperbarui!", "success");

        // Refresh data barang
        fetchAndDisplayItemsForAdmin();
      } else {
        Swal.fire("Error!", "Gagal memperbarui barang.", "error");
      }
    }
  } catch (error) {
    Swal.fire("Error!", "Terjadi kesalahan saat mengedit barang.", "error");
    console.error("Error editing item:", error);
  }
}

// Fungsi untuk menghapus barang
async function deleteItem(kodeBarang) {
  Swal.fire({
    title: "Hapus Barang",
    text: "Apakah Anda yakin ingin menghapus barang ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/barang_gudang/${kodeBarang}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Barang berhasil dihapus.", "success");
          fetchAndDisplayItemsForAdmin(); // Refresh data barang
        } else {
          Swal.fire("Error!", "Gagal menghapus barang.", "error");
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menghapus barang.",
          "error"
        );
        console.error("Error deleting item:", error);
      }
    }
  });
}

// Fungsi untuk mengambil dan menampilkan permintaan untuk Admin Gudang
async function fetchAndDisplayRequestsForAdmin(page = 1, itemsPerPage = 5) {
  try {
    const response = await fetch("http://localhost:3000/api/requests_gudang");
    const requests = await response.json();

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedRequests = requests.slice(start, end);

    const requestsTableBody = document.querySelector("#requestsTable tbody");
    requestsTableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data baru

    paginatedRequests.forEach((request) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${request.id_request}</td>
        <td>${request.nama_user}</td>
        <td>${request.nama_barang}</td>
        <td>${request.quantity_diminta}</td>
        <td>${request.status}</td>
        <td>${request.catatan}</td>
        <td>
                    <button id="approve-btn-${
                      request.id_request
                    }" class="approve-btn" data-id="${request.id_request}" ${
        request.status !== "Menunggu Persetujuan Admin" ? "disabled" : ""
      } >Setujui</button>
          <button id="reject-btn-${
            request.id_request
          }" class="reject-btn" data-id="${request.id_request}"  ${
        request.status !== "Menunggu Persetujuan Admin" ? "disabled" : ""
      }>Tolak</button>

        </td>
      `;

      requestsTableBody.appendChild(row);
    });

    setupPagination(
      requests.length,
      page,
      itemsPerPage,
      "paginationRequests",
      fetchAndDisplayRequestsForAdmin
    ); // Setup pagination
  } catch (error) {
    console.error("Error fetching requests:", error);
  }
}

function setupPagination(
  totalItems,
  currentPage,
  itemsPerPage,
  paginationElementId,
  fetchFunction
) {
  const paginationElement = document.getElementById(paginationElementId);
  paginationElement.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Tombol Previous
  const prevButton = document.createElement("button");
  prevButton.innerText = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () =>
    fetchFunction(currentPage - 1, itemsPerPage)
  );
  paginationElement.appendChild(prevButton);

  // Tombol halaman
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.disabled = i === currentPage;
    pageButton.addEventListener("click", () => fetchFunction(i, itemsPerPage));
    paginationElement.appendChild(pageButton);
  }

  // Tombol Next
  const nextButton = document.createElement("button");
  nextButton.innerText = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () =>
    fetchFunction(currentPage + 1, itemsPerPage)
  );
  paginationElement.appendChild(nextButton);
}

// Setup tombol setujui dan tolak
function setupApproveAndRejectButtons() {
  document.querySelectorAll(".approve-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id_request = button.getAttribute("data-id");
      approveRequest(id_request);
    });
  });

  document.querySelectorAll(".reject-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id_request = button.getAttribute("data-id");
      rejectRequest(id_request);
    });
  });
}

// Fungsi untuk menonaktifkan tombol Setujui dan Tolak
function disableButtons(id_request) {
  const approveButton = document.querySelector(`#approve-btn-${id_request}`);
  const rejectButton = document.querySelector(`#reject-btn-${id_request}`);

  // Log untuk memeriksa apakah tombol ditemukan
  console.log("Approve Button:", approveButton);
  console.log("Reject Button:", rejectButton);

  if (approveButton) {
    approveButton.disabled = true; // Nonaktifkan tombol
    approveButton.classList.add("disabled"); // Tambahkan class CSS untuk disabled
    console.log("Class 'disabled' added to approve button"); // Log ketika class berhasil ditambahkan
  }

  if (rejectButton) {
    rejectButton.disabled = true; // Nonaktifkan tombol
    rejectButton.classList.add("disabled"); // Tambahkan class CSS untuk disabled
    console.log("Class 'disabled' added to reject button"); // Log ketika class berhasil ditambahkan
  }

  setTimeout(() => {
    const approveButton = document.querySelector(`#approve-btn-${id_request}`);
    console.log("Approve Button after timeout:", approveButton);
    console.log("Approve Button classList:", approveButton.classList);
  }, 1000);
}

// Fungsi untuk menyetujui permintaan
async function approveRequest(id_request) {
  Swal.fire({
    title: "Setujui Permintaan",
    text: "Apakah Anda yakin ingin menyetujui permintaan ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, setujui",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/requests_gudang/${id_request}/approve`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Disetujui" }),
          }
        );

        if (response.ok) {
          Swal.fire("Success!", "Permintaan berhasil disetujui!", "success");
          disableButtons(id_request);
          fetchAndDisplayRequestsForAdmin();
          fetchAndDisplayItemsForAdmin();
        } else {
          Swal.fire("Error!", "Gagal menyetujui permintaan.", "error");
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menyetujui permintaan.",
          "error"
        );
        console.error("Error approving request:", error);
      }
    }
  });
}

// Fungsi untuk menolak permintaan
async function rejectRequest(id_request) {
  Swal.fire({
    title: "Tolak Permintaan",
    text: "Apakah Anda yakin ingin menolak permintaan ini?",
    icon: "warning",
    input: "textarea",
    inputPlaceholder: "Berikan alasan penolakan",
    showCancelButton: true,
    confirmButtonText: "Ya, tolak",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      const reason = result.value;
      try {
        const response = await fetch(
          `http://localhost:3000/api/requests_gudang/${id_request}/reject`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Ditolak", catatan: reason }), // Kirim status dan alasan penolakan
          }
        );

        if (response.ok) {
          Swal.fire("Rejected!", "Permintaan berhasil ditolak.", "success");
          disableButtons(id_request); // Nonaktifkan tombol
          fetchAndDisplayRequestsForAdmin(); // Refresh daftar permintaan
          fetchAndDisplayItemsForAdmin();
        } else {
          Swal.fire("Error!", "Gagal menolak permintaan.", "error");
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          "Terjadi kesalahan saat menolak permintaan.",
          "error"
        );
        console.error("Error rejecting request:", error);
      }
    } else if (!result.value) {
      Swal.fire(
        "Error!",
        "Anda harus memberikan alasan untuk menolak permintaan.",
        "error"
      );
    }
  });
}
