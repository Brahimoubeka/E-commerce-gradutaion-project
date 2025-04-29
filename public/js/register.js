document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Registration failed.');
        }
        document.getElementById('register-message').innerHTML = `<p>${result.message}</p>`;
    } catch (error) {
        document.getElementById('register-message').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
