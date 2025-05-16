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
setupModal('modal-clients', 'add-button-clients', 'close-clients');
setupModal('modal-products', 'add-button-products', 'close-products-register');

// Seleccionamos el modal y el botón de cerrar
const updateModal = document.getElementById('modal-products-update');
const closeUpdateBtn = document.getElementById('close-products-update');

// Abrimos el modal al hacer clic en cualquier botón "Update"
document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        updateModal.style.display = 'block';
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

    document.querySelector('.total-value').textContent = `$${totalAmount.toLocaleString()}`;
});

// Delegación de eventos para eliminar producto
document.querySelector('.invoice-table tbody').addEventListener('click', (event) => {
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
        document.querySelector('.total-value').textContent = `$${totalAmount.toLocaleString()}`;
    }
});
