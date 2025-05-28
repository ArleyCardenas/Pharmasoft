document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const currentDateElement = document.getElementById("currentDate")
  const totalSalesElement = document.getElementById("totalSales")
  const totalInvoicesElement = document.getElementById("totalInvoices")
  const totalProductsElement = document.getElementById("totalProducts")
  const salesTableBody = document.getElementById("salesTableBody")
  const printReportBtn = document.getElementById("printReport")
  const closeCashBtn = document.getElementById("closeCash")
  const closeCashModal = document.getElementById("closeCashModal")
  const closeModalBtn = document.getElementById("closeModal")
  const cancelCloseBtn = document.getElementById("cancelClose")
  const confirmCloseBtn = document.getElementById("confirmClose")

  // Cash counting elements
  const denominationInputs = {
    bill100000: document.getElementById("bill100000"),
    bill50000: document.getElementById("bill50000"),
    bill20000: document.getElementById("bill20000"),
    bill10000: document.getElementById("bill10000"),
    bill5000: document.getElementById("bill5000"),
    bill2000: document.getElementById("bill2000"),
    bill1000: document.getElementById("bill1000"),
    coins: document.getElementById("coins"),
  }

  const denominationValues = {
    bill100000: 100000,
    bill50000: 50000,
    bill20000: 20000,
    bill10000: 10000,
    bill5000: 5000,
    bill2000: 2000,
    bill1000: 1000,
    coins: 1,
  }

  const dailySales = {
    totalAmount: 0,
    totalInvoices: 0,
    totalProducts: 0,
    invoices: [],
  }

  // Initialize
  loadDailySales()
  setupEventListeners()
  updateCurrentDate()

  function setupEventListeners() {
    // Cash counting inputs
    Object.keys(denominationInputs).forEach((key) => {
      denominationInputs[key].addEventListener("input", updateCashCount)
    })

    // Buttons
    printReportBtn.addEventListener("click", printReport)
    closeCashBtn.addEventListener("click", openCloseCashModal)
    closeModalBtn.addEventListener("click", closeModal)
    cancelCloseBtn.addEventListener("click", closeModal)
    confirmCloseBtn.addEventListener("click", confirmCloseCash)

    // Close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target === closeCashModal) {
        closeModal()
      }
    })
  }

  function updateCurrentDate() {
    const today = new Date()
    currentDateElement.textContent = today.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function loadDailySales() {
    // Load invoices from localStorage
    const invoices = JSON.parse(localStorage.getItem("pharmasoft_invoices")) || []
    const today = new Date().toLocaleDateString()

    // Filter today's invoices
    const todayInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date).toLocaleDateString()
      return invoiceDate === today
    })

    // Calculate totals
    dailySales.invoices = todayInvoices
    dailySales.totalInvoices = todayInvoices.length
    dailySales.totalAmount = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    dailySales.totalProducts = todayInvoices.reduce((sum, invoice) => {
      return sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    updateSummaryDisplay()
    renderSalesTable()
  }

  function updateSummaryDisplay() {
    totalSalesElement.textContent = `$${dailySales.totalAmount.toLocaleString()}`
    totalInvoicesElement.textContent = dailySales.totalInvoices
    totalProductsElement.textContent = dailySales.totalProducts

    // Update totals in cash section
    document.getElementById("totalSalesAmount").textContent = `$${dailySales.totalAmount.toLocaleString()}`
  }

  function renderSalesTable() {
    salesTableBody.innerHTML = ""

    dailySales.invoices.forEach((invoice) => {
      const row = document.createElement("tr")
      const invoiceTime = new Date(invoice.date).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })

      row.innerHTML = `
        <td>#${invoice.id.toString().slice(-6)}</td>
        <td>${invoice.client.name}</td>
        <td>${invoiceTime}</td>
        <td>$${invoice.total.toLocaleString()}</td>
        <td>${invoice.employee}</td>
      `

      salesTableBody.appendChild(row)
    })
  }

  function updateCashCount() {
    let totalCounted = 0

    Object.keys(denominationInputs).forEach((key) => {
      const input = denominationInputs[key]
      const quantity = Number.parseInt(input.value) || 0
      const value = denominationValues[key]
      const total = quantity * value

      // Update the total display for this denomination
      const totalSpan = input.parentElement.querySelector(".total")
      totalSpan.textContent = `$${total.toLocaleString()}`

      totalCounted += total
    })

    // Update totals
    document.getElementById("totalCounted").textContent = `$${totalCounted.toLocaleString()}`

    const difference = totalCounted - dailySales.totalAmount
    const differenceElement = document.getElementById("difference")
    differenceElement.textContent = `$${difference.toLocaleString()}`

    // Color code the difference
    if (difference === 0) {
      differenceElement.style.color = "#28a745"
    } else if (difference > 0) {
      differenceElement.style.color = "#007bff"
    } else {
      differenceElement.style.color = "#dc3545"
    }
  }

  function openCloseCashModal() {
    const totalCounted = calculateTotalCounted()
    const difference = totalCounted - dailySales.totalAmount

    document.getElementById("modalTotalSales").textContent = `$${dailySales.totalAmount.toLocaleString()}`
    document.getElementById("modalTotalCounted").textContent = `$${totalCounted.toLocaleString()}`
    document.getElementById("modalDifference").textContent = `$${difference.toLocaleString()}`

    closeCashModal.style.display = "block"
  }

  function closeModal() {
    closeCashModal.style.display = "none"
  }

  function calculateTotalCounted() {
    let total = 0
    Object.keys(denominationInputs).forEach((key) => {
      const quantity = Number.parseInt(denominationInputs[key].value) || 0
      total += quantity * denominationValues[key]
    })
    return total
  }

  function confirmCloseCash() {
    const totalCounted = calculateTotalCounted()
    const difference = totalCounted - dailySales.totalAmount

    // Create cash closing record
    const cashClosing = {
      id: Date.now(),
      date: new Date().toISOString(),
      employee: window.auth.getCurrentUser().name,
      totalSales: dailySales.totalAmount,
      totalCounted: totalCounted,
      difference: difference,
      invoicesCount: dailySales.totalInvoices,
      productsCount: dailySales.totalProducts,
      denominations: {},
    }

    // Save denomination counts
    Object.keys(denominationInputs).forEach((key) => {
      cashClosing.denominations[key] = Number.parseInt(denominationInputs[key].value) || 0
    })

    // Save cash closing record
    const cashClosings = JSON.parse(localStorage.getItem("pharmasoft_cash_closings")) || []
    cashClosings.push(cashClosing)
    localStorage.setItem("pharmasoft_cash_closings", JSON.stringify(cashClosings))

    closeModal()
    alert("Caja cerrada exitosamente")

    // Reset form
    Object.keys(denominationInputs).forEach((key) => {
      denominationInputs[key].value = "0"
    })
    updateCashCount()
  }

  function printReport() {
    const printWindow = window.open("", "_blank")
    const totalCounted = calculateTotalCounted()
    const difference = totalCounted - dailySales.totalAmount

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Cierre de Caja - PharmaSoft</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ff6b00; border-bottom: 1px solid #ff6b00; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .difference { color: ${difference === 0 ? "#28a745" : difference > 0 ? "#007bff" : "#dc3545"}; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PharmaSoft</h1>
          <h2>Reporte de Cierre de Caja</h2>
          <p>Fecha: ${new Date().toLocaleDateString("es-ES")}</p>
          <p>Empleado: ${window.auth.getCurrentUser().name}</p>
        </div>

        <div class="section">
          <h3>Resumen de Ventas</h3>
          <table>
            <tr><td>Total de Ventas:</td><td>$${dailySales.totalAmount.toLocaleString()}</td></tr>
            <tr><td>Número de Facturas:</td><td>${dailySales.totalInvoices}</td></tr>
            <tr><td>Productos Vendidos:</td><td>${dailySales.totalProducts}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Conteo de Efectivo</h3>
          <table>
            <tr><td>Billetes de $100,000:</td><td>${denominationInputs.bill100000.value}</td><td>$${(Number.parseInt(denominationInputs.bill100000.value) * 100000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $50,000:</td><td>${denominationInputs.bill50000.value}</td><td>$${(Number.parseInt(denominationInputs.bill50000.value) * 50000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $20,000:</td><td>${denominationInputs.bill20000.value}</td><td>$${(Number.parseInt(denominationInputs.bill20000.value) * 20000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $10,000:</td><td>${denominationInputs.bill10000.value}</td><td>$${(Number.parseInt(denominationInputs.bill10000.value) * 10000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $5,000:</td><td>${denominationInputs.bill5000.value}</td><td>$${(Number.parseInt(denominationInputs.bill5000.value) * 5000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $2,000:</td><td>${denominationInputs.bill2000.value}</td><td>$${(Number.parseInt(denominationInputs.bill2000.value) * 2000).toLocaleString()}</td></tr>
            <tr><td>Billetes de $1,000:</td><td>${denominationInputs.bill1000.value}</td><td>$${(Number.parseInt(denominationInputs.bill1000.value) * 1000).toLocaleString()}</td></tr>
            <tr><td>Monedas:</td><td>${denominationInputs.coins.value}</td><td>$${Number.parseInt(denominationInputs.coins.value).toLocaleString()}</td></tr>
            <tr class="total-row"><td>Total Contado:</td><td></td><td>$${totalCounted.toLocaleString()}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Resumen Final</h3>
          <table>
            <tr><td>Total Ventas:</td><td>$${dailySales.totalAmount.toLocaleString()}</td></tr>
            <tr><td>Total Contado:</td><td>$${totalCounted.toLocaleString()}</td></tr>
            <tr class="total-row difference"><td>Diferencia:</td><td>$${difference.toLocaleString()}</td></tr>
          </table>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }
})
