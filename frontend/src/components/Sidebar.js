// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import { 
  FaTachometerAlt, 
  FaMoneyCheckAlt, 
  FaChartLine, 
  FaUserFriends, 
  FaUserCog, 
  FaHandHoldingUsd, 
  FaChevronDown 
} from 'react-icons/fa';

const Sidebar = ({ notificationCount }) => {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isLoansOpen, setIsLoansOpen] = useState(false);
  const [isDepositsOpen, setIsDepositsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isWithdrawalsOpen, setIsWithdrawalsOpen] = useState(false);

  const toggleMembersDropdown = () => setIsMembersOpen(!isMembersOpen);
  const toggleAccountsDropdown = () => setIsAccountsOpen(!isAccountsOpen);
  const toggleLoansDropdown = () => setIsLoansOpen(!isLoansOpen);
  const toggleDepositsDropdown = () => setIsDepositsOpen(!isDepositsOpen);
  const toggleReportsDropdown = () => setIsReportsOpen(!isReportsOpen);
  const toggleWithdrawalsDropdown = () => setIsWithdrawalsOpen(!isWithdrawalsOpen);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>SMU Credit & Savings</h2>
        <span className="status"> 🟢 Online</span>
      </div>
      <input type="text" placeholder="Search..." className="search-bar" />
      <div className="menu">
        <p className="menu-title">Main Navigation</p>
        {/* Dashboard */}
        <div className="menu-item">
          <FaTachometerAlt className="menu-icon" />
          <Link to="/admin/dashboard" className="menu-link">Dashboard</Link>
        </div>
        {/* Manage Members */}
        <div className="menu-item" onClick={toggleMembersDropdown}>
          <FaUserFriends className="menu-icon" />
          Manage Members
          <FaChevronDown className={`dropdown-arrow ${isMembersOpen ? 'open' : ''}`} />
        </div>
        {isMembersOpen && (
          <div className="dropdown">
            <Link to="/admin/add-member" className="dropdown-item">Add Member</Link>
            <Link to="/admin/update-member" className="dropdown-item">Update Member</Link>
            <Link to="/admin/delete-member" className="dropdown-item">Delete Member</Link>
            <Link to="/admin/members-list" className="dropdown-item">Show Members List</Link>
            <Link to="/admin/member-requests" className="dropdown-item">
              Member Requests <span className="alert-badge">{notificationCount}</span>
            </Link>
          </div>
        )}
        {/* Manage Accounts */}
        <div className="menu-item" onClick={toggleAccountsDropdown}>
          <FaUserCog className="menu-icon" />
          Manage Accounts
          <FaChevronDown className={`dropdown-arrow ${isAccountsOpen ? 'open' : ''}`} />
        </div>
        {isAccountsOpen && (
          <div className="dropdown">
            <Link to="/admin/accounts/list" className="dropdown-item">View Accounts</Link>
            <Link to="/admin/accounts/create" className="dropdown-item">Create Account</Link>
            <Link to="/admin/accounts/update" className="dropdown-item">Update Account</Link>
            <Link to="/admin/accounts/delete" className="dropdown-item">Delete Account</Link>
          </div>
        )}
        {/* Manage Loans */}
        <div className="menu-item" onClick={toggleLoansDropdown}>
          <FaHandHoldingUsd className="menu-icon" />
          Manage Loans
          <FaChevronDown className={`dropdown-arrow ${isLoansOpen ? 'open' : ''}`} />
        </div>
        {isLoansOpen && (
          <div className="dropdown">
            <Link to="/admin/loan-requests" className="dropdown-item">Loan Requests</Link>
            <Link to="/admin/manage-loans" className="dropdown-item">Manage Loans</Link>
          </div>
        )}
        {/* Manage Deposits */}
        <div className="menu-item" onClick={toggleDepositsDropdown}>
          <FaMoneyCheckAlt className="menu-icon" />
          Manage Deposits
          <FaChevronDown className={`dropdown-arrow ${isDepositsOpen ? 'open' : ''}`} />
        </div>
        {isDepositsOpen && (
          <div className="dropdown">
            <Link to="/admin/members-deposit-list" className="dropdown-item">Member Deposit List</Link>
            <Link to="/admin/view-deposits" className="dropdown-item">View Deposits</Link>
          </div>
        )}
        {/* Manage Withdrawals */}
        <div className="menu-item" onClick={toggleWithdrawalsDropdown}>
          <FaMoneyCheckAlt className="menu-icon" />
          Manage Withdrawals
          <FaChevronDown className={`dropdown-arrow ${isWithdrawalsOpen ? 'open' : ''}`} />
        </div>
        {isWithdrawalsOpen && (
          <div className="dropdown">
            <Link to="/admin/manage-withdraws" className="dropdown-item">Manage Withdrawals</Link>
          </div>
        )}
        {/* Generate Reports */}
        <div className="menu-item" onClick={toggleReportsDropdown}>
          <FaChartLine className="menu-icon" />
          Generate Reports
          <FaChevronDown className={`dropdown-arrow ${isReportsOpen ? 'open' : ''}`} />
        </div>
        {isReportsOpen && (
          <div className="dropdown">
            <Link to="/admin/reports/detail" className="dropdown-item">Detailed Reports</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
