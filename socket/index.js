const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const Chat = require('./models/chat.js');
const io = socketIO(server); 

io.on('connection', (socket) => {
    console.log('A user connected');

    // Receive chat messages from clients
    socket.on('send', async (data) => {
        console.log('Received chat message:', data);

        // Save the message to your database
        try {
            console.log("hi");
            const newChatMessage = new Chat({
                user: data.sender,
                message: data.message,
                // Add any other necessary fields
            });
            console.log("hi");
            await newChatMessage.save();
            console.log("hi");

            // Broadcast the message to all clients
            socket.broadcast.emit('recieve', data); // You can refine this to only emit to specific rooms or namespaces if needed
        } catch (err) {
            console.error('Error saving chat message:', err);
        }
    });
});