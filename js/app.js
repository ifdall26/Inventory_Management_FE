document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const showLogin = document.getElementById("show-login");
  const showRegister = document.getElementById("show-register");
  const registerContainer = document.getElementById("register-container");
  const loginContainer = document.getElementById("login-container");

  // Toggle between Register and Login forms
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  });

  // Handle Register
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!name || !email || !password) {
      document.getElementById("register-error").textContent =
        "All fields are required.";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        alert("Registration successful! Please login.");
        registerContainer.style.display = "none";
        loginContainer.style.display = "block";
      } else {
        const data = await response.json();
        document.getElementById("register-error").textContent =
          data.message || "Failed to register.";
      }
    } catch (error) {
      document.getElementById("register-error").textContent =
        "An error occurred during registration.";
    }
  });

  // Handle Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Validasi input
    if (!email || !password) {
      document.getElementById("login-error").textContent =
        "All fields are required.";
      return;
    }

    try {
      // Kirim request login ke server
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Ambil data dari respons server
      const userData = await response.json();
      console.log("Server response:", userData); // Debugging output

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(userData));
        // Simpan data penting di localStorage
        localStorage.setItem("userId", userData.id_user);
        localStorage.setItem("userName", userData.nama);

        // Redirect ke dashboard
        alert(
          `Login successful! Welcome, ${userData.nama}. Redirecting to dashboard...`
        );
        window.location.href = "dashboard.html";
      } else {
        // Tampilkan pesan error dari server atau fallback message
        document.getElementById("login-error").textContent =
          userData.message || "Failed to login.";
      }
    } catch (error) {
      console.error("Error during login:", error); // Debugging output
      document.getElementById("login-error").textContent =
        "An error occurred during login.";
    }
  });
});
