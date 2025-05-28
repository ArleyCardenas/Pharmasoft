document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const searchInput = document.getElementById("searchInput")
  const categoriesContainer = document.querySelector(".categories")
  const productsGrid = document.getElementById("productsGrid")

  let currentCategory = "Reciente"
  let searchTerm = ""

  // Initialize page
  loadProducts()
  setupEventListeners()

  function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener("input", function () {
      searchTerm = this.value
      loadProducts()
    })

    // Category selection
    categoriesContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("category")) {
        // Remove active class from all categories
        document.querySelectorAll(".category").forEach((cat) => {
          cat.classList.remove("active")
        })

        // Add active class to clicked category
        e.target.classList.add("active")
        currentCategory = e.target.dataset.category
        loadProducts()
      }
    })
  }

  function loadProducts() {
    let products = window.productsManager.getAllProducts()

    // Filter by search term
    if (searchTerm) {
      products = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by category
    if (currentCategory !== "Reciente") {
      products = products.filter((product) => product.category === currentCategory)
    }

    renderProducts(products)
  }

  function renderProducts(products) {
    productsGrid.innerHTML = ""

    products.forEach((product) => {
      const productCard = createProductCard(product)
      productsGrid.appendChild(productCard)
    })
  }

  function createProductCard(product) {
    const card = document.createElement("div")
    card.className = "product-card"

    // Add low stock class if needed
    if (product.stock <= 5) {
      card.classList.add("low-stock")
    }

    card.innerHTML = `
            <div class="availability">Disponibles: ${product.stock}</div>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="med-image">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="btn-restar" data-product-id="${product.id}">&#60;</button>
                        <span class="quantity">0</span>
                        <button class="btn-aumentar" data-product-id="${product.id}">&#62;</button>
                    </div>
                    <button class="add-btn" data-product-id="${product.id}">Añadir</button>
                </div>
            </div>
        `

    // Add event listeners for quantity controls
    const decreaseBtn = card.querySelector(".btn-restar")
    const increaseBtn = card.querySelector(".btn-aumentar")
    const quantitySpan = card.querySelector(".quantity")
    const addBtn = card.querySelector(".add-btn")

    decreaseBtn.addEventListener("click", () => {
      let quantity = Number.parseInt(quantitySpan.textContent)
      if (quantity > 0) {
        quantity--
        quantitySpan.textContent = quantity
      }
    })

    increaseBtn.addEventListener("click", () => {
      let quantity = Number.parseInt(quantitySpan.textContent)
      quantity++
      quantitySpan.textContent = quantity
    })

    addBtn.addEventListener("click", () => {
      const quantity = Number.parseInt(quantitySpan.textContent)
      if (quantity > 0) {
        window.cart.addItem(product, quantity)
        quantitySpan.textContent = "0"
        alert("Producto agregado a la factura")
      } else {
        alert("Ingrese la cantidad")
      }
    })

    return card
  }
})
