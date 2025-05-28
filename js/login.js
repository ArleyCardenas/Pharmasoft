document.addEventListener("DOMContentLoaded", () => {
  console.log("Login page loaded")

  // Wait for auth to be available
  setTimeout(() => {
    // Check if already logged in
    if (window.auth && window.auth.isAuthenticated()) {
      const user = window.auth.getCurrentUser()
      console.log("User already logged in:", user)
      if (user.role === "admin") {
        window.location.href = "dashboard-admin.html"
      } else {
        window.location.href = "home.html"
      }
      return
    }

    const loginForm = document.getElementById("loginForm")

    if (!loginForm) {
      console.error("Login form not found")
      return
    }

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("Form submitted")

      const username = document.getElementById("userName").value
      const password = document.getElementById("password").value
      const roleElement = document.querySelector('input[name="opcion"]:checked')

      if (!roleElement) {
        alert("Por favor seleccione un rol")
        return
      }

      const role = roleElement.value

      console.log("Login attempt:", { username, password, role })

      if (window.auth && window.auth.login(username, password, role)) {
        console.log("Login successful, redirecting...")
        if (role === "admin") {
          window.location.href = "dashboard-admin.html"
        } else {
          window.location.href = "home.html"
        }
      } else {
        console.log("Login failed")
        alert("Credenciales incorrectas. Intente nuevamente.")
      }
    })
  }, 100)
})
