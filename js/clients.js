document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!window.auth || !window.auth.requireAuth()) return

  const clientsTableBody = document.getElementById("clientsTableBody")
  const addButton = document.getElementById("add-button-clients")
  const modal = document.getElementById("modal-clients")
  const updateModal = document.getElementById("modal-clients-update")
  const closeBtn = document.getElementById("close-clients")
  const closeUpdateBtn = document.getElementById("close-clients-update")
  const clientForm = document.getElementById("clientForm")
  const updateClientForm = document.getElementById("updateClientForm")
  const searchInput = document.getElementById("searchClients")

  let clients = []
  let filteredClients = []

  // Initialize
  loadClients()
  setupEventListeners()

  function loadClients() {
    const stored = localStorage.getItem("pharmasoft_clients")
    if (stored) {
      clients = JSON.parse(stored)
    } else {
      // Default clients
      clients = [
        {
          id: 1,
          name: "Santiago Casso",
          identification: "1059236474",
          phone: "3001234567",
          address: "Calle 123 #45-67",
          email: "santiago.casso@email.com",
        },
        {
          id: 2,
          name: "María González",
          identification: "1234567890",
          phone: "3009876543",
          address: "Carrera 45 #12-34",
          email: "maria.gonzalez@email.com",
        },
        {
          id: 3,
          name: "Carlos Rodríguez",
          identification: "9876543210",
          phone: "3005555555",
          address: "Avenida 67 #89-01",
          email: "carlos.rodriguez@email.com",
        },
      ]
      saveClients()
    }
    filteredClients = [...clients]
    renderClients()
  }

  function saveClients() {
    localStorage.setItem("pharmasoft_clients", JSON.stringify(clients))
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
    clientForm.addEventListener("submit", handleAddClient)
    updateClientForm.addEventListener("submit", handleUpdateClient)

    // Search functionality
    searchInput.addEventListener("input", handleSearch)
  }

  function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase()
    filteredClients = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.identification.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm),
    )
    renderClients()
  }

  function handleAddClient(e) {
    e.preventDefault()

    const newClient = {
      id: Math.max(...clients.map((c) => c.id), 0) + 1,
      name: document.getElementById("clientName").value,
      identification: document.getElementById("clientId").value,
      phone: document.getElementById("clientPhone").value,
      address: document.getElementById("clientAddress").value,
      email: document.getElementById("clientEmail").value,
    }

    clients.push(newClient)
    saveClients()
    filteredClients = [...clients]
    renderClients()

    modal.style.display = "none"
    clientForm.reset()
    alert("Cliente agregado exitosamente")
  }

  function handleUpdateClient(e) {
    e.preventDefault()

    const index = Number.parseInt(document.getElementById("updateClientIndex").value)
    const client = clients[index]

    client.name = document.getElementById("updateClientName").value
    client.identification = document.getElementById("updateClientId").value
    client.phone = document.getElementById("updateClientPhone").value
    client.address = document.getElementById("updateClientAddress").value
    client.email = document.getElementById("updateClientEmail").value

    saveClients()
    filteredClients = [...clients]
    renderClients()

    updateModal.style.display = "none"
    alert("Cliente actualizado exitosamente")
  }

  function renderClients() {
    clientsTableBody.innerHTML = ""

    filteredClients.forEach((client, index) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${client.identification}</td>
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${client.email}</td>
                <td>
                    <button class="update-btn" data-index="${index}">
                        <i class="fa-solid fa-file-pen"></i>
                    </button>
                    <button class="delete-btn" data-index="${index}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `

      // Add event listeners
      const updateBtn = row.querySelector(".update-btn")
      const deleteBtn = row.querySelector(".delete-btn")

      updateBtn.addEventListener("click", () => {
        openUpdateModal(client, clients.indexOf(client))
      })

      deleteBtn.addEventListener("click", () => {
        if (confirm("¿Está seguro de eliminar este cliente?")) {
          deleteClient(clients.indexOf(client))
        }
      })

      clientsTableBody.appendChild(row)
    })
  }

  function openUpdateModal(client, index) {
    document.getElementById("updateClientIndex").value = index
    document.getElementById("updateClientName").value = client.name
    document.getElementById("updateClientId").value = client.identification
    document.getElementById("updateClientPhone").value = client.phone
    document.getElementById("updateClientAddress").value = client.address
    document.getElementById("updateClientEmail").value = client.email

    updateModal.style.display = "block"
  }

  function deleteClient(index) {
    clients.splice(index, 1)
    saveClients()
    filteredClients = [...clients]
    renderClients()
    alert("Cliente eliminado exitosamente")
  }
})
