document.addEventListener("DOMContentLoaded", async () => {
  async function fetchStatistics() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/stat_gudang/statistics"
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  // Render Total Barang Chart
  async function renderTotalBarangChart(data) {
    const chart = new ApexCharts(
      document.querySelector("#total-barang-chart"),
      {
        chart: { type: "donut" },
        series: [data.totalQuantity],
        labels: ["Total Barang"],
        title: { text: "Total Barang Gudang" },
      }
    );
    chart.render();
  }

  // Render Barang Berdasarkan Tipe Chart
  async function renderTipeBarangChart(data) {
    const typeStats = data.typeStats;
    const chart = new ApexCharts(document.querySelector("#tipe-barang-chart"), {
      chart: { type: "bar" },
      series: [{ data: typeStats.map((item) => item.total_quantity) }],
      xaxis: { categories: typeStats.map((item) => item.tipe_barang) },
      title: { text: "Jumlah Barang Berdasarkan Tipe" },
    });
    chart.render();
  }

  // Render Permintaan Berdasarkan Status Chart
  async function renderStatusPermintaanChart(data) {
    const requestStats = data.requestStats;
    const chart = new ApexCharts(
      document.querySelector("#status-permintaan-chart"),
      {
        chart: { type: "pie" },
        series: requestStats.map((item) => item.total_requests),
        labels: requestStats.map((item) => item.status),
        title: { text: "Permintaan Barang Berdasarkan Status" },
      }
    );
    chart.render();
  }

  // Fetch Data and Render Charts
  const statistics = await fetchStatistics();
  if (statistics) {
    await renderTotalBarangChart(statistics);
    await renderTipeBarangChart(statistics);
    await renderStatusPermintaanChart(statistics);
  }
});
