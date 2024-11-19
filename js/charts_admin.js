// Fungsi untuk mendapatkan data statistik barang berdasarkan lokasi daerah
async function fetchStatisticsByDaerah(lokasiDaerah) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/statistics/items-per-daerah-area?lokasi_daerah=${lokasiDaerah}`
    );

    // Cek status respons sebelum melanjutkan
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Pastikan data yang diterima dalam format yang benar
    if (!Array.isArray(data)) {
      throw new Error(`Expected an array, but got ${typeof data}`);
    }

    // Debug log untuk data yang diterima
    console.log(`Data fetched for ${lokasiDaerah}:`, data);

    return data;
  } catch (error) {
    console.error(`Error fetching statistics for ${lokasiDaerah}:`, error);
    return []; // Kembalikan array kosong jika terjadi error
  }
}

// Fungsi untuk render chart menggunakan ApexCharts
function renderChartAdmin(elementId, data, title) {
  try {
    const chartElement = document.getElementById(elementId);
    if (!chartElement) {
      console.error(`Element with ID '${elementId}' not found!`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn(`No data available for chart: ${title}`);
      return;
    }

    // Debug log untuk data yang diterima sebelum diolah
    console.log(`Raw data for ${title}:`, data);

    // Olah data untuk chart
    const categories = data.map(
      (item) => item.lokasi_area || "Area Tidak Diketahui"
    );

    // Debug log untuk kategori yang sudah diproses
    console.log(`Processed categories for ${title}:`, categories);

    // Setel opsi chart dengan data yang sudah diproses
    const chartOptions = {
      chart: {
        type: "bar",
        height: 350,
      },
      series: [
        {
          name: "Total Items",
          data: data.map((item) => item.total_items || 0), // Default ke 0 jika undefined
        },
        {
          name: "Total Quantity",
          data: data.map((item) => item.total_quantity || 0),
        },
      ],
      xaxis: {
        categories: categories,
        labels: {
          rotate: -45, // Rotasi label agar tidak terlalu padat
        },
      },
      title: {
        text: title,
      },
    };

    // Buat dan render chart
    const chart = new ApexCharts(chartElement, chartOptions);
    chart.render();
  } catch (error) {
    console.error(`Error rendering chart for ${title}:`, error);
  }
}

// Fungsi utama untuk memuat semua chart
async function loadAllCharts() {
  try {
    // Ambil data untuk setiap lokasi daerah
    const indarung4Data = await fetchStatisticsByDaerah("Indarung 4");
    const indarung5Data = await fetchStatisticsByDaerah("Indarung 5");
    const indarung6Data = await fetchStatisticsByDaerah("Indarung 6");

    // Render chart untuk setiap lokasi daerah
    renderChartAdmin(
      "chartIndarung4",
      indarung4Data,
      "Statistics for Indarung 4"
    );
    renderChartAdmin(
      "chartIndarung5",
      indarung5Data,
      "Statistics for Indarung 5"
    );
    renderChartAdmin(
      "chartIndarung6",
      indarung6Data,
      "Statistics for Indarung 6"
    );
  } catch (error) {
    console.error("Error loading charts:", error);
  }
}

// Memanggil loadAllCharts saat halaman siap
document.addEventListener("DOMContentLoaded", function () {
  loadAllCharts();
});
