
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
const shippingCost = 150; // Costo de envío fijo

// Elementos del DOM
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeModal = document.getElementById('close-modal');
const cartItems = document.getElementById('cart-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartShipping = document.getElementById('cart-shipping');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const ordersList = document.getElementById('orders-list');
const phoneNumber = document.getElementById('phone-number');
const footerPhone = document.getElementById('footer-phone');
const facebookLink = document.getElementById('facebook-link');
const exportBtn = document.getElementById('export-orders');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    displayOrders();
    setupEventListeners();
    updateContactInfo();
});

// Configurar event listeners
function setupEventListeners() {
    // Carrito
    cartIcon.addEventListener('click', openCartModal);
    closeModal.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', checkout);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    // Botones "Añadir al carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCartFromButton);
    });
    
    // Tabs del panel de administración
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', switchTab);
    });
    
    // Exportar pedidos
    exportBtn.addEventListener('click', exportOrders);
}

// Funciones del carrito
function addToCartFromButton() {
    const product = {
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price),
        image: this.dataset.image,
        quantity: 1
    };
    
    addToCart(product);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }
    
    updateCart();
    saveCart();
    
    // Mostrar notificación
    showNotification(`${product.name} añadido al carrito`);
}

function updateCart() {
    // Actualizar contador
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar modal del carrito
    cartItems.innerHTML = '';
    let subtotal = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
        cartSubtotal.textContent = '$0.00';
        cartShipping.textContent = '$0.00';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="text" class="quantity" value="${item.quantity}" readonly>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
    });
    
    // Calcular totales
    const shipping = subtotal > 2000 ? 0 : shippingCost; // Envío gratis para compras mayores a $2000
    const total = subtotal + shipping;
    
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Agregar eventos a los botones de cantidad
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
}

function decreaseQuantity() {
    const productId = this.dataset.id;
    const item = cart.find(item => item.id === productId);
    
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCart();
    saveCart();
}

function increaseQuantity() {
    const productId = this.dataset.id;
    const item = cart.find(item => item.id === productId);
    item.quantity += 1;
    
    updateCart();
    saveCart();
}

function removeItem() {
    const productId = this.dataset.id;
    cart = cart.filter(item => item.id !== productId);
    
    updateCart();
    saveCart();
    
    // Mostrar notificación
    showNotification('Producto eliminado del carrito');
}

function openCartModal() {
    cartModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }
    
    // Calcular total
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : shippingCost;
    const total = subtotal + shipping;
    
    // Crear formulario de pago (simulado)
    const paymentForm = `
        <div id="checkout-form">
            <h3>Información del Cliente</h3>
            <div class="form-group">
                <label for="customer-name">Nombre Completo</label>
                <input type="text" id="customer-name" required>
            </div>
            <div class="form-group">
                <label for="customer-email">Correo Electrónico</label>
                <input type="email" id="customer-email" required>
            </div>
            <div class="form-group">
                <label for="customer-phone">Teléfono</label>
                <input type="tel" id="customer-phone" required>
            </div>
            <div class="form-group">
                <label for="customer-address">Dirección</label>
                <textarea id="customer-address" required></textarea>
            </div>
            
            <h3>Resumen del Pedido</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Envío:</span>
                <span>${shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            
            <button id="confirm-order" class="checkout-btn">Confirmar Pedido</button>
        </div>
    `;
    
    // Reemplazar contenido del modal
    document.querySelector('.cart-body').innerHTML = paymentForm;
    
    // Configurar evento para confirmar pedido
    document.getElementById('confirm-order').addEventListener('click', confirmOrder);
}

function confirmOrder() {
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerAddress = document.getElementById('customer-address').value;
    
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Calcular total
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : shippingCost;
    const total = subtotal + shipping;
    
    // Crear nuevo pedido
    const newOrder = {
        id: Date.now(),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: [...cart],
        date: new Date().toLocaleDateString('es-MX'),
        status: 'pending',
        subtotal,
        shipping,
        total
    };
    
    orders.push(newOrder);
    saveOrders();
    displayOrders();
    
    // Vaciar carrito
    cart = [];
    updateCart();
    saveCart();
    
    // Mostrar mensaje de confirmación
    document.querySelector('.cart-body').innerHTML = `
        <div class="order-confirmation">
            <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--success); margin-bottom: 1rem;"></i>
            <h3>¡Pedido Confirmado!</h3>
            <p>Gracias por tu compra, ${customerName}. Hemos recibido tu pedido #${newOrder.id}.</p>
            <p>Nos pondremos en contacto contigo pronto para confirmar los detalles.</p>
            <button id="close-after-checkout" class="btn" style="margin-top: 2rem;">Cerrar</button>
        </div>
    `;
    
    document.getElementById('close-after-checkout').addEventListener('click', closeCartModal);
}

