document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  // Handle Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      document.getElementById("login-error").textContent =
        "All fields are required.";
      return;
    }

    try {
      const response = await fetch(
        "https://inventorybe.glitch.me/api/users/login",

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const userData = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userId", userData.id_user);
        localStorage.setItem("userName", userData.nama);

        alert(
          `Login successful! Welcome, ${userData.nama}. Redirecting to dashboard...`
        );
        window.location.href = "dashboard.html";
      } else {
        document.getElementById("login-error").textContent =
          userData.message || "Failed to login.";
      }
    } catch (error) {
      console.error("Error during login:", error);
      document.getElementById("login-error").textContent =
        "An error occurred during login.";
    }
  });
});
