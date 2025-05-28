// Products data management
class ProductsManager {
  constructor() {
    this.products = [
      {
        id: 1,
        name: "Ibuprofeno (400 mg, 30 tabletas)",
        price: 20000,
        stock: 100,
        category: "Tabletas",
        expiryDate: "2025-12-15",
        image: "https://via.placeholder.com/120x120?text=Ibuprofeno",
      },
      {
        id: 2,
        name: "Omeprazol (20 mg, 14 cápsulas)",
        price: 45000,
        stock: 100,
        category: "Tabletas",
        expiryDate: "2025-06-23",
        image: "https://via.placeholder.com/120x120?text=Omeprazol",
      },
      {
        id: 3,
        name: "Paracetamol (500 mg x 20 tabletas)",
        price: 30000,
        stock: 100,
        category: "Tabletas",
        expiryDate: "2025-08-15",
        image: "https://via.placeholder.com/120x120?text=Paracetamol",
      },
      {
        id: 4,
        name: "Acetaminofen (500 mg x 10 tabletas)",
        price: 5000,
        stock: 3,
        category: "Tabletas",
        expiryDate: "2025-08-15",
        image: "https://via.placeholder.com/120x120?text=Acetaminofen",
      },
      {
        id: 5,
        name: "Jarabe para la tos (120ml)",
        price: 15000,
        stock: 25,
        category: "Jarabes",
        expiryDate: "2025-10-20",
        image: "https://via.placeholder.com/120x120?text=Jarabe",
      },
      {
        id: 6,
        name: "Amoxicilina (500mg x 21 cápsulas)",
        price: 35000,
        stock: 2,
        category: "Tabletas",
        expiryDate: "2025-09-30",
        image: "https://via.placeholder.com/120x120?text=Amoxicilina",
      },
    ]
    this.loadProducts()
  }

  loadProducts() {
    const stored = localStorage.getItem("pharmasoft_products")
    if (stored) {
      this.products = JSON.parse(stored)
    } else {
      this.saveProducts()
    }
  }

  saveProducts() {
    localStorage.setItem("pharmasoft_products", JSON.stringify(this.products))
  }

  getAllProducts() {
    return this.products
  }

  getProductsByCategory(category) {
    if (category === "Reciente") {
      return this.products
    }
    return this.products.filter((product) => product.category === category)
  }

  searchProducts(searchTerm) {
    return this.products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  getProductById(id) {
    return this.products.find((product) => product.id === Number.parseInt(id))
  }

  addProduct(product) {
    const newProduct = {
      ...product,
      id: Math.max(...this.products.map((p) => p.id)) + 1,
    }
    this.products.push(newProduct)
    this.saveProducts()
    return newProduct
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex((p) => p.id === Number.parseInt(id))
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates }
      this.saveProducts()
      return this.products[index]
    }
    return null
  }

  deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === Number.parseInt(id))
    if (index !== -1) {
      this.products.splice(index, 1)
      this.saveProducts()
      return true
    }
    return false
  }

  updateStock(id, quantity) {
    const product = this.getProductById(id)
    if (product && product.stock >= quantity) {
      product.stock -= quantity
      this.saveProducts()
      return true
    }
    return false
  }
}

// Global products manager instance
const productsManager = new ProductsManager()

// Make productsManager available globally
window.productsManager = productsManager
