// Fungsi untuk mengambil data clustering dari API dengan pengecekan error
async function fetchClusteringData() {
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
      totalQuantity: data.total,
    });
  }

  return averageRequests;
}

// Helper untuk mengecek apakah centroid sudah konvergen (dengan toleransi kecil)
function centroidsConverged(oldCentroids, newCentroids, tolerance = 1e-4) {
  return oldCentroids.every((oldC, i) => {
    const newC = newCentroids[i];
    return (
      Math.abs(oldC[0] - newC[0]) < tolerance &&
      Math.abs(oldC[1] - newC[1]) < tolerance
    );
  });
}

// Fungsi K-Means untuk mengelompokkan data
function kMeansClustering(data, k = 3, maxIterations = 100) {
  if (data.length === 0) return Array(k).fill([]); // Jika data kosong, kembalikan array kosong

  // Inisialisasi centroid secara acak dari data yang ada
  let centroids = data
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map((item) => [item.average, item.frequency]);

  let clusters = Array.from({ length: k }, () => []);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Bersihkan cluster sebelumnya
    clusters = Array.from({ length: k }, () => []);

    // Tetapkan setiap item ke cluster terdekat berdasarkan centroid
    data.forEach((item) => {
      const distances = centroids.map(([avg, freq]) =>
        Math.sqrt(
          Math.pow(item.average - avg, 2) + Math.pow(item.frequency - freq, 2)
        )
      );
      const closestCentroid = distances.indexOf(Math.min(...distances));
      clusters[closestCentroid].push(item);
    });

    // Update centroid baru berdasarkan rata-rata cluster
    const newCentroids = clusters.map((cluster) => {
      if (cluster.length === 0) return [0, 0]; // Jika cluster kosong, centroid direset ke [0,0]

      const avgAverage =
        cluster.reduce((sum, item) => sum + item.average, 0) / cluster.length;
      const avgFrequency =
        cluster.reduce((sum, item) => sum + item.frequency, 0) / cluster.length;
      return [avgAverage, avgFrequency];
    });

    // Cek apakah centroid sudah konvergen
    if (centroidsConverged(centroids, newCentroids)) {
      break;
    }

    centroids = newCentroids;
  }

  // Urutkan cluster berdasarkan rata-rata totalQuantity (ascending: rendah ke tinggi)
  const clusterStats = clusters.map((cluster, index) => {
    const avgTotalQuantity =
      cluster.reduce((sum, item) => sum + item.totalQuantity, 0) /
      (cluster.length || 1);
    return { index, cluster, avgTotalQuantity };
  });

  clusterStats.sort((a, b) => a.avgTotalQuantity - b.avgTotalQuantity);

  // Kembalikan array cluster yang sudah diurutkan
  return clusterStats.map((cs) => cs.cluster);
}

function calculateSilhouetteScore(clusters) {
  const allItems = clusters.flat();

  function euclideanDistance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.average - p2.average, 2) +
        Math.pow(p1.frequency - p2.frequency, 2)
    );
  }

  const scores = allItems.map((item) => {
    // Cari cluster tempat item ini berada
    const ownCluster = clusters.find((cluster) => cluster.includes(item));

    // a: jarak rata-rata ke anggota lain di cluster yang sama
    const a =
      ownCluster.length > 1
        ? ownCluster
            .filter((other) => other !== item)
            .reduce((sum, other) => sum + euclideanDistance(item, other), 0) /
          (ownCluster.length - 1)
        : 0;

    // b: jarak rata-rata ke cluster lain yang paling dekat
    const b = Math.min(
      ...clusters
        .filter((cluster) => cluster !== ownCluster && cluster.length > 0)
        .map((cluster) => {
          const totalDist = cluster.reduce(
            (sum, other) => sum + euclideanDistance(item, other),
            0
          );
          return totalDist / cluster.length;
        })
    );

    const s = b === 0 && a === 0 ? 0 : (b - a) / Math.max(a, b);
    return s;
  });

  // Skor rata-rata seluruh titik
  const averageSilhouette =
    scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return averageSilhouette.toFixed(3); // Batasi 3 digit
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

  // Terapkan K-Means Clustering
  const clusters = kMeansClustering(averageRequests, 3);

  // Tampilkan hasil ke dalam daftar cluster di UI
  clusters.forEach((cluster, i) => {
    const listId = `cluster${i + 1}Items`;
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

  // Siapkan data chart
  const clusterCounts = clusters.map((cluster) => cluster.length);

  const chartData = {
    series: clusterCounts,
    chart: {
      type: "pie",
      height: 350,
    },
    labels: ["Permintaan Rendah", "Permintaan Sedang", "Permintaan Tinggi"],
    title: {
      text: `Distribusi Permintaan Barang (Bulan: ${
        month + 1
      }, Tahun: ${year})`,
      align: "center",
    },
  };

  // Render chart menggunakan ApexCharts
  if (chart) {
    chart.destroy();
  }
  chart = new ApexCharts(document.querySelector("#clusteringChart"), chartData);
  chart.render();
  // Hitung dan tampilkan Silhouette Score
  const silhouetteScore = calculateSilhouetteScore(clusters);
  document.getElementById(
    "silhouetteScore"
  ).textContent = `Silhouette Score: ${silhouetteScore}`;
}

// Inisialisasi dropdown bulan dan tahun (5 tahun terakhir) untuk admin
function admin_initDateSelector() {
  const monthSelect = document.getElementById("monthSelect");
  const yearSelect = document.getElementById("yearSelect");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Isi dropdown bulan
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
    option.value = index + 1; // 1–12
    option.textContent = month;
    if (index === currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  });

  // Isi dropdown tahun dari 2020 sampai tahun sekarang
  for (let y = 2020; y <= currentYear; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }

  // Trigger chart saat bulan/tahun berubah
  monthSelect.addEventListener("change", displayChart);
  yearSelect.addEventListener("change", displayChart);

  // Tampilkan chart pertama kali
  displayChart();
}

document.addEventListener("DOMContentLoaded", () => {
  admin_initDateSelector();
});
