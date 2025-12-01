import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import './Chat.css';

function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load recipient info and message history
    useEffect(() => {
        loadChatData();
    }, [userId]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            if (data.senderId === parseInt(userId)) {
                setMessages((prev) => [...prev, {
                    id: data.id,
                    sender_id: data.senderId,
                    recipient_id: data.recipientId,
                    content: data.content,
                    timestamp: data.timestamp,
                    read_status: false
                }]);
                scrollToBottom();

                // Mark as read immediately if we are in this chat
                socket.emit('mark_read', {
                    messageId: data.id,
                    senderId: data.senderId
                });
            }
        };

        const handleTyping = (data) => {
            if (data.userId === parseInt(userId)) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.userId === parseInt(userId)) {
                setIsTyping(false);
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('user_typing', handleTyping);
        socket.on('user_stopped_typing', handleStopTyping);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('user_typing', handleTyping);
            socket.off('user_stopped_typing', handleStopTyping);
        };
    }, [socket, userId]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatData = async () => {
        try {
            // Load recipient info
            const usersRes = await axios.get(`${API_URL}/users/all`);
            const recipientUser = usersRes.data.users.find(u => u.id === parseInt(userId));
            setRecipient(recipientUser);

            // Load message history
            const messagesRes = await axios.get(`${API_URL}/messages/${userId}`);
            setMessages(messagesRes.data.messages);
        } catch (error) {
            console.error('Error loading chat data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            // Save message to database
            const response = await axios.post(`${API_URL}/messages`, {
                recipientId: parseInt(userId),
                content: messageContent
            });

            const savedMessage = response.data.data;

            // Add to local state
            setMessages((prev) => [...prev, savedMessage]);

            // Send via socket for real-time delivery
            socket.emit('send_message', {
                id: savedMessage.id,
                recipientId: parseInt(userId),
                senderId: user.id,
                content: messageContent,
                timestamp: savedMessage.timestamp
            });

            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = () => {
        if (!socket) return;

        socket.emit('typing_start', {
            recipientId: parseInt(userId),
            senderId: user.id
        });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing_stop', {
                recipientId: parseInt(userId),
                senderId: user.id
            });
        }, 1000);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    if (loading) {
        return (
            <div className="container flex justify-center align-center" style={{ minHeight: '100vh' }}>
                <h2>LOADING CHAT<span className="loading">_</span></h2>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button onClick={() => navigate('/dashboard')} className="btn-back">
                    &lt; BACK
                </button>
                <div className="chat-title">
                    <h2>&gt; CHAT WITH: {recipient?.username || 'Unknown User'}</h2>
                </div>
            </header>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>&gt; NO MESSAGES YET. START THE CONVERSATION!</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    <div className="message-text">{msg.content}</div>
                                    <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {isTyping && (
                    <div className="typing-indicator">
                        &gt; {recipient?.username} is typing<span className="loading">_</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="message-input"
                    autoFocus
                />
                <button type="submit" disabled={!newMessage.trim()} className="btn-send">
                    [ SEND ]
                </button>
            </form>
        </div>
    );
}

export default Chat;
