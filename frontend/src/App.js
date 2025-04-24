// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Wrapper
import ProtectedRoute from './components/ProtectedRoute';

// Admin Imports
import AdminPage from './pages/AdminPage';
import Dashboard from './components/Dashboard';
import MemberRequest from './components/MemberRequests';
import MemberRequestDetails from './components/MemberRequestDetails';
import AddMember from './components/AddMember';
import { UpdateMemberList, UpdateMemberForm } from './components/UpdateMember';
import DeleteMember from './components/DeleteMember';
import MembersList from './components/MembersList';
import ViewAccount from './components/ViewAccount';
import CreateAccount from './components/CreateAccount';
import UpdateAccount from './components/UpdateAccount';
import UpdateAccountList from './components/UpdateAccountList';
import DeleteAccount from './components/DeleteAccount';
import ManageWithdrawals from './components/ManageWithdrawals';
import LoanRequests from './components/LoanRequests';
import LoanRequestDetails from './components/LoanRequestDetails';
import ActiveLoanDetailView from './components/ActiveLoanDetailView';
import ActiveLoansAdmin from './components/ActiveLoansAdmin';
import AddDeposit from './components/AddDeposit';
import MemberDepositList from './components/MemberDepositList';
import AddDepositForm from './components/AddDepositForm';
import ViewDeposits from './components/ViewDeposits';
// Import unified Admin Detail Report page.
import AdminDetailReport from './components/AdminDetailReport';

// Member Imports
import MemberPage from './pages/MemberPage';
import MemberDashboard from './components/MemberDashboard';
import MemberLoanPage from './components/MemberLoanPage';
import MemberDeposit from './components/MemberDeposit';
import MemberWithdraw from './components/MemberWithdraw';
import MemberTransactions from './components/MemberTransactions';
import MemberReport from './components/MemberReport';
import MemberProfile from './components/MemberProfile';

// Shared Components
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Share from './components/Share';
import NotFound from './components/NotFound';

// Bootstrap CSS/JS
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes (nested under /admin) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'finance_officer']}>
                <AdminPage />
              </ProtectedRoute>
            }
          >
            {/* Dashboard routes */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Manage Members */}
            <Route path="member-requests" element={<MemberRequest />} />
            <Route path="member-requests/:id" element={<MemberRequestDetails />} />
            <Route path="add-member" element={<AddMember />} />
            <Route path="update-member" element={<UpdateMemberList />} />
            <Route path="update-member/:id" element={<UpdateMemberForm />} />
            <Route path="delete-member" element={<DeleteMember />} />
            <Route path="members-list" element={<MembersList />} />

            {/* Manage Accounts */}
            <Route path="accounts/list" element={<ViewAccount />} />
            <Route path="accounts/create" element={<CreateAccount />} />
            <Route path="accounts/update" element={<UpdateAccountList />} />
            <Route path="update-account/:id" element={<UpdateAccount />} />
            <Route path="accounts/delete" element={<DeleteAccount />} />

            {/* Manage Loans */}
            <Route path="loan-requests" element={<LoanRequests />} />
            <Route path="loan-requests/:id" element={<LoanRequestDetails />} />
            <Route path="manage-loans" element={<ActiveLoansAdmin />} />
            <Route path="active-loan-details/:loanId" element={<ActiveLoanDetailView />} />

            {/* Manage Deposits */}
            <Route path="add-deposit" element={<AddDeposit />} />
            <Route path="members-deposit-list" element={<MemberDepositList />} />
            <Route path="add-deposit/:memberId" element={<AddDepositForm />} />
            <Route path="view-deposits" element={<ViewDeposits />} />

            {/* Manage Withdrawals */}
            <Route path="manage-withdraws" element={<ManageWithdrawals />} />

            {/* Reports */}
            <Route path="reports/member" element={<MemberReport />} />
            <Route path="reports/detail" element={<AdminDetailReport />} />

            {/* Mailbox */}
            <Route path="mailbox" element={<div>Mailbox Page</div>} />
          </Route>

          {/* Protected Member Routes */}
          <Route
            path="/member/*"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<MemberDashboard />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="loan" element={<MemberLoanPage />} />
            <Route path="deposit" element={<MemberDeposit />} />
            <Route path="withdraw" element={<MemberWithdraw />} />
            <Route path="transactions" element={<MemberTransactions />} />
            <Route path="report" element={<MemberReport />} />
            <Route path="profile" element={<MemberProfile />} />
          </Route>

          {/* Shared Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={['admin', 'finance_officer', 'member']}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'finance_officer', 'member']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'finance_officer', 'member']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share"
            element={
              <ProtectedRoute allowedRoles={['admin', 'finance_officer', 'member']}>
                <Share />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
