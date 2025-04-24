// src/components/LoanRequests.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/LoanRequests.css';

const LoanRequests = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchLoanRequests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/loans/requests/');
      // Assuming the response data is an array of loan request objects.
      setLoanRequests(response.data);
    } catch (err) {
      console.error("Error fetching loan requests:", err.response || err.message);
      setError("Failed to fetch loan requests.");
      toast.error("Failed to fetch loan requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanRequests();
  }, []);

  const handleViewDetails = (id) => {
    // Navigate to the detail view using the new URL pattern
    navigate(`/admin/loan-requests/${id}`);
  };

  return (
    <div id="loanRequestsContainer" className="loan-requests-container">
      <h2>Loan Requests</h2>
      {loading ? (
        <p>Loading loan requests...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : loanRequests.length === 0 ? (
        <p>No loan requests found.</p>
      ) : (
        <table className="loan-requests-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Member Name</th>
              <th>Loan Amount</th>
              <th>Loan Term</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loanRequests.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.first_name} {loan.last_name}</td>
                <td>{loan.loan_amount} ETB</td>
                <td>{loan.loan_term} months</td>
                <td>{new Date(loan.created_at).toLocaleString()}</td>
                <td>{loan.status}</td>
                <td>
                  <button onClick={() => handleViewDetails(loan.id)}>
                    View Details
                  </button>
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

export default LoanRequests;
