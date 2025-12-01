// Socket.IO event handlers for real-time messaging
const connectedUsers = new Map(); // userId -> socketId mapping

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // User authentication and registration
        socket.on('authenticate', (userId) => {
            if (userId) {
                connectedUsers.set(userId, socket.id);
                socket.userId = userId;
                console.log(`User ${userId} authenticated on socket ${socket.id}`);

                // Broadcast online status to all clients
                io.emit('user_online', { userId });
            }
        });

        // Handle incoming messages
        socket.on('send_message', (data) => {
            const { recipientId, senderId, content, timestamp } = data;

            // Find recipient's socket
            const recipientSocketId = connectedUsers.get(recipientId);

            if (recipientSocketId) {
                // Send message to recipient
                io.to(recipientSocketId).emit('receive_message', {
                    senderId,
                    recipientId,
                    content,
                    timestamp,
                    id: data.id
                });
            }

            // Send confirmation back to sender
            socket.emit('message_sent', {
                recipientId,
                timestamp,
                delivered: !!recipientSocketId
            });
        });

        // Typing indicator
        socket.on('typing_start', (data) => {
            const { recipientId, senderId } = data;
            const recipientSocketId = connectedUsers.get(recipientId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', { userId: senderId });
            }
        });

        socket.on('typing_stop', (data) => {
            const { recipientId, senderId } = data;
            const recipientSocketId = connectedUsers.get(recipientId);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_stopped_typing', { userId: senderId });
            }
        });

        // Mark message as read
        socket.on('mark_read', (data) => {
            const { messageId, senderId } = data;
            const senderSocketId = connectedUsers.get(senderId);

            if (senderSocketId) {
                io.to(senderSocketId).emit('message_read', { messageId });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);

            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                // Broadcast offline status
                io.emit('user_offline', { userId: socket.userId });
            }
        });
    });

    // Return connected users count for monitoring
    setInterval(() => {
        console.log(`Connected users: ${connectedUsers.size}`);
    }, 60000); // Log every minute
}

export function getConnectedUsers() {
    return connectedUsers;
}
