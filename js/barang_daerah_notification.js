document.addEventListener("DOMContentLoaded", async () => {
  const daerahLowStockButton = document.getElementById(
    "daerah-low-stock-button"
  );
  const daerahLowStockDropdown = document.getElementById(
    "daerah-low-stock-dropdown"
  );
  const daerahLowStockList = document.getElementById("daerah-low-stock-list");
  const daerahLowStockCount = document.getElementById("daerah-low-stock-count");

  // Fetch out-of-stock items for daerah
  async function fetchDaerahLowStockItems() {
    try {
      const response = await fetch(
        "https://inventorybe.glitch.me/api/barang_daerah_notification/low-stock"
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching daerah low-stock items:", error);
      return [];
    }
  }

  // Update Low Stock Notifications
  async function updateDaerahLowStockNotifications() {
    const lowStockItems = await fetchDaerahLowStockItems();

    // Update badge count
    daerahLowStockCount.textContent = lowStockItems.length;

    // Clear previous items
    daerahLowStockList.innerHTML = "";

    if (lowStockItems.length === 0) {
      const noItems = document.createElement("li");
      noItems.textContent = "Semua barang tersedia.";
      daerahLowStockList.appendChild(noItems);
    } else {
      lowStockItems.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `Stok barang "${item.nama_barang}" habis di Daerah: ${item.lokasi_daerah}, Area: ${item.lokasi_area}, Gudang: ${item.gudang}, Lemari: ${item.lemari}.`;
        daerahLowStockList.appendChild(li);
      });
    }
  }

  // Toggle dropdown visibility
  daerahLowStockButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent event bubbling to the document
    daerahLowStockDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !daerahLowStockDropdown.contains(event.target) &&
      !daerahLowStockButton.contains(event.target)
    ) {
      daerahLowStockDropdown.classList.remove("show");
    }
  });

  // Initial fetch
  await updateDaerahLowStockNotifications();

  // Refresh notifications every 30 seconds
  setInterval(updateDaerahLowStockNotifications, 30000);
});
