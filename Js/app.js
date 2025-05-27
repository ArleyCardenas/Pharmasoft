// Script para productos con stock bajo
function checkLowStock() {
    const rows = document.querySelectorAll('.product-table tbody tr');
    
    rows.forEach(row => {
        const quantityCell = row.querySelector('td:nth-child(2)');
        if (!quantityCell) return;
        
        const quantity = parseInt(quantityCell.textContent);
        if (quantity <=5) {
            row.classList.add('low-stock');
        }
    });
}

// Función de configuración de modales (existente en el archivo original)
function setupModal(modalId, openButtonId, closeButtonId) {
    const modal = document.getElementById(modalId);
    const openButton = document.getElementById(openButtonId);
    const closeButton = document.getElementById(closeButtonId);

    // Si alguno no existe, salimos sin hacer nada
    if (!modal || !openButton || !closeButton) {
        console.warn(`No se encontró alguno de los elementos del modal: ${modalId}`);
        return;
    }

    // Abrir modal
    openButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Cerrar con botón "X"
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar modales (existente)
    setupModal('modal-clients', 'add-button-clients', 'close-clients');
    setupModal('modal-products', 'add-button-products', 'close-products-register');

    // Verificar productos con stock bajo
    checkLowStock();
});

// Seleccionamos el modal y el botón de cerrar
const updateModal = document.getElementById('modal-products-update');
const closeUpdateBtn = document.getElementById('close-products-update');

// Abrimos el modal al hacer clic en cualquier botón "Update"
document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        updateModal.style.display = 'block';
        
        // Obtener los datos de la fila para rellenar el formulario de actualización
        const row = btn.closest('tr');
        if (row) {
            const nombre = row.cells[0].textContent;
            const cantidad = row.cells[1].textContent;
            const precio = row.cells[2].textContent.replace('$', '').trim();
            const fecha = row.cells[3].textContent;
            
            // Poblar los campos del formulario
            document.getElementById('producto').value = nombre;
            document.getElementById('cantidad').value = cantidad;
            document.getElementById('precio').value = precio.replace('.', '');
            
            // Intentar convertir la fecha del formato DD/MM/YYYY a YYYY-MM-DD para el input date
            if (fecha) {
                const partesFecha = fecha.split('/');
                if (partesFecha.length === 3) {
                    const fechaISO = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
                    document.getElementById('fechaVencimiento').value = fechaISO;
                }
            }
        }
    });
});

// Cerramos el modal con la X
if (closeUpdateBtn) {
    closeUpdateBtn.addEventListener('click', () => {
        updateModal.style.display = 'none';
    });
}

// Cerrar si se hace clic fuera del modal
window.addEventListener('click', (event) => {
    if (event.target === updateModal) {
        updateModal.style.display = 'none';
    }
});


// Manejo especial para los botones de actualización de clientes
const updateClientModal = document.getElementById('modal-clients-update');
const closeUpdateClientBtn = document.getElementById('close-clients-update');

if (updateClientModal && closeUpdateClientBtn) {
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateClientModal.style.display = 'block';
        });
    });

    closeUpdateClientBtn.addEventListener('click', () => {
        updateClientModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === updateClientModal) {
            updateClientModal.style.display = 'none';
        }
    });
}

// manejo de los productos en la tabla de ventas
// Agregar producto a la factura
document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        alert('Producto agregado a la factura!');
        const productCard = event.target.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const quantity = productCard.querySelector('.quantity').textContent;

        let products = JSON.parse(localStorage.getItem('facturaProducts')) || [];

        const existingProductIndex = products.findIndex(product => product.name === productName);
        if (existingProductIndex !== -1) {
            products[existingProductIndex].quantity += parseInt(quantity);
        } else {
            products.push({
                name: productName,
                price: parseFloat(productPrice.replace('$', '').replace('.', '')),
                quantity: parseInt(quantity)
            });
        }

        localStorage.setItem('facturaProducts', JSON.stringify(products));
        location.reload(); // Recarga para mostrar el nuevo producto en la tabla
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const products = JSON.parse(localStorage.getItem('facturaProducts')) || [];
    const tableBody = document.querySelector('.invoice-table tbody');
    
    if (!tableBody) return; // Salir si no estamos en la página de factura
    
    let totalAmount = 0;

    products.forEach(product => {
        const row = document.createElement('tr');
        const totalPrice = product.quantity * product.price;

        row.innerHTML = `
            <td>${product.quantity}</td>
            <td>${product.name}</td>
            <td>$${product.price.toLocaleString()}</td>
            <td>$${totalPrice.toLocaleString()}</td>
            <td>
                <button class="delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        totalAmount += totalPrice;
    });

    const totalValueElement = document.querySelector('.total-value');
    if (totalValueElement) {
        totalValueElement.textContent = `$${totalAmount.toLocaleString()}`;
    }
});

// Delegación de eventos para eliminar producto
const invoiceTable = document.querySelector('.invoice-table tbody');
if (invoiceTable) {
    invoiceTable.addEventListener('click', (event) => {
        if (event.target.closest('.delete-btn')) {
            const row = event.target.closest('tr');
            const productName = row.querySelector('td:nth-child(2)').textContent;

            let products = JSON.parse(localStorage.getItem('facturaProducts')) || [];
            products = products.filter(product => product.name !== productName);
            localStorage.setItem('facturaProducts', JSON.stringify(products));

            row.remove();

            // Recalcular total
            let totalAmount = 0;
            products.forEach(product => {
                totalAmount += product.quantity * product.price;
            });
            
            const totalValueElement = document.querySelector('.total-value');
            if (totalValueElement) {
                totalValueElement.textContent = `$${totalAmount.toLocaleString()}`;
            }
        }
    });
}
