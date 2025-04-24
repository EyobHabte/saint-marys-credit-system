// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaBell, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [messagesResponse, notificationsResponse] = await Promise.all([
                    axios.get('/api/header/messages/'),
                    axios.get('/api/header/notifications/'),
                ]);
                setUnreadMessages(messagesResponse.data.unread_count || 0);
                setNotifications(notificationsResponse.data.unread_count || 0);
            } catch (error) {
                console.error('Error fetching header data:', error);
            }
        };
        fetchCounts();
    }, []);

    return (
        <header className="header">
            <div className="logo">SMU-CSMS</div>
            <nav>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/members">Members</Link>
                <Link to="/loans">Loans</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/reports">Reports</Link>
            </nav>
            <div className="user-actions">
                <button title="Messages">
                    <FaEnvelope /> {unreadMessages > 0 && <span>{unreadMessages}</span>}
                </button>
                <button title="Notifications">
                    <FaBell /> {notifications > 0 && <span>{notifications}</span>}
                </button>
                <Link to="/profile" title="Profile">
                    <FaUserCircle />
                </Link>
            </div>
        </header>
    );
};

export default Header;