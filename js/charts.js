// Fungsi untuk mendapatkan data statistik barang yang sering diminta
async function fetchMostRequestedItems() {
  try {
    const response = await fetch(
      "https://inventorybe.glitch.me/api/requests/statistics/most-requested"
    );

    // Cek status respons sebelum melanjutkan
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      const labels = data.map((item) => item.kode_barang);
      const frequencyData = data.map((item) => item.frequency);
      const quantityData = data.map((item) => item.total_quantity);

      // Menampilkan data pada chart
      renderChart(labels, frequencyData, quantityData);
    } else {
      console.error("Unexpected data format:", data);
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }
}

// Fungsi untuk render chart menggunakan ApexCharts
function renderChart(labels, frequencyData, quantityData) {
  try {
    const chartOptions = {
      chart: {
        type: "bar",
        height: 350,
      },
      series: [
        {
          name: "Frequency",
          data: frequencyData,
        },
        {
          name: "Total Quantity",
          data: quantityData,
        },
      ],
      xaxis: {
        categories: labels,
      },
      title: {
        text: "Most Requested Items",
      },
    };

    const chart = new ApexCharts(
      document.getElementById("mostRequestedChart"),
      chartOptions
    );
    chart.render();
  } catch (error) {
    console.error("Error rendering the chart:", error);
  }
}

// Memanggil fetch function saat halaman siap
document.addEventListener("DOMContentLoaded", function () {
  fetchMostRequestedItems();
});
