// src/Dashboard/Dashboard.jsx
import React from 'react';
import '../styles/AdminDashboard.css';
import ClientDetails from './ClientDetails';
import AccountOverview from './AccountOverview';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
    return (
      <div className="dashboard">
        <h1 className="dashboard-title">Dashboard Admin</h1>
        {/* Client Details Section */}
        <ClientDetails />
        {/* Account Overview Section */}
        <AccountOverview />
        {/* Recent Transactions Section */}
        <RecentTransactions />
      </div>
    );
  };

export default Dashboard;
