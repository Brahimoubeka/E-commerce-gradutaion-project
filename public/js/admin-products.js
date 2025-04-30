// admin-products.js
// Uses Base64‐in‐JSON for image uploads (no Multer, no disk/storage issues)

async function fileToDataURL(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });
}

async function loadProducts() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    let products;
    try { products = JSON.parse(text); }
    catch (e) { console.error('Invalid JSON from products:', text); return; }

    if (!res.ok) {
        console.error('Error loading products:', products.error || text);
        return;
    }

    const container = document.getElementById('products-container');
    container.innerHTML = '';
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
      <p><strong>${p.name}</strong></p>
      <p>Price: TL${p.price}</p>
      <p>Stock: ${p.stock}</p>
      <img src="${p.imagePath || 'images/default-product.jpg'}" width="100" alt="">
      <button onclick="deleteProduct(${p.id})">Delete</button>
      <button onclick="showUpdateForm(${p.id})">Update</button>
      <div id="update-form-${p.id}" style="display:none;"></div>
    `;
        container.appendChild(div);
    });
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { }
    if (!res.ok) alert(data?.error || text);
    else { alert(data.message); loadProducts(); }
}

function showUpdateForm(id) {
    const token = localStorage.getItem('token');
    fetch(`/api/products/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(prod => {
            const container = document.getElementById(`update-form-${id}`);
            container.style.display = 'block';
            container.innerHTML = `
        <form id="update-form-${id}-form">
          <label>Name:</label>
          <input type="text" name="name" value="${prod.name}" required><br>
          <label>Description:</label>
          <textarea name="description">${prod.description}</textarea><br>
          <label>Price:</label>
          <input type="number" name="price" value="${prod.price}" step="0.01" required><br>
          <label>Stock:</label>
          <input type="number" name="stock" value="${prod.stock}" required><br>
          <label>Image:</label>
          <input type="file" id="update-image-${id}" accept="image/*"><br>
          <button type="submit">Update</button>
        </form>
        <div id="update-message-${id}"></div>
      `;

            document
                .getElementById(`update-form-${id}-form`)
                .addEventListener('submit', async e => {
                    e.preventDefault();
                    const form = e.target;
                    const fileInput = document.getElementById(`update-image-${id}`);
                    let imageData = prod.imagePath; // keep existing
                    if (fileInput.files[0]) {
                        imageData = await fileToDataURL(fileInput.files[0]);
                    }
                    const body = {
                        name: form.name.value,
                        description: form.description.value,
                        price: parseFloat(form.price.value),
                        stock: parseInt(form.stock.value, 10),
                        imagePath: imageData
                    };
                    const res2 = await fetch(`/api/admin/products/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(body)
                    });
                    const txt2 = await res2.text();
                    let dat2; try { dat2 = JSON.parse(txt2); } catch { }
                    const msgDiv = document.getElementById(`update-message-${id}`);
                    if (!res2.ok) msgDiv.textContent = dat2?.error || txt2;
                    else {
                        msgDiv.textContent = dat2.message;
                        loadProducts();
                    }
                });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Add‐product form
    document.getElementById('add-product-form')
        .addEventListener('submit', async e => {
            e.preventDefault();
            const form = e.target;
            const token = localStorage.getItem('token');
            const file = document.getElementById('image').files[0];
            let imageData = null;
            if (file) imageData = await fileToDataURL(file);

            const body = {
                name: form.name.value,
                description: form.description.value,
                price: parseFloat(form.price.value),
                stock: parseInt(form.stock.value, 10),
                imagePath: imageData
            };
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const txt = await res.text();
            let dat; try { dat = JSON.parse(txt); } catch { }
            const msg = document.getElementById('add-product-message');
            if (!res.ok) msg.textContent = dat?.error || txt;
            else {
                msg.textContent = dat.message;
                form.reset();
                loadProducts();
            }
        });

    loadProducts();
});


// Load products when the page is ready
document.addEventListener('DOMContentLoaded', loadProducts);















//// Function to load all products for the admin dashboard
//async function loadProducts() {
//    const token = localStorage.getItem('token');
//    try {
//        const response = await fetch('/api/admin/products', {
//            headers: {
//                'Authorization': `Bearer ${token}`
//            }
//        });
//        const products = await response.json();
//        const container = document.getElementById('products-container');
//        container.innerHTML = '';
//        products.forEach(product => {
//            const productDiv = document.createElement('div');
//            productDiv.classList.add('product');
//            productDiv.innerHTML = `
//        <p><strong>${product.name}</strong></p>
//        <p>Price: TL${product.price}</p>
//        <p>Stock: ${product.stock}</p>
//        <img src="${product.imagePath ? product.imagePath : 'images/default-product.jpg'}" alt="${product.name}" width="100">
//        <br>
//        <button onclick="deleteProduct(${product.id})">Delete</button>
//        <button onclick="showUpdateForm(${product.id})">Update</button>
//        <div id="update-form-${product.id}" style="display: none;"></div>
//      `;
//            container.appendChild(productDiv);
//        });
//    } catch (error) {
//        console.error('Error loading products:', error);
//    }
//}

//// Function to delete a product
//async function deleteProduct(productId) {
//    const token = localStorage.getItem('token');
//    if (!confirm('Are you sure you want to delete this product?')) return;
//    try {
//        const response = await fetch(`/api/admin/products/${productId}`, {
//            method: 'DELETE',
//            headers: {
//                'Authorization': `Bearer ${token}`
//            }
//        });
//        const result = await response.json();
//        alert(result.message);
//        loadProducts();
//    } catch (error) {
//        console.error('Error deleting product:', error);
//    }
//}

//// Function to show an update form for a product
//function showUpdateForm(productId) {
//    const container = document.getElementById(`update-form-${productId}`);
//    container.innerHTML = `
//    <form id="update-form-${productId}-form">
//      <label>Name:</label>
//      <input type="text" name="name" required>
//      <br>
//      <label>Description:</label>
//      <textarea name="description"></textarea>
//      <br>
//      <label>Price:</label>
//      <input type="number" name="price" required>
//      <br>
//      <label>Stock:</label>
//      <input type="number" name="stock" required>
//      <br>
//      <label>Image:</label>
//      <input type="file" name="image" accept="image/*">
//      <br>
//      <button type="submit">Update</button>
//    </form>
//    <div id="update-message-${productId}"></div>
//  `;
//    container.style.display = 'block';

//    document.getElementById(`update-form-${productId}-form`).addEventListener('submit', async (e) => {
//        e.preventDefault();
//        const token = localStorage.getItem('token');
//        const form = e.target;
//        const formData = new FormData(form);
//        try {
//            const response = await fetch(`/api/admin/products/${productId}`, {
//                method: 'PUT',
//                headers: {
//                    'Authorization': `Bearer ${token}`
//                },
//                body: formData
//            });
//            const result = await response.json();
//            document.getElementById(`update-message-${productId}`).innerHTML = `<p>${result.message}</p>`;
//            loadProducts();
//        } catch (error) {
//            console.error('Error updating product:', error);
//        }
//    });
//}

//// Handle add product form submission
//document.getElementById('add-product-form').addEventListener('submit', async (e) => {
//    e.preventDefault();
//    const token = localStorage.getItem('token');
//    const form = e.target;
//    const formData = new FormData(form);
//    try {
//        const response = await fetch('/api/admin/products', {
//            method: 'POST',
//            headers: {
//                'Authorization': `Bearer ${token}`
//            },
//            body: formData
//        });
//        const result = await response.json();
//        document.getElementById('add-product-message').innerHTML = `<p>${result.message}</p>`;
//        form.reset();
//        loadProducts();
//    } catch (error) {
//        console.error('Error adding product:', error);
//    }
//});

//// Load products when the page loads
//document.addEventListener('DOMContentLoaded', loadProducts);
