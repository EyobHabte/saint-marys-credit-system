// src/components/ManageWithdrawals.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ManageWithdrawals.css';

const ManageWithdrawals = () => {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch all withdrawal requests (for admin)
  const fetchWithdrawRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/withdraws/list/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the API returns an array of withdrawal objects.
      setWithdrawRequests(response.data);
    } catch (err) {
      console.error("Error fetching withdrawal requests:", err.response || err.message);
      setError("Failed to fetch withdrawal requests.");
      toast.error("Failed to fetch withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWithdrawRequests();
    }
  }, [token]);

  // Handlers to approve/reject a withdrawal request
  const handleApprove = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/withdraws/${id}/approve/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Withdrawal request approved!");
      fetchWithdrawRequests();
    } catch (err) {
      console.error("Error approving withdrawal request:", err.response || err.message);
      toast.error("Failed to approve withdrawal request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/withdraws/${id}/reject/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Withdrawal request rejected!");
      fetchWithdrawRequests();
    } catch (err) {
      console.error("Error rejecting withdrawal request:", err.response || err.message);
      toast.error("Failed to reject withdrawal request.");
    }
  };

  return (
    <div className="manage-withdrawals-container">
      <h2>Manage Withdrawals</h2>
      {loading ? (
        <p>Loading withdrawal requests...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : withdrawRequests.length === 0 ? (
        <p>No withdrawal requests found.</p>
      ) : (
        <table className="withdrawals-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member Name</th>
              <th>Withdrawal Amount (ETB)</th>
              <th>Bank Account</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>
                  {req.member_detail
                    ? `${req.member_detail.first_name} ${req.member_detail.last_name}`
                    : "N/A"}
                </td>
                <td>{req.withdraw_amount}</td>
                <td>{req.bank_account}</td>
                <td>{new Date(req.withdraw_date).toLocaleString()}</td>
                <td>{req.status}</td>
                <td>
                  {req.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(req.id)}>Approve</button>
                      <button onClick={() => handleReject(req.id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
};

export default ManageWithdrawals;
