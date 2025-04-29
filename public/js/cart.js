// Function to load and display the cart items
function loadCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-container');
    container.innerHTML = ''; // Clear previous content

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    // Display each product in the cart
    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>Price: TL${item.price}</p>
      <p>Quantity: ${item.quantity}</p>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
        container.appendChild(itemDiv);
    });

    // Calculate and display the total price
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<h3>Total: TL${total.toFixed(2)}</h3>`;
    container.appendChild(totalDiv);
}

// Function to remove an item from the cart by its index
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCounter();
}

// Event listener for the checkout button
document.getElementById('checkout-button').addEventListener('click', () => {
    // Redirect to the checkout page (to be implemented next)
    window.location.href = 'checkout.html';
});

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', loadCart);
