document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Retrieve shipping details from the form
    const shippingName = document.getElementById('shippingName').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    if (!shippingName || !shippingAddress) {
        alert('Please fill in both shipping name and address.');
        return;
    }

    // Retrieve the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    // Prepare the order data
    const orderData = {
        shippingName,
        shippingAddress,
        items: cart
    };

    // Retrieve the JWT token (assuming it was saved in localStorage upon login)
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include the token if available (for authentication)
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to process order.');
        }

        // Clear the cart after successful order placement
        localStorage.removeItem('cart');

        document.getElementById('checkout-message').innerHTML =
            '<p>Thank you! Your order has been placed successfully.</p>';
    } catch (error) {
        console.error('Error processing checkout:', error);
        document.getElementById('checkout-message').innerHTML =
            `<p>Error: ${error.message}</p>`;
    }
});
