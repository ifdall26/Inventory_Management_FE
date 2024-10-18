// Event listener untuk tombol upload Excel
document
  .getElementById("uploadExcelButton")
  .addEventListener("click", function () {
    const fileInput = document.getElementById("excelFile");
    const file = fileInput.files[0];

    if (!file) {
      alert("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    // Kirim data ke API
    uploadDataToApi(file);
  });

// Fungsi untuk meng-upload data ke API
function uploadDataToApi(file) {
  // Siapkan data Excel
  const formData = new FormData();
  formData.append("file", file); // "file" adalah kunci di multer upload.single('file')

  // Kirim data ke server melalui endpoint baru
  fetch("http://localhost:3000/api/barang_gudang/upload_excel_barang_gudang", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(
            `HTTP error! Status: ${response.status}, Message: ${text}`
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Barang berhasil ditambahkan:", data);
      alert("Data berhasil diupload!");
    })
    .catch((error) => {
      console.error("Error:", error);
      // alert("Terjadi kesalahan saat mengupload data.");
    });
}
