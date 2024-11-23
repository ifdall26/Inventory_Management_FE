document.addEventListener("DOMContentLoaded", async () => {
  const notificationButton = document.getElementById(
    "admin-notification-button"
  );
  const notificationDropdown = document.getElementById(
    "admin-notification-dropdown"
  );
  const notificationList = document.getElementById("admin-notification-list");
  const notificationCount = document.getElementById("admin-notification-count");

  // Fetch pending requests
  async function fetchNotifications() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/gudang_notification/notifications"
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  // Update Notifications
  async function updateNotifications() {
    const notifications = await fetchNotifications();

    // Update badge count
    notificationCount.textContent = notifications.length;

    // Clear previous notifications
    notificationList.innerHTML = "";

    if (notifications.length === 0) {
      const noNotif = document.createElement("li");
      noNotif.textContent = "Tidak ada permintaan baru.";
      notificationList.appendChild(noNotif);
    } else {
      notifications.forEach((notif) => {
        const li = document.createElement("li");
        li.textContent = `Permintaan "${notif.nama_barang}" sebanyak ${notif.quantity_diminta} dari User ID: ${notif.id_user}`;
        notificationList.appendChild(li);
      });
    }
  }

  // Toggle dropdown visibility
  notificationButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent event bubbling
    notificationDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !notificationDropdown.contains(event.target) &&
      !notificationButton.contains(event.target)
    ) {
      notificationDropdown.classList.remove("show");
    }
  });

  // Initial fetch
  await updateNotifications();

  // Refresh notifications every 30 seconds
  setInterval(updateNotifications, 30000);
});

document.addEventListener("DOMContentLoaded", async () => {
  const lowStockButton = document.getElementById("low-stock-button");
  const lowStockDropdown = document.getElementById("low-stock-dropdown");
  const lowStockList = document.getElementById("low-stock-list");
  const lowStockCount = document.getElementById("low-stock-count");

  // Fetch out-of-stock items
  async function fetchLowStockItems() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/gudang_notification/low-stock"
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching low-stock items:", error);
      return [];
    }
  }

  // Update Low Stock Notifications
  async function updateLowStockNotifications() {
    const lowStockItems = await fetchLowStockItems();

    // Update badge count
    lowStockCount.textContent = lowStockItems.length;

    // Clear previous items
    lowStockList.innerHTML = "";

    if (lowStockItems.length === 0) {
      const noItems = document.createElement("li");
      noItems.textContent = "Semua barang tersedia.";
      lowStockList.appendChild(noItems);
    } else {
      lowStockItems.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `Stok barang "${item.nama_barang}" habis!`;
        lowStockList.appendChild(li);
      });
    }
  }

  // Toggle dropdown visibility
  lowStockButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent event bubbling
    lowStockDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !lowStockDropdown.contains(event.target) &&
      !lowStockButton.contains(event.target)
    ) {
      lowStockDropdown.classList.remove("show");
    }
  });

  // Initial fetch
  await updateLowStockNotifications();

  // Refresh notifications every 30 seconds
  setInterval(updateLowStockNotifications, 30000);
});
