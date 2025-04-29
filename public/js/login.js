document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Login failed.');
        }
        // Save the token in localStorage for use in protected endpoints (e.g., checkout)
        localStorage.setItem('token', result.token);
        document.getElementById('login-message').innerHTML = `<p>Login successful!</p>`;
        // Optionally, redirect to home page or another page after a successful login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        document.getElementById('login-message').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
