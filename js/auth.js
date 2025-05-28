// Authentication system
class AuthSystem {
  constructor() {
    this.users = [
      {
        id: 1,
        username: "empleado",
        password: "123",
        role: "empleado",
        name: "Santiago Benavides",
        email: "santiago@pharmasoft.com",
      },
      {
        id: 2,
        username: "admin",
        password: "admin",
        role: "admin",
        name: "Admin PharmaSoft",
        email: "admin@pharmasoft.com",
      },
    ]
    this.currentUser = null
    this.loadUserSession()
  }

  login(username, password, role) {
    console.log("Attempting login:", { username, password, role })
    const user = this.users.find((u) => u.username === username && u.password === password && u.role === role)

    console.log("Found user:", user)

    if (user) {
      this.currentUser = user
      localStorage.setItem("pharmasoft_user", JSON.stringify(user))
      console.log("Login successful, user stored:", this.currentUser)
      return true
    }
    console.log("Login failed")
    return false
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem("pharmasoft_user")
    localStorage.removeItem("pharmasoft_cart")
    window.location.href = "login.html"
  }

  loadUserSession() {
    const stored = localStorage.getItem("pharmasoft_user")
    if (stored) {
      this.currentUser = JSON.parse(stored)
      console.log("Loaded user session:", this.currentUser)
    }
  }

  getCurrentUser() {
    return this.currentUser
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "login.html"
      return false
    }
    return true
  }

  requireRole(role) {
    if (!this.isAuthenticated() || this.currentUser.role !== role) {
      window.location.href = "login.html"
      return false
    }
    return true
  }
}

// Global auth instance
const auth = new AuthSystem()

// Make auth available globally
window.auth = auth

// Setup logout functionality
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtns = document.querySelectorAll(".logout-btn")
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      auth.logout()
    })
  })

  // Update user name in profile
  const userNameElements = document.querySelectorAll("#userName")
  if (auth.isAuthenticated()) {
    userNameElements.forEach((el) => {
      if (el) el.textContent = auth.getCurrentUser().name
    })
  }
})
