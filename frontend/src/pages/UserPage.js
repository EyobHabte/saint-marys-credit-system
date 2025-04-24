import React, { useState } from 'react';
import UserHeader from '../components/MemberHeader';
import UserSidebar from '../components/MemberSidebar';
import UserDashboard from '../components/UserDashboard';
import Loan from '../components/MemberLoan';
import Deposit from '../components/MemberDeposit';
import Withdraw from '../components/MemberWithdraw';
import TransactionHistory from '../components/MemberTransactions';
import Reports from '../components/MemberReport';
import Profile from '../components/Profile';
import '../styles/UserPage.css';

const UserPage = () => {
    const [activeComponent, setActiveComponent] = useState('dashboard');

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return <UserDashboard />;
            case 'loan':
                return <Loan />;
            case 'deposit':
                return <Deposit />;
            case 'withdraw':
                return <Withdraw />;
            case 'transactionHistory':
                return <TransactionHistory />;
            case 'reports':
                return <Reports />;
            case 'profile':
                return <Profile />;
            default:
                return <UserDashboard />;
        }
    };

    return (
        <div className="user-page-container">
            <UserHeader />
            <div className="main-container">
                <UserSidebar onShowComponent={setActiveComponent} />
                <div className="content-container">
                    {renderActiveComponent()}
                </div>
            </div>
        </div>
    );
};

export default UserPage;