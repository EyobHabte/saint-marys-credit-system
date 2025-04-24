// src/components/LoanRequestDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/LoanRequestDetails.css';

const LoanRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchLoanDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/loans/requests/${id}/`);
      setLoan(response.data);
    } catch (err) {
      console.error("Error fetching loan details:", err.response || err.message);
      setError("Failed to fetch loan details.");
      toast.error("Failed to fetch loan details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/loans/requests/${id}/approve/`);
      toast.success("Loan request approved!");
      setTimeout(() => navigate('/admin/loan-requests'), 2000);
    } catch (err) {
      console.error("Error approving loan request:", err.response || err.message);
      toast.error("Failed to approve loan request.");
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/loans/requests/${id}/reject/`, {
        reason: rejectReason,
      });
      toast.success("Loan request rejected!");
      setTimeout(() => navigate('/admin/loan-requests'), 2000);
    } catch (err) {
      console.error("Error rejecting loan request:", err.response || err.message);
      toast.error("Failed to reject loan request.");
    }
  };

  return (
    <div id="loanRequestDetailsContainer" className="loan-request-details-container">
      <h2>Loan Request Details</h2>
      {loading ? (
        <p>Loading loan details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : loan ? (
        <div className="loan-details-card">
          <p><strong>Loan ID:</strong> {loan.id}</p>
          <p><strong>Member:</strong> {loan.first_name} {loan.last_name}</p>
          <p><strong>Email:</strong> {loan.email}</p>
          <p><strong>Phone Number:</strong> {loan.phone_number}</p>
          <p><strong>Loan Amount:</strong> {loan.loan_amount} ETB</p>
          <p><strong>Loan Term:</strong> {loan.loan_term} months</p>
          <p><strong>Interest Rate:</strong> {loan.interest_rate}% per month</p>
          <p><strong>Interest Amount:</strong> {loan.interest_amount} ETB</p>
          <p><strong>Total Payment:</strong> {loan.total_payment} ETB</p>
          <p><strong>Status:</strong> {loan.status}</p>
          <p><strong>Requested At:</strong> {new Date(loan.created_at).toLocaleString()}</p>
          <div className="loan-actions">
            <button className="approve-btn" onClick={handleApprove}>Approve</button>
            <button className="reject-btn" onClick={() => setShowRejectInput(true)}>Reject</button>
          </div>
          {showRejectInput && (
            <div className="reject-section">
              <textarea
                placeholder="Enter rejection reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
              <button className="reject-submit-btn" onClick={handleReject}>Submit Rejection</button>
            </div>
          )}
        </div>
      ) : (
        <p>No loan details found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default LoanRequestDetails;
