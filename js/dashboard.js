document.addEventListener("DOMContentLoaded", async () => {
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
        fetchAndDisplayItemsForAdmin(); // Ambil data barang untuk Admin Gudang
      } else if (user.role === "Admin Daerah") {
        document.getElementById("superAdminContent").style.display = "none";
        document.getElementById("adminGudangContent").style.display = "none";
        document.getElementById("adminDaerahContent").style.display = "block";
        document.getElementById("userContent").style.display = "none";
        // fetchAndDisplayItemsForAdminDaerah(); // Ambil data barang untuk Admin Daerah
        // // Menampilkan area-area dalam daerah
        // fetchAndDisplayAreasForAdminDaerah(); // Ambil data area untuk Admin Daerah
      } else if (user.role === "User Area") {
        document.getElementById("superAdminContent").style.display = "none";
        document.getElementById("adminGudangContent").style.display = "none";
        document.getElementById("adminDaerahContent").style.display = "none";
        document.getElementById("userContent").style.display = "block";
        // fetchAndDisplayItemsForUser(); // Ambil data barang untuk User Area
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
      };

      try {
        const response = await fetch("http://localhost:3000/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

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

// Fungsi untuk mengambil dan menampilkan data barang untuk Admin Gudang
async function fetchAndDisplayItemsForAdmin() {
  try {
    const response = await fetch("http://localhost:3000/api/items");
    const items = await response.json();

    const itemsTableBody = document.querySelector("#itemsTable tbody");
    itemsTableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data baru

    items.forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.kode_barang}</td>
        <td>${item.nama_barang}</td>
        <td>${item.quantity}</td>
        <td>${item.satuan}</td>
        <td>${item.harga_satuan}</td>
        <td>
          <button class="edit-btn" data-id="${item.kode_barang}">Edit</button>
          <button class="delete-btn" data-id="${item.kode_barang}">Hapus</button>
        </td>
      `;

      itemsTableBody.appendChild(row);
    });

    setupEditAndDeleteButtons(); // Setup tombol edit dan hapus
  } catch (error) {
    console.error("Error fetching items:", error);
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
      `http://localhost:3000/api/items/${kodeBarang}`
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
        </div>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById("swal-input2").value,
          document.getElementById("swal-input3").value,
          document.getElementById("swal-input4").value,
          document.getElementById("swal-input5").value,
        ];
      },
    });

    if (formValues) {
      const [nama_barang, quantity, satuan, harga_satuan] = formValues;

      const updatedItem = {
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
      };

      const updateResponse = await fetch(
        `http://localhost:3000/api/items/${kodeBarang}`,
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

        const user = JSON.parse(localStorage.getItem("user"));
        if (user.role === "Admin") {
          fetchAndDisplayItemsForAdmin(); // Refresh data barang untuk Admin
        } else if (user.role === "User") {
          fetchAndDisplayItemsForUser(); // Refresh data barang untuk User
        }
      } else {
        Swal.fire("Error!", "Gagal memperbarui barang.", "error");
      }
    }
  } catch (error) {
    Swal.fire(
      "Error!",
      "Terjadi kesalahan saat mengambil data barang.",
      "error"
    );
    console.error("Error fetching item:", error);
  }
}

// Fungsi untuk menghapus barang
async function deleteItem(kodeBarang) {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data barang ini akan dihapus secara permanen!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/items/${kodeBarang}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Barang berhasil dihapus.", "success");
          fetchAndDisplayItems(); // Refresh data barang
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
