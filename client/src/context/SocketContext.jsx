import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        let newSocket;

        if (user) {
            newSocket = io(SOCKET_URL);

            newSocket.on('connect', () => {
                console.log('Socket connected');
                newSocket.emit('authenticate', user.id);
            });

            newSocket.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.add(userId);
                    return newSet;
                });
            });

            newSocket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
