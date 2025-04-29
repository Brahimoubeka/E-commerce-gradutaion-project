// Function to load all products for the admin dashboard
async function loadProducts() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const products = await response.json();
        const container = document.getElementById('products-container');
        container.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
        <p><strong>${product.name}</strong></p>
        <p>Price: TL${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <img src="${product.imagePath ? product.imagePath : 'images/default-product.jpg'}" alt="${product.name}" width="100">
        <br>
        <button onclick="deleteProduct(${product.id})">Delete</button>
        <button onclick="showUpdateForm(${product.id})">Update</button>
        <div id="update-form-${product.id}" style="display: none;"></div>
      `;
            container.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Function to delete a product
async function deleteProduct(productId) {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        alert(result.message);
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Function to show an update form for a product
function showUpdateForm(productId) {
    const container = document.getElementById(`update-form-${productId}`);
    container.innerHTML = `
    <form id="update-form-${productId}-form">
      <label>Name:</label>
      <input type="text" name="name" required>
      <br>
      <label>Description:</label>
      <textarea name="description"></textarea>
      <br>
      <label>Price:</label>
      <input type="number" name="price" required>
      <br>
      <label>Stock:</label>
      <input type="number" name="stock" required>
      <br>
      <label>Image:</label>
      <input type="file" name="image" accept="image/*">
      <br>
      <button type="submit">Update</button>
    </form>
    <div id="update-message-${productId}"></div>
  `;
    container.style.display = 'block';

    document.getElementById(`update-form-${productId}-form`).addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const form = e.target;
        const formData = new FormData(form);
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await response.json();
            document.getElementById(`update-message-${productId}`).innerHTML = `<p>${result.message}</p>`;
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    });
}

// Handle add product form submission
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const form = e.target;
    const formData = new FormData(form);
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const result = await response.json();
        document.getElementById('add-product-message').innerHTML = `<p>${result.message}</p>`;
        form.reset();
        loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
    }
});

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts);
