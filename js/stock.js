document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const searchInput = document.getElementById("searchStock")
  const stockTableBody = document.getElementById("stockTableBody")
  const filterTabs = document.querySelectorAll(".tab")
  const addStockBtn = document.getElementById("addStockBtn")
  const stockModal = document.getElementById("stockModal")
  const updateStockModal = document.getElementById("updateStockModal")
  const stockForm = document.getElementById("stockForm")
  const updateStockForm = document.getElementById("updateStockForm")

  let currentFilter = "all"
  let searchTerm = ""

  // Initialize
  loadStockData()
  loadStockSummary()
  setupEventListeners()

  function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener("input", function () {
      searchTerm = this.value
      loadStockData()
    })

    // Filter tabs
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        filterTabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
        currentFilter = this.dataset.filter
        loadStockData()
      })
    })

    // Add stock button
    addStockBtn.addEventListener("click", () => {
      resetStockForm()
      stockModal.style.display = "block"
    })

    // Modal controls
    document.getElementById("closeStockModal").addEventListener("click", () => {
      stockModal.style.display = "none"
    })

    document.getElementById("closeUpdateStockModal").addEventListener("click", () => {
      updateStockModal.style.display = "none"
    })

    // Form submissions
    stockForm.addEventListener("submit", handleStockSubmit)
    updateStockForm.addEventListener("submit", handleUpdateStockSubmit)

    // Close modals on outside click
    window.addEventListener("click", (e) => {
      if (e.target === stockModal) stockModal.style.display = "none"
      if (e.target === updateStockModal) updateStockModal.style.display = "none"
    })
  }

  function loadStockData() {
    let products = window.productsManager.getAllProducts()

    // Filter by search term
    if (searchTerm) {
      products = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by status
    if (currentFilter !== "all") {
      products = products.filter((product) => {
        const status = getProductStatus(product)
        return status === currentFilter
      })
    }

    renderStockTable(products)
  }

  function renderStockTable(products) {
    stockTableBody.innerHTML = ""

    if (products.length === 0) {
      stockTableBody.innerHTML =
        '<tr><td colspan="7" style="text-align: center; color: #666;">No se encontraron productos</td></tr>'
      return
    }

    products.forEach((product) => {
      const row = document.createElement("tr")
      const status = getProductStatus(product)
      const statusText = getStatusText(status)

      // Add row class based on status
      if (status === "low-stock") row.classList.add("low-stock")
      if (status === "expiring") row.classList.add("expiring")
      if (status === "expired") row.classList.add("expired")

      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.stock}</td>
        <td>$${product.price.toLocaleString()}</td>
        <td>${formatDate(product.expiryDate)}</td>
        <td><span class="status-badge ${status}">${statusText}</span></td>
        <td>
          <button class="action-btn edit-btn" onclick="editStockProduct(${product.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn stock-btn" onclick="updateStock(${product.id})" title="Actualizar Stock">
            <i class="fas fa-plus-circle"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteStockProduct(${product.id})" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `

      stockTableBody.appendChild(row)
    })
  }

  function loadStockSummary() {
    const products = window.productsManager.getAllProducts()
    const lowStockProducts = products.filter((p) => p.stock <= 5)
    const expiringProducts = products.filter((p) => {
      const expiryDate = new Date(p.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
    })
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

    document.getElementById("totalProducts").textContent = products.length
    document.getElementById("lowStockProducts").textContent = lowStockProducts.length
    document.getElementById("expiringProducts").textContent = expiringProducts.length
    document.getElementById("totalValue").textContent = `$${totalValue.toLocaleString()}`
  }

  function getProductStatus(product) {
    const expiryDate = new Date(product.expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return "expired"
    if (daysUntilExpiry <= 30) return "expiring"
    if (product.stock <= 5) return "low-stock"
    return "normal"
  }

  function getStatusText(status) {
    const statusTexts = {
      normal: "Normal",
      "low-stock": "Stock Bajo",
      expiring: "Por Vencer",
      expired: "Vencido",
    }
    return statusTexts[status] || "Normal"
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  function resetStockForm() {
    document.getElementById("stockEditId").value = ""
    document.getElementById("stockModalTitle").textContent = "Agregar Producto"
    document.getElementById("stockSubmitBtn").textContent = "Agregar Producto"
    stockForm.reset()
  }

  function handleStockSubmit(e) {
    e.preventDefault()

    const editId = document.getElementById("stockEditId").value
    const productData = {
      name: document.getElementById("stockName").value,
      category: document.getElementById("stockCategory").value,
      price: Number.parseFloat(document.getElementById("stockPrice").value),
      stock: Number.parseInt(document.getElementById("stockQuantity").value),
      expiryDate: document.getElementById("stockExpiry").value,
      description: document.getElementById("stockDescription").value,
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

    stockModal.style.display = "none"
    loadStockData()
    loadStockSummary()
  }

  function handleUpdateStockSubmit(e) {
    e.preventDefault()

    const productId = Number.parseInt(document.getElementById("updateStockProductId").value)
    const updateType = document.querySelector('input[name="updateType"]:checked').value
    const quantity = Number.parseInt(document.getElementById("stockUpdateQuantity").value)
    const reason = document.getElementById("stockUpdateReason").value

    const product = window.productsManager.getProductById(productId)
    if (!product) {
      alert("Producto no encontrado")
      return
    }

    let newStock = product.stock

    switch (updateType) {
      case "add":
        newStock += quantity
        break
      case "subtract":
        newStock = Math.max(0, newStock - quantity)
        break
      case "set":
        newStock = quantity
        break
    }

    // Update product stock
    window.productsManager.updateProduct(productId, { stock: newStock })

    // Log the stock change
    if (window.logActivity) {
      const actionText = {
        add: "agregado",
        subtract: "reducido",
        set: "establecido",
      }
      window.logActivity(
        "product",
        `Stock ${actionText[updateType]} para ${product.name}: ${quantity} unidades. Motivo: ${reason || "No especificado"}`,
      )
    }

    alert("Stock actualizado exitosamente")
    updateStockModal.style.display = "none"
    loadStockData()
    loadStockSummary()
  }

  // Global functions
  window.editStockProduct = (id) => {
    const product = window.productsManager.getProductById(id)
    if (product) {
      document.getElementById("stockEditId").value = id
      document.getElementById("stockName").value = product.name
      document.getElementById("stockCategory").value = product.category
      document.getElementById("stockPrice").value = product.price
      document.getElementById("stockQuantity").value = product.stock
      document.getElementById("stockExpiry").value = product.expiryDate
      document.getElementById("stockDescription").value = product.description || ""

      document.getElementById("stockModalTitle").textContent = "Editar Producto"
      document.getElementById("stockSubmitBtn").textContent = "Actualizar Producto"
      stockModal.style.display = "block"
    }
  }

  window.updateStock = (id) => {
    const product = window.productsManager.getProductById(id)
    if (product) {
      document.getElementById("updateStockProductId").value = id
      document.getElementById("updateProductName").textContent = product.name
      document.getElementById("currentStock").textContent = product.stock
      document.getElementById("stockUpdateQuantity").value = ""
      document.getElementById("stockUpdateReason").value = ""

      // Reset radio buttons
      document.querySelector('input[name="updateType"][value="add"]').checked = true

      updateStockModal.style.display = "block"
    }
  }

  window.deleteStockProduct = (id) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      const product = window.productsManager.getProductById(id)
      if (window.productsManager.deleteProduct(id)) {
        if (window.logActivity) {
          window.logActivity("product", `Producto ${product.name} eliminado del inventario`)
        }
        loadStockData()
        loadStockSummary()
        alert("Producto eliminado exitosamente")
      }
    }
  }
})
