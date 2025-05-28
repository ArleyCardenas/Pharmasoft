document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const productsTableBody = document.getElementById("productsTableBody")
  const addButton = document.getElementById("add-button-products")
  const modal = document.getElementById("modal-products")
  const updateModal = document.getElementById("modal-products-update")
  const closeBtn = document.getElementById("close-products")
  const closeUpdateBtn = document.getElementById("close-products-update")
  const productForm = document.getElementById("productForm")
  const updateProductForm = document.getElementById("updateProductForm")
  const searchInput = document.getElementById("searchProducts")

  let filteredProducts = []

  // Initialize
  loadProducts()
  setupEventListeners()

  function loadProducts() {
    const products = window.productsManager.getAllProducts()
    filteredProducts = [...products]
    renderProducts()
  }

  function setupEventListeners() {
    // Add button
    addButton.addEventListener("click", () => {
      modal.style.display = "block"
    })

    // Close buttons
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none"
    })

    closeUpdateBtn.addEventListener("click", () => {
      updateModal.style.display = "none"
    })

    // Close on outside click
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
      if (e.target === updateModal) {
        updateModal.style.display = "none"
      }
    })

    // Form submissions
    productForm.addEventListener("submit", handleAddProduct)
    updateProductForm.addEventListener("submit", handleUpdateProduct)

    // Search functionality
    searchInput.addEventListener("input", handleSearch)
  }

  function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase()
    const products = window.productsManager.getAllProducts()
    filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm),
    )
    renderProducts()
  }

  function handleAddProduct(e) {
    e.preventDefault()

    const newProduct = {
      name: document.getElementById("productName").value,
      category: document.getElementById("productCategory").value,
      price: Number.parseInt(document.getElementById("productPrice").value),
      stock: Number.parseInt(document.getElementById("productStock").value),
      expiryDate: document.getElementById("productExpiry").value,
      image: "https://via.placeholder.com/120x120?text=Producto",
    }

    window.productsManager.addProduct(newProduct)
    loadProducts()

    modal.style.display = "none"
    productForm.reset()
    alert("Producto agregado exitosamente")
  }

  function handleUpdateProduct(e) {
    e.preventDefault()

    const productId = document.getElementById("updateProductIndex").value
    const updates = {
      name: document.getElementById("updateProductName").value,
      category: document.getElementById("updateProductCategory").value,
      price: Number.parseInt(document.getElementById("updateProductPrice").value),
      stock: Number.parseInt(document.getElementById("updateProductStock").value),
      expiryDate: document.getElementById("updateProductExpiry").value,
    }

    window.productsManager.updateProduct(productId, updates)
    loadProducts()

    updateModal.style.display = "none"
    alert("Producto actualizado exitosamente")
  }

  function renderProducts() {
    productsTableBody.innerHTML = ""

    filteredProducts.forEach((product) => {
      const row = document.createElement("tr")

      // Check if product is low stock, expired, or near expiry
      const isLowStock = product.stock <= 5
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
      const isExpired = daysUntilExpiry < 0
      const isNearExpiry = daysUntilExpiry >= 0 && daysUntilExpiry <= 30

      // Add appropriate classes
      if (isLowStock) row.classList.add("low-stock")
      if (isExpired) row.classList.add("expired")
      else if (isNearExpiry) row.classList.add("near-expiry")

      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toLocaleString()}</td>
        <td>${product.stock}</td>
        <td>${formatDate(product.expiryDate)}</td>
        <td>
          <button class="update-btn" data-id="${product.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `

      // Add event listeners
      const updateBtn = row.querySelector(".update-btn")
      const deleteBtn = row.querySelector(".delete-btn")

      updateBtn.addEventListener("click", () => {
        openUpdateModal(product)
      })

      deleteBtn.addEventListener("click", () => {
        if (confirm("¿Está seguro de eliminar este producto?")) {
          deleteProduct(product.id)
        }
      })

      productsTableBody.appendChild(row)
    })
  }

  function openUpdateModal(product) {
    document.getElementById("updateProductIndex").value = product.id
    document.getElementById("updateProductName").value = product.name
    document.getElementById("updateProductCategory").value = product.category
    document.getElementById("updateProductPrice").value = product.price
    document.getElementById("updateProductStock").value = product.stock
    document.getElementById("updateProductExpiry").value = product.expiryDate

    updateModal.style.display = "block"
  }

  function deleteProduct(productId) {
    window.productsManager.deleteProduct(productId)
    loadProducts()
    alert("Producto eliminado exitosamente")
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }
})
