function generateTemplate() {
  const headers = [
    "kode_lokasi",
    "kode_barang",
    "nama_barang",
    "quantity",
    "satuan",
    "harga_satuan",
    "lokasi_daerah",
    "lokasi_area",
    "tipe_barang",
    "gudang",
    "lemari",
  ];

  // Petunjuk untuk tiap kolom
  const instructions = [
    {
      kode_lokasi: "Kode lokasi barang (contoh: LOC001)",
      kode_barang: "Kode unik barang (contoh: BRG001)",
      nama_barang: "Nama barang (contoh: Pipa Besi)",
      quantity: "Jumlah barang",
      satuan: "Satuan (contoh: pcs, kg)",
      harga_satuan: "Harga per satuan barang",
      lokasi_daerah: "Indarung 4, Indarung 5, atau Indarung 6",
      lokasi_area: "Raw Mill, Kiln, atau Finish Mill",
      tipe_barang: "Mechanical atau Electrical",
      gudang: "Gudang 1, Gudang 2, atau Gudang 3",
      lemari: "Lemari A, Lemari B, hingga Lemari E",
    },
  ];

  // Workbook baru
  const workbook = XLSX.utils.book_new();

  // Membuat worksheet dengan petunjuk terlebih dahulu
  const worksheet = XLSX.utils.json_to_sheet(instructions, {
    header: headers,
    skipHeader: true,
  });

  // Menambahkan header setelah petunjuk
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A2" });

  // Menambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Barang");

  // Mengunduh file
  XLSX.writeFile(workbook, "Template_Input_Barang.xlsx");
}

// Event listener untuk tombol unduh template
document
  .getElementById("downloadTemplate")
  .addEventListener("click", generateTemplate);
