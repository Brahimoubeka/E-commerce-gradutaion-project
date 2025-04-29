async function loadOrders() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();
        const container = document.getElementById('orders-container');
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order');
            orderDiv.innerHTML = `
        <p>Order ID: ${order.id}</p>
        <p>Product ID: ${order.product_id}</p>
        <p>Quantity: ${order.quantity}</p>
        <p>Order Date: ${new Date(order.order_date).toLocaleString()}</p>
        <p>Status: ${order.status}</p>
        <hr>
      `;
            container.appendChild(orderDiv);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
