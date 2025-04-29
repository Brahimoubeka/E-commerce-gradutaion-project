async function loadMessages() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/admin/messages', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const messages = await response.json();
        const container = document.getElementById('messages-container');
        container.innerHTML = '';
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.innerHTML = `
        <p><strong>From:</strong> ${message.name} (${message.email})</p>
        <p>${message.message_text}</p>
        <p><small>Sent at: ${new Date(message.sent_at).toLocaleString()}</small></p>
        <hr>
      `;
            container.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadMessages);
