// Fungsi untuk mengambil data clustering dari API dengan pengecekan error (untuk Kepala Gudang)
async function fetchClusteringDataKepalaGudang() {
  try {
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
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// Fungsi untuk memfilter data berdasarkan periode waktu tertentu (bulan dan tahun) - bisa dipakai sama seperti sebelumnya
function filterDataByTimePeriodKepalaGudang(data, year, month) {
  return data.filter((item) => {
    const requestDate = new Date(item.tanggal_request);
    return (
      requestDate.getFullYear() === year && requestDate.getMonth() === month
    );
  });
}

// Fungsi untuk menghitung frekuensi dan rata-rata quantity untuk setiap barang berdasarkan periode waktu (Kepala Gudang)
function calculateFrequencyAndAverageRequestKepalaGudang(
  clusteredData,
  year,
  month
) {
  const itemRequests = {};
  const filteredData = filterDataByTimePeriodKepalaGudang(
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

// Fungsi K-Means untuk mengelompokkan data (bisa reuse yang sama, tapi saya buat ulang dengan nama berbeda untuk keamanan)
function kMeansClusteringKepalaGudang(data, k = 3, maxIterations = 100) {
  if (data.length === 0) return Array(k).fill([]);

  let centroids = data
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map((item) => [item.average, item.frequency]);

  let clusters = Array.from({ length: k }, () => []);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    clusters = Array.from({ length: k }, () => []);

    data.forEach((item) => {
      const distances = centroids.map(([avg, freq]) =>
        Math.sqrt(
          Math.pow(item.average - avg, 2) + Math.pow(item.frequency - freq, 2)
        )
      );
      const closestCentroid = distances.indexOf(Math.min(...distances));
      clusters[closestCentroid].push(item);
    });

    const newCentroids = clusters.map((cluster) => {
      if (cluster.length === 0) return [0, 0];

      const avgAverage =
        cluster.reduce((sum, item) => sum + item.average, 0) / cluster.length;
      const avgFrequency =
        cluster.reduce((sum, item) => sum + item.frequency, 0) / cluster.length;
      return [avgAverage, avgFrequency];
    });

    if (centroidsConverged(centroids, newCentroids)) {
      break;
    }

    centroids = newCentroids;
  }

  const clusterStats = clusters.map((cluster, index) => {
    const avgTotalQuantity =
      cluster.reduce((sum, item) => sum + item.totalQuantity, 0) /
      (cluster.length || 1);
    return { index, cluster, avgTotalQuantity };
  });

  clusterStats.sort((a, b) => a.avgTotalQuantity - b.avgTotalQuantity);

  return clusterStats.map((cs) => cs.cluster);
}

// Fungsi untuk cek konvergensi centroid, bisa dipakai ulang dari clustering.js
function centroidsConverged(oldCentroids, newCentroids, tolerance = 1e-4) {
  return oldCentroids.every((oldC, i) => {
    const newC = newCentroids[i];
    return (
      Math.abs(oldC[0] - newC[0]) < tolerance &&
      Math.abs(oldC[1] - newC[1]) < tolerance
    );
  });
}

let kepalaGudangChart; // variabel chart terpisah untuk kepala gudang

async function displayChartKepalaGudang() {
  const clusteredData = await fetchClusteringDataKepalaGudang();

  const year = parseInt(
    document.getElementById("kepalaGudang_yearSelect").value
  );
  const month =
    parseInt(document.getElementById("kepalaGudang_monthSelect").value) - 1;

  const averageRequests = calculateFrequencyAndAverageRequestKepalaGudang(
    clusteredData,
    year,
    month
  );

  const clusters = kMeansClusteringKepalaGudang(averageRequests, 3);

  clusters.forEach((cluster, i) => {
    const listId = `kepalaGudang_cluster${i + 1}Items`;
    document.getElementById(listId).innerHTML = cluster
      .map(
        (item) =>
          `<li>${item.kode_barang} - Frekuensi: ${
            item.frequency
          } - Rata-rata: ${item.average.toFixed(2)} - Total: ${
            item.totalQuantity
          }</li>`
      )
      .join("");
  });

  const clusterCounts = clusters.map((cluster) => cluster.length);

  const chartData = {
    series: clusterCounts,
    chart: {
      type: "pie",
      height: 350,
    },
    labels: ["Permintaan Rendah", "Permintaan Sedang", "Permintaan Tinggi"],
    title: {
      text: `Distribusi Permintaan Barang Kepala Gudang (Bulan: ${
        month + 1
      }, Tahun: ${year})`,
      align: "center",
    },
  };

  if (kepalaGudangChart) {
    kepalaGudangChart.destroy();
  }
  kepalaGudangChart = new ApexCharts(
    document.querySelector("#kepalaGudang_clusteringChart"),
    chartData
  );
  kepalaGudangChart.render();
}

// Inisialisasi dropdown bulan dan tahun untuk kepala gudang
function kepalaGudang_initDateSelector() {
  const monthSelect = document.getElementById("kepalaGudang_monthSelect");
  const yearSelect = document.getElementById("kepalaGudang_yearSelect");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const months = [
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
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = month;
    if (index === currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  });

  for (let y = 2020; y <= currentYear; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }

  monthSelect.addEventListener("change", displayChartKepalaGudang);
  yearSelect.addEventListener("change", displayChartKepalaGudang);

  displayChartKepalaGudang();
}

document.addEventListener("DOMContentLoaded", () => {
  kepalaGudang_initDateSelector();
});
