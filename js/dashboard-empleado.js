document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const dailySalesElement = document.getElementById("dailySales")
  const dailyInvoicesElement = document.getElementById("dailyInvoices")
  const cartItemsElement = document.getElementById("cartItems")
  const lowStockElement = document.getElementById("lowStock")
  const activityList = document.getElementById("activityList")

  // Initialize dashboard
  loadDashboardData()
  loadRecentActivity()

  // Update data every 30 seconds
  setInterval(loadDashboardData, 30000)

  function loadDashboardData() {
    // Load daily sales
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    const today = new Date().toLocaleDateString()

    const todayInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date).toLocaleDateString()
      return invoiceDate === today
    })

    const dailySales = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    dailySalesElement.textContent = `$${dailySales.toLocaleString()}`
    dailyInvoicesElement.textContent = todayInvoices.length

    // Cart items
    const cartItems = window.cart.getItemCount()
    cartItemsElement.textContent = cartItems

    // Low stock products
    const products = window.productsManager.getAllProducts()
    const lowStockCount = products.filter((product) => product.stock <= 5).length
    lowStockElement.textContent = lowStockCount
  }

  function loadRecentActivity() {
    const activities = JSON.parse(localStorage.getItem("pharmasoft_activities")) || []
    const recentActivities = activities.slice(-10).reverse()

    activityList.innerHTML = ""

    if (recentActivities.length === 0) {
      activityList.innerHTML = '<p style="text-align: center; color: #666;">No hay actividad reciente</p>'
      return
    }

    recentActivities.forEach((activity) => {
      const activityItem = document.createElement("div")
      activityItem.className = "activity-item"

      const iconClass = getActivityIcon(activity.type)
      const timeAgo = getTimeAgo(new Date(activity.timestamp))

      activityItem.innerHTML = `
        <div class="activity-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.description}</div>
          <div class="activity-time">${timeAgo}</div>
        </div>
      `

      activityList.appendChild(activityItem)
    })
  }

  function getActivityIcon(type) {
    const icons = {
      invoice: "fas fa-file-invoice",
      product: "fas fa-box",
      client: "fas fa-user",
      cash: "fas fa-cash-register",
      login: "fas fa-sign-in-alt",
    }
    return icons[type] || "fas fa-info"
  }

  function getTimeAgo(date) {
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Hace un momento"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Hace ${diffInHours} horas`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} días`
  }

  // Add activity logging function
  window.logActivity = (type, description) => {
    const activities = JSON.parse(localStorage.getItem("pharmasoft_activities")) || []
    activities.push({
      type: type,
      description: description,
      timestamp: new Date().toISOString(),
      user: window.auth.getCurrentUser().name,
    })

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100)
    }

    localStorage.setItem("pharmasoft_activities", JSON.stringify(activities))
    loadRecentActivity()
  }
})
