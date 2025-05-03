async function kepalaGudang_fetchClusteringData() {
  const response = await fetch(
    "http://localhost:3000/api/clusteringRoutes/clustering"
  );
  const data = await response.json();

  if (data.status === "success") {
    return data.data;
  } else {
    console.error("Error fetching data:", data.message);
    return [];
  }
}

// Filter data berdasarkan bulan dan tahun
function kepalaGudang_filterDataByTimePeriod(data, year, month) {
  return data.filter((item) => {
    const requestDate = new Date(item.tanggal_request);
    return (
      requestDate.getFullYear() === year && requestDate.getMonth() === month
    );
  });
}

// Hitung frekuensi dan rata-rata quantity
function kepalaGudang_calculateFrequencyAndAverageRequest(
  clusteredData,
  year,
  month
) {
  const itemRequests = {};
  const filteredData = kepalaGudang_filterDataByTimePeriod(
    clusteredData,
    year,
    month
  );

  filteredData.forEach((item) => {
    if (!itemRequests[item.kode_barang]) {
      itemRequests[item.kode_barang] = { total: 0, count: 0, frequency: 0 };
    }
    itemRequests[item.kode_barang].total += item.quantity_diminta;
    itemRequests[item.kode_barang].count++;
    itemRequests[item.kode_barang].frequency++;
  });

  const averageRequests = [];
  for (const kode_barang in itemRequests) {
    const data = itemRequests[kode_barang];
    const average = data.total / data.count;
    averageRequests.push({
      kode_barang,
      average,
      frequency: data.frequency,
      totalQuantity: data.total,
    });
  }

  return averageRequests;
}

// Pengelompokan ke dalam 3 cluster
function kepalaGudang_classifyItemsByFrequencyAndRequest(averageRequests) {
  const clusters = { 1: [], 2: [], 3: [] };
  const lowFrequencyThreshold = 5;
  const highFrequencyThreshold = 15;
  const lowQuantityThreshold = 10;
  const highQuantityThreshold = 50;
  const highTotalQuantityThreshold = 500;

  averageRequests.forEach((item) => {
    const { frequency, average, totalQuantity } = item;

    if (
      frequency <= lowFrequencyThreshold &&
      average <= lowQuantityThreshold &&
      totalQuantity <= highTotalQuantityThreshold
    ) {
      clusters[1].push(item);
    } else if (
      (frequency > lowFrequencyThreshold &&
        frequency <= highFrequencyThreshold &&
        average <= highQuantityThreshold) ||
      (frequency <= lowFrequencyThreshold &&
        average > lowQuantityThreshold &&
        average <= highQuantityThreshold &&
        totalQuantity <= highTotalQuantityThreshold)
    ) {
      clusters[2].push(item);
    } else if (
      frequency > highFrequencyThreshold ||
      totalQuantity > highTotalQuantityThreshold
    ) {
      clusters[3].push(item);
    }
  });

  return clusters;
}

let kepalaGudang_chart; // Chart instance khusus kepala gudang

async function kepalaGudang_displayChart() {
  const clusteredData = await kepalaGudang_fetchClusteringData();
  const year = parseInt(
    document.getElementById("kepalaGudang_yearSelect").value
  );
  const month =
    parseInt(document.getElementById("kepalaGudang_monthSelect").value) - 1;

  const averageRequests = kepalaGudang_calculateFrequencyAndAverageRequest(
    clusteredData,
    year,
    month
  );
  const clusters =
    kepalaGudang_classifyItemsByFrequencyAndRequest(averageRequests);

  // Tampilkan data per cluster
  document.getElementById("kepalaGudang_cluster1Items").innerHTML = clusters[1]
    .map(
      (item) =>
        `<li>${item.kode_barang} - Frekuensi: ${
          item.frequency
        } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
          item.totalQuantity
        }</li>`
    )
    .join("");

  document.getElementById("kepalaGudang_cluster2Items").innerHTML = clusters[2]
    .map(
      (item) =>
        `<li>${item.kode_barang} - Frekuensi: ${
          item.frequency
        } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
          item.totalQuantity
        }</li>`
    )
    .join("");

  document.getElementById("kepalaGudang_cluster3Items").innerHTML = clusters[3]
    .map(
      (item) =>
        `<li>${item.kode_barang} - Frekuensi: ${
          item.frequency
        } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
          item.totalQuantity
        }</li>`
    )
    .join("");

  const clusterCounts = {
    1: clusters[1].length,
    2: clusters[2].length,
    3: clusters[3].length,
  };

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const chartData = {
    series: [clusterCounts[1], clusterCounts[2], clusterCounts[3]],
    chart: {
      type: "pie",
      height: 350,
    },
    labels: ["Cluster 1 (Rendah)", "Cluster 2 (Sedang)", "Cluster 3 (Tinggi)"],
    title: {
      text: `Distribusi Permintaan Barang (Bulan: ${monthNames[month]}, Tahun: ${year})`,
      align: "center",
    },
  };

  if (kepalaGudang_chart) kepalaGudang_chart.destroy();

  kepalaGudang_chart = new ApexCharts(
    document.querySelector("#kepalaGudang_clusteringChart"),
    chartData
  );
  kepalaGudang_chart.render();
}

// Inisialisasi dropdown untuk tahun (5 tahun terakhir)
function kepalaGudang_initDateSelector() {
  const yearSelect = document.getElementById("kepalaGudang_yearSelect");
  const monthSelect = document.getElementById("kepalaGudang_monthSelect");

  const currentYear = new Date().getFullYear();

  // Tambahkan pilihan tahun untuk 5 tahun terakhir
  for (let i = currentYear - 5; i <= currentYear; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  monthNames.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1; // value tetap 1-12
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Set default to current month and year
  const currentMonth = new Date().getMonth() + 1;
  monthSelect.value = currentMonth;
  yearSelect.value = currentYear;

  yearSelect.addEventListener("change", kepalaGudang_displayChart);
  monthSelect.addEventListener("change", kepalaGudang_displayChart);
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  kepalaGudang_initDateSelector();
  kepalaGudang_displayChart();
});
