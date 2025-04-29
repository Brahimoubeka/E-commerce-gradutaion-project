// Function to decode a JWT token payload
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return null;
    }
}

// Function to update the cart counter by reading localStorage
function updateCartCounter() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.textContent = `(${totalCount})`;
    }
}

function updateHeader() {
    const token = localStorage.getItem('token');
    const userActionsContainer = document.querySelector('.user-actions');

    if (token) {
        const userData = parseJwt(token);
        userActionsContainer.innerHTML = '';

        // Greeting
        if (userData && userData.email) {
            const userInfo = document.createElement('span');
            userInfo.textContent = `Hello, ${userData.email}`;
            userActionsContainer.appendChild(userInfo);
        }

        // MyCart link with cart counter
        const cartLink = document.createElement('a');
        cartLink.href = 'cart.html';
        cartLink.innerHTML = 'MyCart <span id="cart-counter">(0)</span>';
        cartLink.style.marginLeft = '10px';
        userActionsContainer.appendChild(cartLink);

        // Orders link: 
        // - For admin: "Orders" linking to admin-orders.html
        // - For regular user: "My Orders" linking to orders.html
        const ordersLink = document.createElement('a');
        if (userData && userData.role && userData.role === 'admin') {
            ordersLink.href = 'admin-orders.html';
            ordersLink.textContent = 'Orders';
        } else {
            ordersLink.href = 'orders.html';
            ordersLink.textContent = 'My Orders';
        }
        ordersLink.style.marginLeft = '10px';
        userActionsContainer.appendChild(ordersLink);

        // Logout link
        const logoutLink = document.createElement('a');
        logoutLink.href = 'logout.html';
        logoutLink.textContent = 'Logout';
        logoutLink.style.marginLeft = '10px';
        userActionsContainer.appendChild(logoutLink);

        // For admins, add Admin Dashboard link (optional)
        if (userData && userData.role && userData.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin-products.html';
            adminLink.textContent = 'Admin Dashboard';
            adminLink.style.marginLeft = '10px';
            userActionsContainer.appendChild(adminLink);
        }
    } else {
        // When not logged in, show Login/Register and MyCart links
        userActionsContainer.innerHTML = `
      <a href="login.html">Login/Register</a>
      <a href="cart.html" style="margin-left:10px;">MyCart <span id="cart-counter">(0)</span></a>
    `;
    }

    updateCartCounter();
}

// Run updateHeader on page load
document.addEventListener('DOMContentLoaded', updateHeader);
