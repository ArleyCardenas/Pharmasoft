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

    // Check stock availability
    const cartItems = window.cart.getItems()
    for (const item of cartItems) {
      const currentProduct = window.productsManager.getProductById(item.product.id)
      if (currentProduct.stock < item.quantity) {
        alert(`Stock insuficiente para ${item.product.name}. Stock disponible: ${currentProduct.stock}`)
        return
      }
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

    // Log activity
    if (window.logActivity) {
      window.logActivity("invoice", `Factura #${invoice.id.toString().slice(-6)} generada para ${clientName}`)
    }

    // Print invoice
    printInvoice(invoice)

    // Clear cart
    window.cart.clear()

    alert("Factura generada exitosamente")

    // Clear form
    clearForm()
    loadInvoiceItems()
  })

  // Cancel invoice
  cancelBtn.addEventListener("click", () => {
    if (confirm("¿Está seguro de cancelar la factura?")) {
      window.cart.clear()
      loadInvoiceItems()
      clearForm()
    }
  })

  function clearForm() {
    document.getElementById("nameClient").value = ""
    document.getElementById("idClient").value = ""
    document.getElementById("telefonoClient").value = ""
    document.getElementById("direccionClient").value = ""
    document.getElementById("emailClient").value = ""
  }

  function saveInvoice(invoice) {
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    invoices.push(invoice)
    localStorage.setItem("pharmasoft_invoices", JSON.stringify(invoices))
  }

  function printInvoice(invoice) {
    const printWindow = window.open("", "_blank")

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura #${invoice.id.toString().slice(-6)} - PharmaSoft</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #ff6b00;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #ff6b00;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 20px;
            color: #333;
            margin-bottom: 10px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .client-info, .invoice-details {
            width: 48%;
          }
          .section-title {
            font-weight: bold;
            color: #ff6b00;
            margin-bottom: 10px;
            border-bottom: 1px solid #ff6b00;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: left; 
          }
          th { 
            background-color: #ff6b00; 
            color: white;
            font-weight: bold;
          }
          .total-row { 
            font-weight: bold; 
            background-color: #f8f9fa; 
            font-size: 16px;
          }
          .total-amount {
            color: #ff6b00;
            font-size: 18px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PharmaSoft</div>
          <div class="invoice-title">FACTURA DE VENTA</div>
          <p>Sistema de Gestión Farmacéutica</p>
        </div>

        <div class="invoice-info">
          <div class="client-info">
            <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
            <p><strong>Nombre:</strong> ${invoice.client.name}</p>
            <p><strong>Identificación:</strong> ${invoice.client.identification}</p>
            <p><strong>Teléfono:</strong> ${invoice.client.phone}</p>
            <p><strong>Dirección:</strong> ${invoice.client.address}</p>
            <p><strong>Email:</strong> ${invoice.client.email}</p>
          </div>
          
          <div class="invoice-details">
            <div class="section-title">DETALLES DE LA FACTURA</div>
            <p><strong>Factura #:</strong> ${invoice.id.toString().slice(-6)}</p>
            <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString("es-ES")}</p>
            <p><strong>Hora:</strong> ${new Date(invoice.date).toLocaleTimeString("es-ES")}</p>
            <p><strong>Empleado:</strong> ${invoice.employee}</p>
          </div>
        </div>

        <div class="section-title">PRODUCTOS</div>
        <table>
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.product.name}</td>
                <td>$${item.product.price.toLocaleString()}</td>
                <td>$${(item.quantity * item.product.price).toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total-row">
              <td colspan="3"><strong>TOTAL A PAGAR:</strong></td>
              <td class="total-amount"><strong>$${invoice.total.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Gracias por su compra</p>
          <p>PharmaSoft - Sistema de Gestión Farmacéutica</p>
          <p>Fecha de impresión: ${new Date().toLocaleString("es-ES")}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.print()
  }
})
