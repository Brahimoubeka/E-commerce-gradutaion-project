// Declare productId globally
let productId;


// Helper function to get query parameters from the URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.slice(1);
    queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

async function loadProductDetail() {
    const params = getQueryParams();
    productId = params.id; // This sets the global variable

    if (!productId) {
        document.getElementById('product-detail-container').innerHTML = '<p>No product ID provided.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found.');
        }
        const product = await response.json();

        // Declare the container within the function scope
        const container = document.getElementById('product-detail-container');
        container.innerHTML = ''; // Clear previous content

        // Create an element for the product image
        const img = document.createElement('img');
        img.src = product.imagePath ? product.imagePath : 'images/default-product.jpg';
        img.alt = product.name;
        img.classList.add('product-detail-img'); // Add this line
        container.appendChild(img);


        // Create an element for the product name
        const name = document.createElement('h1');
        name.textContent = product.name;
        container.appendChild(name);

        // Create an element for the product price
        const price = document.createElement('p');
        price.textContent = `Price: TL${product.price}`;
        container.appendChild(price);

        // Create an element for the product description
        const description = document.createElement('p');
        description.textContent = product.description;
        container.appendChild(description);

        // Create an "Add to Cart" button
        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.addEventListener('click', () => {
            console.log("Add to Cart button clicked.");
            // Retrieve the existing cart from localStorage, or start with an empty array
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log("Current cart before adding:", cart);

            // Check if the product is already in the cart
            const existingProduct = cart.find(item => item.id === product.id);
            if (existingProduct) {
                // Increase the quantity if it already exists
                existingProduct.quantity += 1;
                console.log(`Increased quantity for product id ${product.id}`);
            } else {
                // Add the product with quantity 1 if it's not in the cart
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
                console.log(`Added new product with id ${product.id} to cart.`);
            }

            // Save the updated cart back to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            console.log("Cart after adding:", cart);
            alert('Product added to cart!');
            
        });
        container.appendChild(addToCartButton);


        // Load reviews after product details are loaded
        loadReviews(productId);


    } catch (error) {
        console.error('Error loading product details:', error);
        document.getElementById('product-detail-container').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


// Function to load reviews for the product
async function loadReviews(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        const reviews = await response.json();
        const reviewsContainer = document.getElementById('reviews-container');
        reviewsContainer.innerHTML = '';

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
        } else {
            reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review');
                reviewDiv.innerHTML = `
          <p><strong>${review.userName}</strong> rated: ${review.rating}/5</p>
          <p>${review.comment}</p>
          <p><small>${new Date(review.created_at).toLocaleString()}</small></p>
        `;
                reviewsContainer.appendChild(reviewDiv);
            });
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Call loadReviews with the current productId
loadReviews(productId);

// Handle the review form submission
document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to leave a review.');
        return;
    }
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                rating,
                comment
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add review.');
        }
        document.getElementById('review-message').innerHTML = `<p>${result.message}</p>`;
        document.getElementById('review-form').reset();
        loadReviews(productId); // Reload reviews after successful submission
    } catch (error) {
        console.error('Error submitting review:', error);
        document.getElementById('review-message').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});


// Load product details when the page finishes loading
document.addEventListener('DOMContentLoaded', loadProductDetail);