import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Check admin authentication
  if (!window.auth || !window.auth.requireRole("admin")) return

  const menuItems = document.querySelectorAll(".menu-item[data-section]")
  const contentSections = document.querySelectorAll(".content-section")
  const addEmployeeBtn = document.getElementById("addEmployeeBtn")
  const employeeModal = document.getElementById("employeeModal")
  const closeEmployeeModal = document.getElementById("closeEmployeeModal")
  const employeeForm = document.getElementById("employeeForm")

  // Initialize charts
  initializeCharts()
  setupEventListeners()

  function setupEventListeners() {
    // Menu navigation
    menuItems.forEach((item) => {
      item.addEventListener("click", function () {
        const section = this.dataset.section
        showSection(section)

        // Update active menu item
        menuItems.forEach((mi) => mi.classList.remove("active"))
        this.classList.add("active")
      })
    })

    // Employee modal
    if (addEmployeeBtn) {
      addEmployeeBtn.addEventListener("click", () => {
        employeeModal.style.display = "block"
      })
    }

    if (closeEmployeeModal) {
      closeEmployeeModal.addEventListener("click", () => {
        employeeModal.style.display = "none"
      })
    }

    // Close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target === employeeModal) {
        employeeModal.style.display = "none"
      }
    })

    // Employee form
    if (employeeForm) {
      employeeForm.addEventListener("submit", handleAddEmployee)
    }
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

  function handleAddEmployee(e) {
    e.preventDefault()

    const newEmployee = {
      name: document.getElementById("employeeName").value,
      username: document.getElementById("employeeUsername").value,
      email: document.getElementById("employeeEmail").value,
      phone: document.getElementById("employeePhone").value,
      role: document.getElementById("employeeRole").value,
      password: document.getElementById("employeePassword").value,
      hireDate: new Date().toLocaleDateString(),
    }

    // Add to users array (in a real app, this would be sent to a server)
    window.auth.users.push({
      id: window.auth.users.length + 1,
      username: newEmployee.username,
      password: newEmployee.password,
      role: newEmployee.role,
      name: newEmployee.name,
      email: newEmployee.email,
    })

    // Add to employees table
    addEmployeeToTable(newEmployee)

    employeeModal.style.display = "none"
    employeeForm.reset()
    alert("Empleado agregado exitosamente")
  }

  function addEmployeeToTable(employee) {
    const tableBody = document.getElementById("employeesTableBody")
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.username}</td>
            <td>${employee.role}</td>
            <td>${employee.email}</td>
            <td>${employee.hireDate}</td>
            <td>
                <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
            </td>
        `

    tableBody.appendChild(row)
  }

  function initializeCharts() {
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
  }
})
