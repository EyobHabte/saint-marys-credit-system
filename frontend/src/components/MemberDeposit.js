// src/components/MemberDeposit.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MemberDeposit.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MemberDeposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Retrieve the current member's ID from localStorage.
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        // Call the deposit list endpoint.
        const response = await axios.get('http://localhost:8000/api/deposits/list/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        // Filter deposits to include only those for the logged-in member.
        const myDeposits = response.data.filter(
          deposit => String(deposit.member) === String(userId)
        );
        setDeposits(myDeposits);
      } catch (err) {
        console.error("Error fetching deposits:", err.response || err.message);
        setError("Failed to fetch deposits.");
        toast.error("Failed to fetch deposits.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDeposits();
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [userId]);

  return (
    <div className="member-deposit-page">
      <h2>Your Deposit Records</h2>
      {loading ? (
        <p className="loading-message">Loading deposits...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : deposits.length > 0 ? (
        <div className="table-wrapper">
          <table className="deposits-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Deposit Amount (ETB)</th>
                <th>Date</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(deposit => (
                <tr key={deposit.id}>
                  <td>{deposit.id}</td>
                  <td>{deposit.deposit_amount}</td>
                  <td>{new Date(deposit.deposit_date).toLocaleDateString()}</td>
                  <td>{deposit.remark || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-records">No deposit records found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default MemberDeposit;
