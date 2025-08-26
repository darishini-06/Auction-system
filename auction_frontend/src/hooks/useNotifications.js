// src/hooks/useNotifications.js
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const useNotifications = () => {
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        // Only connect if the user is logged in
        if (!token) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const ws = new WebSocket(`${wsProtocol}${window.location.host}/ws/notifications/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                toast.info(data.message); // Display the toast notification!
            }
        };

        ws.onclose = () => {
            console.log('Notification WebSocket disconnected');
        };

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }, []); // Empty dependency array means this runs once on app load
};

export default useNotifications;