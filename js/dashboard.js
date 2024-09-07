document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("User data:", user); // Debugging output

    if (user) {
      // Tampilkan nama pengguna dan role
      document.getElementById("userName").innerText = user.nama;
      document.getElementById("userRole").innerText = user.role;

      // Tampilkan konten berdasarkan role
      if (user.role === "Admin") {
        document.getElementById("adminContent").style.display = "block";
        document.getElementById("userContent").style.display = "none";
      } else if (user.role === "User") {
        document.getElementById("adminContent").style.display = "none";
        document.getElementById("userContent").style.display = "block";
      }
    } else {
      // Jika tidak ada user yang login, redirect ke login page
      window.location.href = "loginRegister.html";
    }
  }
});
