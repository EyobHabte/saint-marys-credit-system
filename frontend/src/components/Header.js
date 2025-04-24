import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';
import { FaBars, FaEnvelope, FaBell, FaUser, FaShareAlt } from 'react-icons/fa';

const Header = () => {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHeaderData = async () => {
            try {
                const [messagesResponse, notificationsResponse] = await Promise.all([
                    axios.get('/api/header/messages/'), // Adjusted endpoint
                    axios.get('/api/header/notifications/'), // Adjusted endpoint
                ]);
                setUnreadMessages(messagesResponse.data.unread_count);
                setNotifications(notificationsResponse.data.unread_count);
            } catch (error) {
                console.error('Error fetching header data:', error);
            }
        };

        fetchHeaderData();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="header">
            <div className="header-left">
                <FaBars className="menu-icon" onClick={() => handleNavigation('/menu')} />
            </div>
            <div className="header-right">
                <div className="icon-container" onClick={() => handleNavigation('/messages')}>
                    <FaEnvelope className="icon" />
                    <span className="badge red">{unreadMessages}</span>
                    <span className="icon-caption">Messages</span>
                </div>
                <div className="icon-container" onClick={() => handleNavigation('/notifications')}>
                    <FaBell className="icon" />
                    <span className="badge red">{notifications}</span>
                    <span className="icon-caption">Notifications</span>
                </div>
                <div className="icon-container" onClick={() => handleNavigation('/profile')}>
                    <FaUser className="icon" />
                    <span className="icon-caption">Profile</span>
                </div>
                <div className="icon-container" onClick={() => handleNavigation('/share')}>
                    <FaShareAlt className="icon" />
                    <span className="icon-caption">Share</span>
                </div>
            </div>
        </div>
    );
};

export default Header;
