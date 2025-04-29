let allProducts = []; // Global variable to store fetched products

// Function to render products (filtered or all)
function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Clear container
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        // Create product image element
        const img = document.createElement('img');
        img.src = product.imagePath ? product.imagePath : 'images/default-product.jpg';
        img.alt = product.name;
        productDiv.appendChild(img);

        // Create product name element
        const name = document.createElement('h2');
        name.textContent = product.name;
        productDiv.appendChild(name);

        // Create product price element
        const price = document.createElement('p');
        price.textContent = `Price: TL${product.price}`;
        productDiv.appendChild(price);

        // Create a button to view more details
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'View Details';
        detailsButton.addEventListener('click', () => {
            window.location.href = `product-detail.html?id=${product.id}`;
        });
        productDiv.appendChild(detailsButton);

        container.appendChild(productDiv);
    });
}

// Function to load products from the API and initialize search
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        allProducts = await response.json(); // Store products globally
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add event listener for search functionality
document.getElementById('search-bar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allProducts.filter(product => {
        return product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query));
    });
    renderProducts(filtered);
});

// Call the function to load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts);
