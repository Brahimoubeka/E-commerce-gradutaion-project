async function loadAdminOrders() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();
        const container = document.getElementById('admin-orders-container');
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found.</p>';
            return;
        }

        // Group orders by order_group
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_group]) {
                acc[order.order_group] = [];
            }
            acc[order.order_group].push(order);
            return acc;
        }, {});

        // Render each group
        for (const group in groupedOrders) {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('order-group');

            // Display group header with common details (e.g., shipping details)
            const firstOrder = groupedOrders[group][0];
            groupDiv.innerHTML = `
        <h3>Order Group: ${group}</h3>
        <p><strong>User:</strong> ${firstOrder.userName} (${firstOrder.userEmail})</p>
        <p><strong>Phone number:</strong> ${firstOrder.shipping_name}</p>
        <p><strong>Shipping Address:</strong> ${firstOrder.shipping_address}</p>
        <p><strong>Order Date:</strong> ${new Date(firstOrder.order_date).toLocaleString()}</p>
      `;

            // Create a list for the products in this group
            groupedOrders[group].forEach(order => {
                const orderItemDiv = document.createElement('div');
                orderItemDiv.classList.add('order-item');
                orderItemDiv.innerHTML = `
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <hr>
        `;
                groupDiv.appendChild(orderItemDiv);
            });

            container.appendChild(groupDiv);
        }
    } catch (error) {
        console.error('Error loading admin orders:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadAdminOrders);
