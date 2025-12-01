import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import Notes from '../components/Notes';
import Settings from '../components/Settings';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('conversations');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            // Update conversations list
            setConversations(prev => {
                const existingConvIndex = prev.findIndex(c => c.user_id === data.senderId);

                if (existingConvIndex >= 0) {
                    // Update existing conversation
                    const newConvs = [...prev];
                    const conv = newConvs[existingConvIndex];

                    newConvs[existingConvIndex] = {
                        ...conv,
                        last_message: data.content,
                        last_message_time: data.timestamp,
                        unread_count: conv.unread_count + 1
                    };

                    // Move to top
                    newConvs.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
                    return newConvs;
                } else {
                    // Fetch new conversation details if not found (simplified for now)
                    // Ideally we'd fetch the user details here
                    loadData(); // Reload all data as fallback
                    return prev;
                }
            });
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket]);

    const loadData = async () => {
        try {
            const [usersRes, convsRes] = await Promise.all([
                axios.get(`${API_URL}/users/all`),
                axios.get(`${API_URL}/messages/conversations/list`)
            ]);

            setUsers(usersRes.data.users);
            setConversations(convsRes.data.conversations);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/users/search?query=${query}`);
            setSearchResults(response.data.users);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const startChat = (userId) => {
        navigate(`/chat/${userId}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="container flex justify-center align-center" style={{ minHeight: '100vh' }}>
                <h2>LOADING DASHBOARD<span className="loading">_</span></h2>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>COGWORKS</h1>
                            <p>&gt; LOGGED IN AS: {user?.username}</p>
                        </div>
                        <button onClick={handleLogout} className="btn-logout">
                            [ LOGOUT ]
                        </button>
                    </div>
                </div>
            </header>

            <main className="container">
                <div className="dashboard-tabs">
                    <button
                        className={`tab ${activeTab === 'conversations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('conversations')}
                    >
                        [ CONVERSATIONS ]
                    </button>
                    <button
                        className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        [ NOTES ]
                    </button>
                    <button
                        className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        [ SETTINGS ]
                    </button>
                </div>

                {activeTab === 'conversations' && (
                    <div className="dashboard-grid">
                        {/* Search Section */}
                        <section className="panel">
                            <h2>&gt; FIND USERS</h2>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Search by username or email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="user-list">
                                    {searchResults.map((u) => (
                                        <div key={u.id} className="user-item" onClick={() => startChat(u.id)}>
                                            <div>
                                                <div className="username">
                                                    &gt; {u.username}
                                                    {onlineUsers.has(u.id) && <span className="online-indicator"> [ONLINE]</span>}
                                                </div>
                                                <div className="email">{u.email}</div>
                                            </div>
                                            <button className="btn-chat">CHAT</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Conversations Section */}
                        <section className="panel">
                            <h2>&gt; RECENT CONVERSATIONS</h2>
                            {conversations.length === 0 ? (
                                <p className="empty-state">&gt; NO CONVERSATIONS YET. START CHATTING!</p>
                            ) : (
                                <div className="conversation-list">
                                    {conversations.map((conv) => (
                                        <div
                                            key={conv.user_id}
                                            className="conversation-item"
                                            onClick={() => startChat(conv.user_id)}
                                        >
                                            <div className="conv-info">
                                                <div className="username">
                                                    &gt; {conv.username}
                                                    {onlineUsers.has(conv.user_id) && <span className="online-indicator"> [ONLINE]</span>}
                                                </div>
                                                <div className="last-message">{conv.last_message}</div>
                                            </div>
                                            <div className="conv-meta">
                                                {conv.unread_count > 0 && (
                                                    <span className="unread-badge">{conv.unread_count}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* All Users Section */}
                        <section className="panel">
                            <h2>&gt; ALL USERS ({users.length})</h2>
                            <div className="user-list">
                                {users.map((u) => (
                                    <div key={u.id} className="user-item" onClick={() => startChat(u.id)}>
                                        <div>
                                            <div className="username">
                                                &gt; {u.username}
                                                {onlineUsers.has(u.id) && <span className="online-indicator"> [ONLINE]</span>}
                                            </div>
                                            <div className="email">{u.email}</div>
                                        </div>
                                        <button className="btn-chat">CHAT</button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="tab-content">
                        <Notes />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="tab-content">
                        <Settings />
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
