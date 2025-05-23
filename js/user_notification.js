document.addEventListener("DOMContentLoaded", async () => {
  const notificationButton = document.getElementById("notification-button");
  const notificationDropdown = document.getElementById("notification-dropdown");
  const notificationList = document.getElementById("notification-list");
  const notificationCount = document.getElementById("notification-count");

  // Fetch unnotified approved requests
  async function fetchNotifications() {
    // Ambil userId dari localStorage
    const userId = localStorage.getItem("userId"); // Gunakan kunci 'userId'
    if (!userId) {
      console.error("User ID not found in localStorage");
      return [];
    }

    try {
      const response = await fetch(
        `https://inventorybe.glitch.me/api/user_notification/unnotification?user_id=${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Notifications fetched successfully:", data);
      return data;
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
      noNotif.textContent = "Tidak ada notifikasi baru.";
      notificationList.appendChild(noNotif);
    } else {
      notifications.forEach((notif) => {
        const li = document.createElement("li");
        // Tampilkan pesan sesuai status
        if (notif.status === "Disetujui") {
          li.textContent = `Barang "${notif.nama_barang}" telah disetujui.`;
        } else if (notif.status === "Ditolak") {
          li.textContent = `Permintaan untuk barang "${notif.nama_barang}" ditolak.`;
        }
        notificationList.appendChild(li);
      });

      // Tambahkan tombol "Tandai Telah Dibaca"
      const markReadButton = document.createElement("button");
      markReadButton.textContent = "Tandai Telah Dibaca";
      markReadButton.classList.add("mark-read-btn");
      notificationList.appendChild(markReadButton);

      markReadButton.addEventListener("click", async () => {
        await markNotificationsAsRead(notifications.map((n) => n.id_request));
        await updateNotifications();
      });
    }
  }

  // Tandai Notifikasi Sebagai Telah Dibaca
  async function markNotificationsAsRead(ids) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    try {
      const response = await fetch(
        "https://inventorybe.glitch.me/api/user_notification/mark-read",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, user_id: userId }), // Sertakan user_id
        }
      );

      if (!response.ok) throw new Error("Gagal menandai notifikasi.");
      console.log("Notifikasi berhasil ditandai.");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
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

  // Refresh notifikasi setiap 30 detik
  setInterval(updateNotifications, 30000);
});
