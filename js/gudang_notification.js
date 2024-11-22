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
  notificationButton.addEventListener("click", () => {
    notificationDropdown.classList.toggle("show");
  });

  // Initial fetch
  await updateNotifications();

  // Refresh notifications every 30 seconds
  setInterval(updateNotifications, 30000);
});
