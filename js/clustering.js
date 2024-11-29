// Fungsi untuk mengambil data clustering dari API
async function fetchClusteringData() {
  const response = await fetch(
    "http://localhost:3000/api/clusteringRoutes/clustering"
  ); // Ganti URL dengan endpoint yang sesuai
  const data = await response.json();

  if (data.status === "success") {
    return data.data;
  } else {
    console.error("Error fetching data:", data.message);
    return [];
  }
}

// Fungsi untuk memfilter data berdasarkan periode waktu tertentu (bulan dan tahun)
function filterDataByTimePeriod(data, year, month) {
  return data.filter((item) => {
    const requestDate = new Date(item.tanggal_request);
    return (
      requestDate.getFullYear() === year && requestDate.getMonth() === month
    );
  });
}

// Fungsi untuk menghitung frekuensi dan rata-rata quantity untuk setiap barang berdasarkan periode waktu
function calculateFrequencyAndAverageRequest(clusteredData, year, month) {
  const itemRequests = {};

  const filteredData = filterDataByTimePeriod(clusteredData, year, month);

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
      totalQuantity: data.total, // Total quantity diminta
    });
  }

  return averageRequests;
}

// Fungsi untuk mengelompokkan barang berdasarkan kriteria cluster
function classifyItemsByFrequencyAndRequest(averageRequests) {
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
      clusters[1].push(item); // Cluster 1: Rendah
    } else if (
      (frequency > lowFrequencyThreshold &&
        frequency <= highFrequencyThreshold &&
        average <= highQuantityThreshold) ||
      (frequency <= lowFrequencyThreshold &&
        average > lowQuantityThreshold &&
        average <= highQuantityThreshold &&
        totalQuantity <= highTotalQuantityThreshold)
    ) {
      clusters[2].push(item); // Cluster 2: Sedang
    } else if (
      frequency > highFrequencyThreshold ||
      totalQuantity > highTotalQuantityThreshold
    ) {
      clusters[3].push(item); // Cluster 3: Tinggi
    }
  });

  return clusters;
}

let chart; // Variabel global untuk menyimpan instance chart

async function displayChart() {
  const clusteredData = await fetchClusteringData();

  const year = parseInt(document.getElementById("yearSelect").value);
  const month = parseInt(document.getElementById("monthSelect").value) - 1;

  const averageRequests = calculateFrequencyAndAverageRequest(
    clusteredData,
    year,
    month
  );

  const clusters = classifyItemsByFrequencyAndRequest(averageRequests);

  document.getElementById("cluster1Items").innerHTML = clusters[1]
    .map(
      (item) =>
        `<li>${item.kode_barang} - Frekuensi: ${
          item.frequency
        } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
          item.totalQuantity
        }</li>`
    )
    .join("");

  document.getElementById("cluster2Items").innerHTML = clusters[2]
    .map(
      (item) =>
        `<li>${item.kode_barang} - Frekuensi: ${
          item.frequency
        } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
          item.totalQuantity
        }</li>`
    )
    .join("");

  document.getElementById("cluster3Items").innerHTML = clusters[3]
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

  const chartData = {
    series: [clusterCounts[1], clusterCounts[2], clusterCounts[3]],
    chart: {
      type: "pie",
      height: 350,
    },
    labels: ["Cluster 1 (Rendah)", "Cluster 2 (Sedang)", "Cluster 3 (Tinggi)"],
    title: {
      text: `Distribusi Permintaan Barang (Bulan: ${
        month + 1
      }, Tahun: ${year})`,
      align: "center",
    },
  };

  if (chart) {
    chart.destroy(); // Hancurkan chart lama jika ada
  }

  chart = new ApexCharts(document.querySelector("#clusteringChart"), chartData);
  chart.render();
}

// Inisialisasi dropdown bulan dan tahun
function initDateSelector() {
  const yearSelect = document.getElementById("yearSelect");
  const monthSelect = document.getElementById("monthSelect");

  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 1; i <= currentYear; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }

  for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    monthSelect.appendChild(option);
  }

  yearSelect.addEventListener("change", displayChart);
  monthSelect.addEventListener("change", displayChart);
}

document.addEventListener("DOMContentLoaded", () => {
  initDateSelector();
  displayChart();
});
