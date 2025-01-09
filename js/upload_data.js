// Event listener untuk menampilkan nama file yang dipilih
document.getElementById("excelFile").addEventListener("change", function () {
  const file = this.files[0]; // Ambil file yang dipilih
  const fileNameElement = document.getElementById("selectedFileName");

  if (file) {
    fileNameElement.textContent = `File yang dipilih: ${file.name}`;
  } else {
    fileNameElement.textContent = "Tidak ada file yang dipilih.";
  }
});

// Event listener untuk tombol unggah
document
  .getElementById("uploadExcelButtonDaerah")
  .addEventListener("click", function () {
    const fileInput = document.getElementById("excelFile");
    const file = fileInput.files[0];

    if (!file) {
      alert("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    console.log("File yang dipilih:", file.name); // Log nama file yang dipilih
    uploadDataToApi(file); // Panggil fungsi uploadDataToApi
  });

function uploadDataToApi(file) {
  const formData = new FormData();
  formData.append("file", file); // Pastikan kunci 'file' cocok dengan backend

  fetch("http://localhost:3000/api/barang_daerah/upload_excel", {
    method: "POST",
    body: formData, // Kirim form data berisi file
  })
    .then((response) => {
      if (!response.ok) {
        // Tangani jika server memberikan respons error
        return response.json().then((data) => {
          throw new Error(
            data.error || `HTTP error! Status: ${response.status}`
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Barang berhasil ditambahkan:", data);

      // Tampilkan pesan sukses dengan detail jumlah data
      alert(
        `${data.message}\n${
          data.duplicate
            ? `${data.duplicate}`
            : "Semua data berhasil ditambahkan tanpa duplikat."
        }`
      );
    })
    .catch((error) => {
      console.error("Error:", error.message);
      alert("Terjadi kesalahan saat mengupload data. " + error.message);
    });
}
