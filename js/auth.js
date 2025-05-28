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

      // Log activity
      if (window.logActivity) {
        window.logActivity("login", `${user.name} inició sesión`)
      }

      return true
    }
    console.log("Login failed")
    return false
  }

  logout() {
    if (this.currentUser && window.logActivity) {
      window.logActivity("login", `${this.currentUser.name} cerró sesión`)
    }

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

  addUser(userData) {
    const newUser = {
      id: Math.max(...this.users.map((u) => u.id), 0) + 1,
      ...userData,
    }
    this.users.push(newUser)
    return newUser
  }

  updateUser(id, updates) {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      return this.users[userIndex]
    }
    return null
  }

  deleteUser(id) {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1)
      return true
    }
    return false
  }

  getAllUsers() {
    return this.users.filter((u) => u.id !== this.currentUser?.id)
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
