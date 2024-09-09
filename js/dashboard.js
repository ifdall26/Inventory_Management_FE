document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("User data:", user); // Debugging output

    if (user) {
      // Tampilkan nama pengguna dan role
      document.getElementById("userName").innerText = user.nama;
      document.getElementById("userRole").innerText = user.role;

      // Tampilkan konten berdasarkan role
      if (user.role === "Admin") {
        document.getElementById("adminContent").style.display = "block";
        document.getElementById("userContent").style.display = "none";
      } else if (user.role === "User") {
        document.getElementById("adminContent").style.display = "none";
        document.getElementById("userContent").style.display = "block";
      }
    } else {
      // Jika tidak ada user yang login, redirect ke login page
      window.location.href = "loginRegister.html";
    }
  }

  // fitur admin
  // entry data barang
  document
    .getElementById("itemForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      // Ambil nilai dari form
      const kode_barang = document.getElementById("kode_barang").value;
      const nama_barang = document.getElementById("nama_barang").value;
      const quantity = document.getElementById("quantity").value;
      const satuan = document.getElementById("satuan").value;
      const harga_satuan = document.getElementById("harga_satuan").value;

      // Buat objek data untuk dikirim ke server
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

        console.log("Response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Server response:", result);

          // Tampilkan SweetAlert sukses
          Swal.fire({
            title: "Success!",
            text: result.message || "Barang berhasil ditambahkan!",
            icon: "success",
            confirmButtonText: "OK",
          });

          // Reset form hanya jika elemen form ada
          const form = document.getElementById("itemForm");
          if (form) {
            form.reset();
          }
        } else {
          // Jika respons tidak ok, tampilkan pesan error
          const result = await response.json();
          Swal.fire({
            title: "Error!",
            text: `Error: ${result.error}`,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        // Jika terjadi kesalahan dalam fetch atau proses lainnya
        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menambahkan barang. Silakan coba lagi.",
          icon: "error",
          confirmButtonText: "OK",
        });
        console.error("Error:", error);
      }
    });
});
