// src/components/MemberSidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaHandHoldingUsd, 
  FaMoneyCheckAlt, 
  FaHistory, 
  FaChartBar, 
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';
import '../styles/MemberSidebar.css';

const MemberSidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const handleNavigation = (path, menu) => {
    setActiveMenu(menu);
    navigate(path);
  };

  return (
    <div className="member-sidebar">
      <div className="sidebar-header">
        <h2>Member Portal</h2>
      </div>
      <ul className="menu-list">
        <li 
          className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/dashboard', 'dashboard')}
        >
          <FaTachometerAlt className="menu-icon" />
          <span className="menu-text">Dashboard</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'loan' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/loan', 'loan')}
        >
          <FaHandHoldingUsd className="menu-icon" />
          <span className="menu-text">Loan</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'deposit' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/deposit', 'deposit')}
        >
          <FaMoneyCheckAlt className="menu-icon" />
          <span className="menu-text">Deposit</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'withdraw' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/withdraw', 'withdraw')}
        >
          <FaMoneyCheckAlt className="menu-icon" />
          <span className="menu-text">Withdraw</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'transactions' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/transactions', 'transactions')}
        >
          <FaHistory className="menu-icon" />
          <span className="menu-text">Transactions</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'report' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/report', 'report')}
        >
          <FaChartBar className="menu-icon" />
          <span className="menu-text">Reports</span>
        </li>
        <li 
          className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('/member/profile', 'profile')}
        >
          <FaUser className="menu-icon" />
          <span className="menu-text">Profile</span>
        </li>
        <li 
          className="menu-item"
          onClick={() => handleNavigation('/logout', 'logout')}
        >
          <FaSignOutAlt className="menu-icon" />
          <span className="menu-text">Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default MemberSidebar;
