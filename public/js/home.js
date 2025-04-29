document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/products/latest');
        if (!response.ok) {
            throw new Error('Failed to fetch latest products');
        }
        const latestProducts = await response.json();
        const container = document.getElementById('latest-products-container');
        container.innerHTML = ''; // Clear any existing content

        latestProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('latest-product');

            // Create product image element
            const img = document.createElement('img');
            img.src = product.imagePath ? product.imagePath : 'images/default-product.jpg';
            img.alt = product.name;
            img.width = 100; // Adjust width as needed
            productDiv.appendChild(img);

            // Create product name element
            const name = document.createElement('h3');
            name.textContent = product.name;
            productDiv.appendChild(name);

            // Create product price element
            const price = document.createElement('p');
            price.textContent = `Price: $${product.price}`;
            productDiv.appendChild(price);

            // Create a button to view details
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'View Details';
            detailsButton.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            });
            productDiv.appendChild(detailsButton);

            container.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error loading latest products:', error);
    }
});
