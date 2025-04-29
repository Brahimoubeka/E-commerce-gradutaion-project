document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const message_text = document.getElementById('message_text').value.trim();
    if (!message_text) {
        alert('Please enter your message.');
        return;
    }
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message_text })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to send message.');
        }
        document.getElementById('contact-message').innerHTML = `<p>${result.message}</p>`;
        document.getElementById('contact-form').reset();
    } catch (error) {
        document.getElementById('contact-message').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
