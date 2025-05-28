document.addEventListener("DOMContentLoaded", () => {
  // Check admin authentication
  if (!window.auth || !window.auth.requireRole("admin")) return

  const menuItems = document.querySelectorAll(".menu-item[data-section]")
  const contentSections = document.querySelectorAll(".content-section")

  // Modal elements
  const employeeModal = document.getElementById("employeeModal")
  const productModal = document.getElementById("productModal")
  const clientModal = document.getElementById("clientModal")

  // Form elements
  const employeeForm = document.getElementById("employeeForm")
  const productAdminForm = document.getElementById("productAdminForm")
  const clientAdminForm = document.getElementById("clientAdminForm")

  // Initialize
  setupEventListeners()
  loadDashboardData()
  initializeCharts()

  function setupEventListeners() {
    // Menu navigation
    menuItems.forEach((item) => {
      item.addEventListener("click", function () {
        const section = this.dataset.section
        showSection(section)

        // Update active menu item
        menuItems.forEach((mi) => mi.classList.remove("active"))
        this.classList.add("active")

        // Load section-specific data
        loadSectionData(section)
      })
    })

    // Modal controls
    setupModalControls()

    // Form submissions
    setupFormHandlers()

    // Search functionality
    setupSearchHandlers()

    // Configuration forms
    setupConfigurationHandlers()
  }

  function setupModalControls() {
    // Employee modal
    const addEmployeeBtn = document.getElementById("addEmployeeBtn")
    const closeEmployeeModal = document.getElementById("closeEmployeeModal")

    if (addEmployeeBtn) {
      addEmployeeBtn.addEventListener("click", () => {
        resetEmployeeForm()
        employeeModal.style.display = "block"
      })
    }

    if (closeEmployeeModal) {
      closeEmployeeModal.addEventListener("click", () => {
        employeeModal.style.display = "none"
      })
    }

    // Product modal
    const addProductBtn = document.getElementById("addProductBtn")
    const closeProductModal = document.getElementById("closeProductModal")

    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => {
        resetProductForm()
        productModal.style.display = "block"
      })
    }

    if (closeProductModal) {
      closeProductModal.addEventListener("click", () => {
        productModal.style.display = "none"
      })
    }

    // Client modal
    const addClientBtn = document.getElementById("addClientBtn")
    const closeClientModal = document.getElementById("closeClientModal")

    if (addClientBtn) {
      addClientBtn.addEventListener("click", () => {
        resetClientForm()
        clientModal.style.display = "block"
      })
    }

    if (closeClientModal) {
      closeClientModal.addEventListener("click", () => {
        clientModal.style.display = "none"
      })
    }

    // Close modals on outside click
    window.addEventListener("click", (e) => {
      if (e.target === employeeModal) employeeModal.style.display = "none"
      if (e.target === productModal) productModal.style.display = "none"
      if (e.target === clientModal) clientModal.style.display = "none"
    })
  }

  function setupFormHandlers() {
    // Employee form
    if (employeeForm) {
      employeeForm.addEventListener("submit", handleEmployeeSubmit)
    }

    // Product form
    if (productAdminForm) {
      productAdminForm.addEventListener("submit", handleProductSubmit)
    }

    // Client form
    if (clientAdminForm) {
      clientAdminForm.addEventListener("submit", handleClientSubmit)
    }
  }

  function setupSearchHandlers() {
    const searchEmployees = document.getElementById("searchEmployees")
    const searchProductsAdmin = document.getElementById("searchProductsAdmin")
    const searchClientsAdmin = document.getElementById("searchClientsAdmin")

    if (searchEmployees) {
      searchEmployees.addEventListener("input", (e) => filterTable("employeesTableBody", e.target.value))
    }

    if (searchProductsAdmin) {
      searchProductsAdmin.addEventListener("input", (e) => filterTable("productsAdminTableBody", e.target.value))
    }

    if (searchClientsAdmin) {
      searchClientsAdmin.addEventListener("input", (e) => filterTable("clientsAdminTableBody", e.target.value))
    }
  }

  function setupConfigurationHandlers() {
    // Pharmacy info form
    const pharmacyInfoForm = document.getElementById("pharmacyInfoForm")
    if (pharmacyInfoForm) {
      pharmacyInfoForm.addEventListener("submit", handlePharmacyInfoSubmit)
    }

    // General config form
    const generalConfigForm = document.getElementById("generalConfigForm")
    if (generalConfigForm) {
      generalConfigForm.addEventListener("submit", handleGeneralConfigSubmit)
    }

    // Security form
    const securityForm = document.getElementById("securityForm")
    if (securityForm) {
      securityForm.addEventListener("submit", handleSecuritySubmit)
    }

    // Load saved configuration
    loadConfiguration()
  }

  function showSection(sectionId) {
    contentSections.forEach((section) => {
      section.classList.remove("active")
    })

    const targetSection = document.getElementById(`${sectionId}-section`)
    if (targetSection) {
      targetSection.classList.add("active")
    }
  }

  function loadSectionData(section) {
    switch (section) {
      case "dashboard":
        loadDashboardData()
        break
      case "empleados":
        loadEmployees()
        break
      case "productos":
        loadProductsAdmin()
        break
      case "clientes":
        loadClientsAdmin()
        break
      case "reportes":
        loadReportsData()
        break
    }
  }

  function loadDashboardData() {
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    const products = window.productsManager.getAllProducts()
    const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []

    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const lowStockCount = products.filter((p) => p.stock <= 5).length

    // Update stat cards
    const totalSalesEl = document.getElementById("totalSales")
    const totalProductsEl = document.getElementById("totalProducts")
    const totalClientsEl = document.getElementById("totalClients")
    const lowStockCountEl = document.getElementById("lowStockCount")

    if (totalSalesEl) totalSalesEl.textContent = `$${totalSales.toLocaleString()}`
    if (totalProductsEl) totalProductsEl.textContent = products.length
    if (totalClientsEl) totalClientsEl.textContent = clients.length
    if (lowStockCountEl) lowStockCountEl.textContent = lowStockCount

    // Load system activity
    loadSystemActivity()
  }

  function loadSystemActivity() {
    const activities = JSON.parse(localStorage.getItem("pharmasoft_activities")) || []
    const recentActivities = activities.slice(-10).reverse()
    const activityList = document.getElementById("systemActivityList")

    if (!activityList) return

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
          <div class="activity-time">${timeAgo} - ${activity.user}</div>
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
      employee: "fas fa-users-cog",
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

  function loadEmployees() {
    const employeesTableBody = document.getElementById("employeesTableBody")
    if (!employeesTableBody) return

    const users = window.auth.getAllUsers()
    employeesTableBody.innerHTML = ""

    users.forEach((user) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.username}</td>
        <td>${user.role === "admin" ? "Administrador" : "Empleado"}</td>
        <td>${user.email}</td>
        <td>${user.phone || "N/A"}</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editEmployee(${user.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteEmployee(${user.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
      employeesTableBody.appendChild(row)
    })
  }

  function loadProductsAdmin() {
    const productsTableBody = document.getElementById("productsAdminTableBody")
    if (!productsTableBody) return

    const products = window.productsManager.getAllProducts()
    productsTableBody.innerHTML = ""

    products.forEach((product) => {
      const row = document.createElement("tr")

      // Check product status
      const isLowStock = product.stock <= 5
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      const isExpired = daysUntilExpiry < 0
      const isNearExpiry = daysUntilExpiry >= 0 && daysUntilExpiry <= 30

      let status = "Normal"
      let statusClass = ""

      if (isExpired) {
        status = "Vencido"
        statusClass = "expired"
      } else if (isNearExpiry) {
        status = "Por vencer"
        statusClass = "near-expiry"
      } else if (isLowStock) {
        status = "Stock bajo"
        statusClass = "low-stock"
      }

      row.className = statusClass
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toLocaleString()}</td>
        <td>${product.stock}</td>
        <td>${formatDate(product.expiryDate)}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>
          <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
      productsTableBody.appendChild(row)
    })
  }

  function loadClientsAdmin() {
    const clientsTableBody = document.getElementById("clientsAdminTableBody")
    if (!clientsTableBody) return

    const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []

    clientsTableBody.innerHTML = ""

    clients.forEach((client) => {
      const clientInvoices = invoices.filter((inv) => inv.client.identification === client.identification)

      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${client.identification}</td>
        <td>${client.name}</td>
        <td>${client.phone}</td>
        <td>${client.email}</td>
        <td>${client.address}</td>
        <td>${clientInvoices.length}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editClient('${client.identification}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteClient('${client.identification}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
      clientsTableBody.appendChild(row)
    })
  }

  function loadReportsData() {
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Today's invoices
    const todayInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date)
      return invDate.toDateString() === today.toDateString()
    })

    // Monthly revenue
    const monthlyInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date)
      return invDate >= thisMonth
    })
    const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Top product
    const productSales = {}
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (productSales[item.product.name]) {
          productSales[item.product.name] += item.quantity
        } else {
          productSales[item.product.name] = item.quantity
        }
      })
    })

    const topProduct =
      Object.keys(productSales).length > 0
        ? Object.keys(productSales).reduce((a, b) => (productSales[a] > productSales[b] ? a : b))
        : "-"

    // Average ticket
    const avgTicket = invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0

    // Update quick stats
    const todayInvoicesEl = document.getElementById("todayInvoices")
    const monthlyRevenueEl = document.getElementById("monthlyRevenue")
    const topProductEl = document.getElementById("topProduct")
    const avgTicketEl = document.getElementById("avgTicket")

    if (todayInvoicesEl) todayInvoicesEl.textContent = todayInvoices.length
    if (monthlyRevenueEl) monthlyRevenueEl.textContent = `$${monthlyRevenue.toLocaleString()}`
    if (topProductEl) topProductEl.textContent = topProduct
    if (avgTicketEl) avgTicketEl.textContent = `$${Math.round(avgTicket).toLocaleString()}`

    // Set default dates for reports
    const today_str = today.toISOString().split("T")[0]
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const salesFromDate = document.getElementById("salesFromDate")
    const salesToDate = document.getElementById("salesToDate")
    const cashFromDate = document.getElementById("cashFromDate")
    const cashToDate = document.getElementById("cashToDate")

    if (salesFromDate) salesFromDate.value = monthAgo
    if (salesToDate) salesToDate.value = today_str
    if (cashFromDate) cashFromDate.value = monthAgo
    if (cashToDate) cashToDate.value = today_str
  }

  // Form handlers
  function handleEmployeeSubmit(e) {
    e.preventDefault()

    const editId = document.getElementById("employeeEditId").value
    const employeeData = {
      name: document.getElementById("employeeName").value,
      username: document.getElementById("employeeUsername").value,
      email: document.getElementById("employeeEmail").value,
      phone: document.getElementById("employeePhone").value,
      role: document.getElementById("employeeRole").value,
      password: document.getElementById("employeePassword").value,
    }

    if (editId) {
      // Update existing employee
      window.auth.updateUser(Number.parseInt(editId), employeeData)
      if (window.logActivity) {
        window.logActivity("employee", `Empleado ${employeeData.name} actualizado`)
      }
      alert("Empleado actualizado exitosamente")
    } else {
      // Add new employee
      if (window.auth.users.find((u) => u.username === employeeData.username)) {
        alert("El nombre de usuario ya existe")
        return
      }

      window.auth.addUser(employeeData)
      if (window.logActivity) {
        window.logActivity("employee", `Empleado ${employeeData.name} agregado al sistema`)
      }
      alert("Empleado agregado exitosamente")
    }

    employeeModal.style.display = "none"
    loadEmployees()
  }

  function handleProductSubmit(e) {
    e.preventDefault()

    const editId = document.getElementById("productEditId").value
    const productData = {
      name: document.getElementById("productAdminName").value,
      category: document.getElementById("productAdminCategory").value,
      price: Number.parseInt(document.getElementById("productAdminPrice").value),
      stock: Number.parseInt(document.getElementById("productAdminStock").value),
      expiryDate: document.getElementById("productAdminExpiry").value,
      image: "https://via.placeholder.com/120x120?text=Producto",
    }

    if (editId) {
      // Update existing product
      window.productsManager.updateProduct(editId, productData)
      if (window.logActivity) {
        window.logActivity("product", `Producto ${productData.name} actualizado`)
      }
      alert("Producto actualizado exitosamente")
    } else {
      // Add new product
      window.productsManager.addProduct(productData)
      if (window.logActivity) {
        window.logActivity("product", `Producto ${productData.name} agregado al inventario`)
      }
      alert("Producto agregado exitosamente")
    }

    productModal.style.display = "none"
    loadProductsAdmin()
    loadDashboardData() // Update stats
  }

  function handleClientSubmit(e) {
    e.preventDefault()

    const editId = document.getElementById("clientEditId").value
    const clientData = {
      name: document.getElementById("clientAdminName").value,
      identification: document.getElementById("clientAdminId").value,
      phone: document.getElementById("clientAdminPhone").value,
      email: document.getElementById("clientAdminEmail").value,
      address: document.getElementById("clientAdminAddress").value,
    }

    const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []

    if (editId) {
      // Update existing client
      const clientIndex = clients.findIndex((c) => c.identification === editId)
      if (clientIndex !== -1) {
        clients[clientIndex] = { ...clients[clientIndex], ...clientData }
        localStorage.setItem("pharmasoft_clients", JSON.stringify(clients))
        if (window.logActivity) {
          window.logActivity("client", `Cliente ${clientData.name} actualizado`)
        }
        alert("Cliente actualizado exitosamente")
      }
    } else {
      // Add new client
      if (clients.find((c) => c.identification === clientData.identification)) {
        alert("Ya existe un cliente con esta identificación")
        return
      }

      const newClient = {
        id: Math.max(...clients.map((c) => c.id || 0), 0) + 1,
        ...clientData,
      }
      clients.push(newClient)
      localStorage.setItem("pharmasoft_clients", JSON.stringify(clients))

      if (window.logActivity) {
        window.logActivity("client", `Cliente ${clientData.name} agregado al sistema`)
      }
      alert("Cliente agregado exitosamente")
    }

    clientModal.style.display = "none"
    loadClientsAdmin()
    loadDashboardData() // Update stats
  }

  function handlePharmacyInfoSubmit(e) {
    e.preventDefault()

    const pharmacyInfo = {
      name: document.getElementById("pharmacyName").value,
      address: document.getElementById("pharmacyAddress").value,
      phone: document.getElementById("pharmacyPhone").value,
      email: document.getElementById("pharmacyEmail").value,
    }

    localStorage.setItem("pharmasoft_pharmacy_info", JSON.stringify(pharmacyInfo))
    alert("Información de la farmacia guardada exitosamente")
  }

  function handleGeneralConfigSubmit(e) {
    e.preventDefault()

    const config = {
      minStockAlert: Number.parseInt(document.getElementById("minStockAlert").value),
      expiryAlertDays: Number.parseInt(document.getElementById("expiryAlertDays").value),
      currency: document.getElementById("currency").value,
    }

    localStorage.setItem("pharmasoft_config", JSON.stringify(config))
    alert("Configuración guardada exitosamente")
  }

  function handleSecuritySubmit(e) {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    const currentUser = window.auth.getCurrentUser()

    if (currentUser.password !== currentPassword) {
      alert("La contraseña actual es incorrecta")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres")
      return
    }

    window.auth.updateUser(currentUser.id, { password: newPassword })
    alert("Contraseña cambiada exitosamente")

    // Clear form
    document.getElementById("currentPassword").value = ""
    document.getElementById("newPassword").value = ""
    document.getElementById("confirmPassword").value = ""
  }

  function loadConfiguration() {
    // Load pharmacy info
    const pharmacyInfo = JSON.parse(localStorage.getItem("pharmasoft_pharmacy_info")) || {}
    const pharmacyNameEl = document.getElementById("pharmacyName")
    const pharmacyAddressEl = document.getElementById("pharmacyAddress")
    const pharmacyPhoneEl = document.getElementById("pharmacyPhone")
    const pharmacyEmailEl = document.getElementById("pharmacyEmail")

    if (pharmacyNameEl) pharmacyNameEl.value = pharmacyInfo.name || "PharmaSoft"
    if (pharmacyAddressEl) pharmacyAddressEl.value = pharmacyInfo.address || ""
    if (pharmacyPhoneEl) pharmacyPhoneEl.value = pharmacyInfo.phone || ""
    if (pharmacyEmailEl) pharmacyEmailEl.value = pharmacyInfo.email || ""

    // Load general config
    const config = JSON.parse(localStorage.getItem("pharmasoft_config")) || {}
    const minStockAlertEl = document.getElementById("minStockAlert")
    const expiryAlertDaysEl = document.getElementById("expiryAlertDays")
    const currencyEl = document.getElementById("currency")

    if (minStockAlertEl) minStockAlertEl.value = config.minStockAlert || 5
    if (expiryAlertDaysEl) expiryAlertDaysEl.value = config.expiryAlertDays || 30
    if (currencyEl) currencyEl.value = config.currency || "COP"
  }

  // Utility functions
  function resetEmployeeForm() {
    const editIdEl = document.getElementById("employeeEditId")
    const modalTitleEl = document.getElementById("employeeModalTitle")
    const submitBtnEl = document.getElementById("employeeSubmitBtn")

    if (editIdEl) editIdEl.value = ""
    if (modalTitleEl) modalTitleEl.textContent = "Agregar Empleado"
    if (submitBtnEl) submitBtnEl.textContent = "Agregar Empleado"
    if (employeeForm) employeeForm.reset()
  }

  function resetProductForm() {
    const editIdEl = document.getElementById("productEditId")
    const modalTitleEl = document.getElementById("productModalTitle")
    const submitBtnEl = document.getElementById("productSubmitBtn")

    if (editIdEl) editIdEl.value = ""
    if (modalTitleEl) modalTitleEl.textContent = "Agregar Producto"
    if (submitBtnEl) submitBtnEl.textContent = "Agregar Producto"
    if (productAdminForm) productAdminForm.reset()
  }

  function resetClientForm() {
    const editIdEl = document.getElementById("clientEditId")
    const modalTitleEl = document.getElementById("clientModalTitle")
    const submitBtnEl = document.getElementById("clientSubmitBtn")

    if (editIdEl) editIdEl.value = ""
    if (modalTitleEl) modalTitleEl.textContent = "Agregar Cliente"
    if (submitBtnEl) submitBtnEl.textContent = "Agregar Cliente"
    if (clientAdminForm) clientAdminForm.reset()
  }

  function filterTable(tableBodyId, searchTerm) {
    const tableBody = document.getElementById(tableBodyId)
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
    const term = searchTerm.toLowerCase()

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      row.style.display = text.includes(term) ? "" : "none"
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  function initializeCharts() {
    // Verificar si Chart.js está disponible
    if (typeof Chart === "undefined") {
      console.log("Chart.js no está disponible, omitiendo gráficos")
      return
    }

    try {
      // Sales Chart
      const salesCtx = document.getElementById("salesChart")
      if (salesCtx) {
        new Chart(salesCtx, {
          type: "bar",
          data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            datasets: [
              {
                label: "Ventas",
                data: [4000000, 3000000, 5000000, 4500000, 6000000, 5500000],
                backgroundColor: "#ff6b00",
                borderColor: "#e66000",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => "$" + value / 1000000 + "M",
                },
              },
            },
          },
        })
      }

      // Products Chart
      const productsCtx = document.getElementById("productsChart")
      if (productsCtx) {
        new Chart(productsCtx, {
          type: "pie",
          data: {
            labels: ["Tabletas", "Jarabes", "Inyectables", "Cremas"],
            datasets: [
              {
                data: [400, 300, 200, 100],
                backgroundColor: ["#ff6b00", "#e66000", "#cc5500", "#b34a00"],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        })
      }
    } catch (error) {
      console.log("Error inicializando gráficos:", error)
    }
  }

  // Global functions for CRUD operations
  window.editEmployee = (id) => {
    const user = window.auth.users.find((u) => u.id === id)
    if (user) {
      document.getElementById("employeeEditId").value = id
      document.getElementById("employeeName").value = user.name
      document.getElementById("employeeUsername").value = user.username
      document.getElementById("employeeEmail").value = user.email
      document.getElementById("employeePhone").value = user.phone || ""
      document.getElementById("employeeRole").value = user.role
      document.getElementById("employeePassword").value = user.password

      document.getElementById("employeeModalTitle").textContent = "Editar Empleado"
      document.getElementById("employeeSubmitBtn").textContent = "Actualizar Empleado"
      employeeModal.style.display = "block"
    }
  }

  window.deleteEmployee = (id) => {
    if (confirm("¿Está seguro de eliminar este empleado?")) {
      const user = window.auth.users.find((u) => u.id === id)
      if (window.auth.deleteUser(id)) {
        if (window.logActivity) {
          window.logActivity("employee", `Empleado ${user.name} eliminado del sistema`)
        }
        loadEmployees()
        alert("Empleado eliminado exitosamente")
      }
    }
  }

  window.editProduct = (id) => {
    const product = window.productsManager.getProductById(id)
    if (product) {
      document.getElementById("productEditId").value = id
      document.getElementById("productAdminName").value = product.name
      document.getElementById("productAdminCategory").value = product.category
      document.getElementById("productAdminPrice").value = product.price
      document.getElementById("productAdminStock").value = product.stock
      document.getElementById("productAdminExpiry").value = product.expiryDate

      document.getElementById("productModalTitle").textContent = "Editar Producto"
      document.getElementById("productSubmitBtn").textContent = "Actualizar Producto"
      productModal.style.display = "block"
    }
  }

  window.deleteProduct = (id) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      const product = window.productsManager.getProductById(id)
      if (window.productsManager.deleteProduct(id)) {
        if (window.logActivity) {
          window.logActivity("product", `Producto ${product.name} eliminado del inventario`)
        }
        loadProductsAdmin()
        loadDashboardData()
        alert("Producto eliminado exitosamente")
      }
    }
  }

  window.editClient = (identification) => {
    const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []
    const client = clients.find((c) => c.identification === identification)
    if (client) {
      document.getElementById("clientEditId").value = identification
      document.getElementById("clientAdminName").value = client.name
      document.getElementById("clientAdminId").value = client.identification
      document.getElementById("clientAdminPhone").value = client.phone
      document.getElementById("clientAdminEmail").value = client.email
      document.getElementById("clientAdminAddress").value = client.address

      document.getElementById("clientModalTitle").textContent = "Editar Cliente"
      document.getElementById("clientSubmitBtn").textContent = "Actualizar Cliente"
      clientModal.style.display = "block"
    }
  }

  window.deleteClient = (identification) => {
    if (confirm("¿Está seguro de eliminar este cliente?")) {
      const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []
      const clientIndex = clients.findIndex((c) => c.identification === identification)
      if (clientIndex !== -1) {
        const client = clients[clientIndex]
        clients.splice(clientIndex, 1)
        localStorage.setItem("pharmasoft_clients", JSON.stringify(clients))

        if (window.logActivity) {
          window.logActivity("client", `Cliente ${client.name} eliminado del sistema`)
        }
        loadClientsAdmin()
        loadDashboardData()
        alert("Cliente eliminado exitosamente")
      }
    }
  }

  // Report generation functions
  window.generateSalesReport = () => {
    const fromDate = document.getElementById("salesFromDate").value
    const toDate = document.getElementById("salesToDate").value

    if (!fromDate || !toDate) {
      alert("Por favor seleccione las fechas")
      return
    }

    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    const filteredInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date).toDateString()
      const from = new Date(fromDate).toDateString()
      const to = new Date(toDate).toDateString()
      return invDate >= from && invDate <= to
    })

    generateSalesReportPDF(filteredInvoices, fromDate, toDate)
  }

  window.generateInventoryReport = () => {
    const products = window.productsManager.getAllProducts()
    generateInventoryReportPDF(products)
  }

  window.generateClientsReport = () => {
    const clients = JSON.parse(localStorage.getItem("pharmasoft_clients")) || []
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    generateClientsReportPDF(clients, invoices)
  }

  window.generateCashReport = () => {
    const fromDate = document.getElementById("cashFromDate").value
    const toDate = document.getElementById("cashToDate").value

    if (!fromDate || !toDate) {
      alert("Por favor seleccione las fechas")
      return
    }

    const cashClosings = JSON.parse(localStorage.getItem("pharmasoft_cash_closings")) || []
    const filteredClosings = cashClosings.filter((closing) => {
      const closingDate = new Date(closing.date).toDateString()
      const from = new Date(fromDate).toDateString()
      const to = new Date(toDate).toDateString()
      return closingDate >= from && closingDate <= to
    })

    generateCashReportPDF(filteredClosings, fromDate, toDate)
  }

  // Data management functions
  window.exportData = () => {
    const data = {
      products: window.productsManager.getAllProducts(),
      clients: JSON.parse(localStorage.getItem("pharmasoft_clients")) || [],
      invoices: JSON.parse(localStorage.getItem("pharmasoft_invoices")) || [],
      users: window.auth.users,
      activities: JSON.parse(localStorage.getItem("pharmasoft_activities")) || [],
      cashClosings: JSON.parse(localStorage.getItem("pharmasoft_cash_closings")) || [],
      config: JSON.parse(localStorage.getItem("pharmasoft_config")) || {},
      pharmacyInfo: JSON.parse(localStorage.getItem("pharmasoft_pharmacy_info")) || {},
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pharmasoft_backup_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    alert("Datos exportados exitosamente")
  }

  window.importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (confirm("¿Está seguro de importar estos datos? Esto sobrescribirá todos los datos actuales.")) {
          // Import data
          if (data.products) {
            localStorage.setItem("pharmasoft_products", JSON.stringify(data.products))
            window.productsManager.loadProducts()
          }
          if (data.clients) localStorage.setItem("pharmasoft_clients", JSON.stringify(data.clients))
          if (data.invoices) localStorage.setItem("pharmasoft_invoices", JSON.stringify(data.invoices))
          if (data.activities) localStorage.setItem("pharmasoft_activities", JSON.stringify(data.activities))
          if (data.cashClosings) localStorage.setItem("pharmasoft_cash_closings", JSON.stringify(data.cashClosings))
          if (data.config) localStorage.setItem("pharmasoft_config", JSON.stringify(data.config))
          if (data.pharmacyInfo) localStorage.setItem("pharmasoft_pharmacy_info", JSON.stringify(data.pharmacyInfo))
          if (data.users) window.auth.users = data.users

          alert("Datos importados exitosamente")
          location.reload()
        }
      } catch (error) {
        alert("Error al importar los datos. Verifique que el archivo sea válido.")
      }
    }
    reader.readAsText(file)
  }

  window.clearAllData = () => {
    if (confirm("¿Está seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.")) {
      if (
        confirm(
          "Esta acción eliminará permanentemente todos los productos, clientes, facturas y configuraciones. ¿Continuar?",
        )
      ) {
        localStorage.removeItem("pharmasoft_products")
        localStorage.removeItem("pharmasoft_clients")
        localStorage.removeItem("pharmasoft_invoices")
        localStorage.removeItem("pharmasoft_activities")
        localStorage.removeItem("pharmasoft_cash_closings")
        localStorage.removeItem("pharmasoft_config")
        localStorage.removeItem("pharmasoft_pharmacy_info")

        alert("Todos los datos han sido eliminados")
        location.reload()
      }
    }
  }

  // Report PDF generation functions
  function generateSalesReportPDF(invoices, fromDate, toDate) {
    const printWindow = window.open("", "_blank")
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0)

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Ventas - PharmaSoft</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #ff6b00; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ff6b00; color: white; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PharmaSoft</div>
          <h2>Reporte de Ventas</h2>
          <p>Período: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
          <p>Generado: ${new Date().toLocaleString("es-ES")}</p>
        </div>
        
        <h3>Resumen</h3>
        <table>
          <tr><td>Total de Facturas:</td><td>${invoices.length}</td></tr>
          <tr><td>Total de Ventas:</td><td>$${totalSales.toLocaleString()}</td></tr>
          <tr><td>Promedio por Factura:</td><td>$${invoices.length > 0 ? Math.round(totalSales / invoices.length).toLocaleString() : 0}</td></tr>
        </table>
        
        <h3>Detalle de Facturas</h3>
        <table>
          <thead>
            <tr>
              <th>Factura #</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Empleado</th>
            </tr>
          </thead>
          <tbody>
            ${invoices
              .map(
                (inv) => `
              <tr>
                <td>#${inv.id.toString().slice(-6)}</td>
                <td>${formatDate(inv.date)}</td>
                <td>${inv.client.name}</td>
                <td>$${inv.total.toLocaleString()}</td>
                <td>${inv.employee}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }

  function generateInventoryReportPDF(products) {
    const printWindow = window.open("", "_blank")
    const lowStockProducts = products.filter((p) => p.stock <= 5)
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Inventario - PharmaSoft</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #ff6b00; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ff6b00; color: white; }
          .low-stock { background-color: #ffebee; }
          .expired { background-color: #ffcdd2; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PharmaSoft</div>
          <h2>Reporte de Inventario</h2>
          <p>Generado: ${new Date().toLocaleString("es-ES")}</p>
        </div>
        
        <h3>Resumen</h3>
        <table>
          <tr><td>Total de Productos:</td><td>${products.length}</td></tr>
          <tr><td>Productos con Stock Bajo:</td><td>${lowStockProducts.length}</td></tr>
          <tr><td>Valor Total del Inventario:</td><td>$${totalValue.toLocaleString()}</td></tr>
        </table>
        
        <h3>Inventario Completo</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Valor Total</th>
              <th>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map((product) => {
                const isLowStock = product.stock <= 5
                const expiryDate = new Date(product.expiryDate)
                const isExpired = expiryDate < new Date()
                const rowClass = isExpired ? "expired" : isLowStock ? "low-stock" : ""

                return `
                <tr class="${rowClass}">
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.stock}</td>
                  <td>$${product.price.toLocaleString()}</td>
                  <td>$${(product.price * product.stock).toLocaleString()}</td>
                  <td>${formatDate(product.expiryDate)}</td>
                </tr>
              `
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }

  function generateClientsReportPDF(clients, invoices) {
    const printWindow = window.open("", "_blank")

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Clientes - PharmaSoft</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #ff6b00; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ff6b00; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PharmaSoft</div>
          <h2>Reporte de Clientes</h2>
          <p>Generado: ${new Date().toLocaleString("es-ES")}</p>
        </div>
        
        <h3>Resumen</h3>
        <table>
          <tr><td>Total de Clientes:</td><td>${clients.length}</td></tr>
          <tr><td>Total de Facturas:</td><td>${invoices.length}</td></tr>
        </table>
        
        <h3>Listado de Clientes</h3>
        <table>
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Facturas</th>
              <th>Total Compras</th>
            </tr>
          </thead>
          <tbody>
            ${clients
              .map((client) => {
                const clientInvoices = invoices.filter((inv) => inv.client.identification === client.identification)
                const totalPurchases = clientInvoices.reduce((sum, inv) => sum + inv.total, 0)

                return `
                <tr>
                  <td>${client.identification}</td>
                  <td>${client.name}</td>
                  <td>${client.phone}</td>
                  <td>${client.email}</td>
                  <td>${client.address}</td>
                  <td>${clientInvoices.length}</td>
                  <td>$${totalPurchases.toLocaleString()}</td>
                </tr>
              `
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }

  function generateCashReportPDF(cashClosings, fromDate, toDate) {
    const printWindow = window.open("", "_blank")
    const totalSales = cashClosings.reduce((sum, closing) => sum + closing.totalSales, 0)
    const totalCounted = cashClosings.reduce((sum, closing) => sum + closing.totalCounted, 0)
    const totalDifference = totalCounted - totalSales

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Cierres de Caja - PharmaSoft</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ff6b00; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #ff6b00; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ff6b00; color: white; }
          .positive { color: #28a745; }
          .negative { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PharmaSoft</div>
          <h2>Reporte de Cierres de Caja</h2>
          <p>Período: ${formatDate(fromDate)} - ${formatDate(toDate)}</p>
          <p>Generado: ${new Date().toLocaleString("es-ES")}</p>
        </div>
        
        <h3>Resumen</h3>
        <table>
          <tr><td>Total de Cierres:</td><td>${cashClosings.length}</td></tr>
          <tr><td>Total Ventas:</td><td>$${totalSales.toLocaleString()}</td></tr>
          <tr><td>Total Contado:</td><td>$${totalCounted.toLocaleString()}</td></tr>
          <tr><td>Diferencia Total:</td><td class="${totalDifference >= 0 ? "positive" : "negative"}">$${totalDifference.toLocaleString()}</td></tr>
        </table>
        
        <h3>Detalle de Cierres</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Ventas</th>
              <th>Contado</th>
              <th>Diferencia</th>
              <th>Facturas</th>
            </tr>
          </thead>
          <tbody>
            ${cashClosings
              .map((closing) => {
                const difference = closing.difference || closing.totalCounted - closing.totalSales
                return `
                <tr>
                  <td>${formatDate(closing.date)}</td>
                  <td>${closing.employee}</td>
                  <td>$${closing.totalSales.toLocaleString()}</td>
                  <td>$${closing.totalCounted.toLocaleString()}</td>
                  <td class="${difference >= 0 ? "positive" : "negative"}">$${difference.toLocaleString()}</td>
                  <td>${closing.invoicesCount}</td>
                </tr>
              `
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }
})
