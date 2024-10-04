function exportToExcel(data, month, year) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${month}_${year}`);

  // Generate file Excel
  XLSX.writeFile(workbook, `Laporan_${month}_${year}.xlsx`);
}

function exportToPDF(data, month, year) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header laporan
  doc.setFontSize(18);
  doc.text(`Laporan Bulanan - ${month}/${year}`, 10, 10);

  // Define the columns and rows for the table
  const tableColumn = [
    "No",
    "Nama User",
    "Nama Barang",
    "Qty",
    "Status",
    "Tanggal",
    "Catatan",
  ];
  const tableRows = [];

  // Loop through data and add each row to tableRows array
  data.forEach((item, index) => {
    const rowData = [
      index + 1, // Nomor urut
      item.nama_user, // Nama user
      item.nama_barang, // Nama barang
      item.quantity_diminta, // Quantity diminta
      item.status, // Status request
      item.tanggal_request, // Tanggal request
      item.catatan, // Catatan request
    ];

    tableRows.push(rowData);
  });

  // Create the table using autoTable
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20, // Mulai tabel di bawah teks header laporan
    styles: { fontSize: 10 }, // Sesuaikan ukuran font jika perlu
  });

  // Generate PDF file
  doc.save(`Laporan_${month}_${year}.pdf`);
}

document.getElementById("exportExcelBtn").addEventListener("click", () => {
  const filteredData = getFilteredRequests(); // Fungsi untuk mendapatkan data yang difilter
  const month = document.getElementById("monthFilter").value;
  const year = document.getElementById("yearFilter").value;

  exportToExcel(filteredData, month, year);
});

document.getElementById("exportPdfBtn").addEventListener("click", () => {
  const filteredData = getFilteredRequests(); // Fungsi untuk mendapatkan data yang difilter
  const month = document.getElementById("monthFilter").value;
  const year = document.getElementById("yearFilter").value;

  exportToPDF(filteredData, month, year);
});

function getFilteredRequests() {
  const table = document.querySelector("#requestsTable tbody");
  const rows = table.querySelectorAll("tr");
  const filteredRequests = [];

  // Loop setiap baris dalam tabel untuk mengambil data
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    // Ambil nilai dari kolom-kolom di setiap baris
    const request = {
      id_request: cells[0].textContent,
      nama_user: cells[1].textContent,
      nama_barang: cells[2].textContent,
      quantity_diminta: cells[3].textContent,
      status: cells[4].textContent,
      tanggal_request: cells[5].textContent,
      catatan: cells[6].textContent,
    };

    filteredRequests.push(request);
  });

  return filteredRequests;
}
