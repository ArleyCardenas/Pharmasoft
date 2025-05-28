document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const invoiceTableBody = document.getElementById("invoiceTableBody")
  const totalValue = document.getElementById("totalValue")
  const generateBtn = document.getElementById("generateBtn")
  const cancelBtn = document.getElementById("cancelBtn")

  // Load cart items
  loadInvoiceItems()

  function loadInvoiceItems() {
    const cartItems = window.cart.getItems()
    invoiceTableBody.innerHTML = ""

    cartItems.forEach((item) => {
      const row = document.createElement("tr")
      const totalPrice = item.quantity * item.product.price

      row.innerHTML = `
                <td>${item.quantity}</td>
                <td>${item.product.name}</td>
                <td>$${item.product.price.toLocaleString()}</td>
                <td>$${totalPrice.toLocaleString()}</td>
                <td>
                    <button class="delete-btn" data-product-id="${item.product.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `

      // Add delete functionality
      const deleteBtn = row.querySelector(".delete-btn")
      deleteBtn.addEventListener("click", function () {
        window.cart.removeItem(Number.parseInt(this.dataset.productId))
        loadInvoiceItems()
      })

      invoiceTableBody.appendChild(row)
    })

    // Update total
    totalValue.textContent = `$${window.cart.getTotal().toLocaleString()}`
  }

  // Generate invoice
  generateBtn.addEventListener("click", () => {
    const clientName = document.getElementById("nameClient").value
    const clientId = document.getElementById("idClient").value
    const clientPhone = document.getElementById("telefonoClient").value
    const clientAddress = document.getElementById("direccionClient").value
    const clientEmail = document.getElementById("emailClient").value

    if (!clientName || !clientId) {
      alert("Por favor complete la información del cliente")
      return
    }

    if (window.cart.getItems().length === 0) {
      alert("No hay productos en la factura")
      return
    }

    // Create invoice object
    const invoice = {
      id: Date.now(),
      date: new Date().toISOString(),
      client: {
        name: clientName,
        identification: clientId,
        phone: clientPhone,
        address: clientAddress,
        email: clientEmail,
      },
      items: window.cart.getItems(),
      total: window.cart.getTotal(),
      employee: window.auth.getCurrentUser().name,
    }

    // Save invoice
    saveInvoice(invoice)

    // Update product stock
    window.cart.getItems().forEach((item) => {
      window.productsManager.updateStock(item.product.id, item.quantity)
    })

    // Clear cart
    window.cart.clear()

    alert("Factura generada exitosamente")

    // Clear form
    document.getElementById("nameClient").value = ""
    document.getElementById("idClient").value = ""
    document.getElementById("telefonoClient").value = ""
    document.getElementById("direccionClient").value = ""
    document.getElementById("emailClient").value = ""

    loadInvoiceItems()
  })

  // Cancel invoice
  cancelBtn.addEventListener("click", () => {
    if (confirm("¿Está seguro de cancelar la factura?")) {
      window.cart.clear()
      loadInvoiceItems()

      // Clear form
      document.getElementById("nameClient").value = ""
      document.getElementById("idClient").value = ""
      document.getElementById("telefonoClient").value = ""
      document.getElementById("direccionClient").value = ""
      document.getElementById("emailClient").value = ""
    }
  })

  function saveInvoice(invoice) {
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    invoices.push(invoice)
    localStorage.setItem("pharmasoft_invoices", JSON.stringify(invoices))
  }
})
