// src/components/MemberHeader.jsx
import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaBell, FaUserCircle } from 'react-icons/fa';
import '../styles/MemberHeader.css';

const MemberHeader = () => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);

  // Simulate fetching counts (replace with your API calls as needed)
  useEffect(() => {
    // For demonstration purposes, using static numbers.
    setUnreadMessages(3);
    setNotifications(5);
  }, []);

  return (
    <header className="member-header">
      <div className="header-left">
        <h1>Member Portal</h1>
      </div>
      <div className="header-right">
        <div className="icon-container">
          <FaEnvelope className="header-icon" />
          {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
        </div>
        <div className="icon-container">
          <FaBell className="header-icon" />
          {notifications > 0 && <span className="badge">{notifications}</span>}
        </div>
        <div className="icon-container">
          <FaUserCircle className="header-icon" />
          
        </div>
      </div>
    </header>
  );
};

export default MemberHeader;
