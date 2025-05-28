// Shopping cart management
class CartManager {
  constructor() {
    this.items = []
    this.loadCart()
  }

  loadCart() {
    const stored = localStorage.getItem("pharmasoft_cart")
    if (stored) {
      this.items = JSON.parse(stored)
    }
  }

  saveCart() {
    localStorage.setItem("pharmasoft_cart", JSON.stringify(this.items))
  }

  addItem(product, quantity) {
    const existingItem = this.items.find((item) => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        product: product,
        quantity: quantity,
      })
    }

    this.saveCart()
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.product.id !== productId)
    this.saveCart()
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.product.id === productId)
    if (item) {
      item.quantity = quantity
      this.saveCart()
    }
  }

  getItems() {
    return this.items
  }

  getTotal() {
    return this.items.reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  clear() {
    this.items = []
    this.saveCart()
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }
}

// Global cart instance
const cart = new CartManager()

// Make cart available globally
window.cart = cart