// Funciones del panel de administración
function displayOrders() {
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay pedidos registrados</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const orderElement = document.createElement('tr');
        const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        orderElement.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customerName}</td>
            <td>${itemsCount} producto(s)</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${order.date}</td>
            <td><span class="order-status status-${order.status}">${order.status === 'pending' ? 'Pendiente' : 'Completado'}</span></td>
            <td>
                <button class="action-btn view-btn" data-id="${order.id}">Ver</button>
                <button class="action-btn delete-btn" data-id="${order.id}">Eliminar</button>
            </td>
        `;
        
        ordersList.appendChild(orderElement);
    });
    
    // Configurar eventos para los botones
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', viewOrderDetails);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteOrder);
    });
}

function viewOrderDetails() {
    const orderId = this.dataset.id;
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    const itemsList = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}" width="50">
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    
    const modalContent = `
        <div class="order-details">
            <h3>Detalles del Pedido #${order.id}</h3>
            
            <div class="details-section">
                <h4>Información del Cliente</h4>
                <p><strong>Nombre:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
                <p><strong>Dirección:</strong> ${order.customerAddress}</p>
            </div>
            
            <div class="details-section">
                <h4>Productos</h4>
                ${itemsList}
            </div>
            
            <div class="details-section">
                <h4>Total</h4>
                <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
                <p><strong>Envío:</strong> $${order.shipping.toFixed(2)}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            
            <div class="details-section">
                <h4>Estado</h4>
                <select id="order-status" class="status-select" data-id="${order.id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
                </select>
            </div>
            
            <button id="close-details" class="btn">Cerrar</button>
        </div>
    `;
    
    // Crear modal para detalles
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal-overlay';
    detailsModal.id = 'details-modal';
    detailsModal.innerHTML = `
        <div class="cart-modal" style="max-width: 700px;">
            <div class="cart-header">
                <h3 class="cart-title">Detalles del Pedido</h3>
                <span class="close-modal" id="close-details-modal">&times;</span>
            </div>
            <div class="cart-body">
                ${modalContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(detailsModal);
    detailsModal.style.display = 'flex';
    
    // Configurar eventos
    document.getElementById('close-details-modal').addEventListener('click', () => {
        detailsModal.remove();
    });
    
    document.getElementById('close-details')?.addEventListener('click', () => {
        detailsModal.remove();
    });
    
    // Cambiar estado del pedido
    document.getElementById('order-status')?.addEventListener('change', function() {
        const orderId = this.dataset.id;
        const newStatus = this.value;
        
        const order = orders.find(o => o.id == orderId);
        if (order) {
            order.status = newStatus;
            saveOrders();
            displayOrders();
        }
    });
}

function deleteOrder() {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        const orderId = this.dataset.id;
        orders = orders.filter(o => o.id != orderId);
        saveOrders();
        displayOrders();
        showNotification('Pedido eliminado');
    }
}

function switchTab() {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    this.classList.add('active');
    // Aquí puedes agregar lógica para cambiar entre tabs si es necesario
}

function exportOrders() {
    if (orders.length === 0) {
        showNotification('No hay pedidos para exportar', 'error');
        return;
    }
    
    // Convertir a CSV
    let csv = 'ID,Cliente,Email,Teléfono,Productos,Total,Fecha,Estado\n';
    
    orders.forEach(order => {
        const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);
        csv += `"${order.id}","${order.customerName}","${order.customerEmail}","${order.customerPhone}","${itemsCount} producto(s)","$${order.total.toFixed(2)}","${order.date}","${order.status === 'pending' ? 'Pendiente' : 'Completado'}"\n`;
    });
    
    // Crear archivo y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedidos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Pedidos exportados correctamente');
}

// Funciones de utilidad
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function updateContactInfo() {
    phoneNumber.textContent = "+502 50174461";
    footerPhone.textContent = "+502 50174461";
    facebookLink.href = "#";
}

// Almacenamiento local
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}