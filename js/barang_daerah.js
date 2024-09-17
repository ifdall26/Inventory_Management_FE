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
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Gagal menambahkan barang: " + error.message);
      });
  });
