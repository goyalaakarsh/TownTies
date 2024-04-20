const socket = io("http://localhost:3001");
const form = document.getElementById("inputform");
const chatArea = document.getElementById('chat-area');

function append(sender, message, position) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', position);
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageDiv);
}

chatMessages.forEach(message => {
    append(data.senderName, data.message, 'left');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('messageInput').value.trim();
    append('You', message, 'right');
    socket.emit('send', { message, sender: '<%= currentUser._id %>', senderName: 'You' });
    console.log('Message sent:', { message, sender: '<%= currentUser._id %>', senderName: 'You' });
    document.getElementById('messageInput').value = '';
});

socket.on('receive', (data) => {
    append(data.senderName, data.message, 'left');
});