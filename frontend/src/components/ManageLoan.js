// src/components/ManageLoan.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ManageLoan.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageLoan = () => {
  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetch active loan (using the loan status endpoint)
  const fetchLoan = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/loans/requests/${id}/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });      
      if (response.data && Object.keys(response.data).length > 0) {
        setLoan(response.data);
        fetchRepayments(response.data.id);
      }
    } catch (error) {
      toast.error("Failed to fetch active loan.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch repayments for a specific loan
  const fetchRepayments = async (loanId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/loans/${loanId}/repayments/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setRepayments(response.data);
    } catch (error) {
      toast.error("Failed to fetch repayments.");
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchLoan();
    } else {
      setLoading(false);
      toast.error("User not authenticated.");
    }
  }, [userId, token]);

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    if (!loan) return;
    try {
      await axios.post(
        `http://localhost:8000/api/loans/${loan.id}/repayments/submit/`,
        { amount_paid: repaymentAmount, remark },
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      toast.success("Repayment submitted successfully!");
      setRepaymentAmount('');
      setRemark('');
      // Refresh repayments and loan info after submission
      fetchLoan();
    } catch (error) {
      toast.error("Failed to submit repayment.");
    }
  };

  const handleReset = () => {
    setRepaymentAmount('');
    setRemark('');
  };

  if (loading) return <p>Loading loan information...</p>;
  if (!loan) return <p>You do not have any active loan at the moment.</p>;

  return (
    <div className={styles.manageLoanContainer}>
      <h2>Active Loan Details</h2>
      <div className={styles.loanDetails}>
        <p><strong>Loan ID:</strong> {loan.id}</p>
        <p><strong>Loan Amount:</strong> {loan.loan_amount} ETB</p>
        <p><strong>Total Payment:</strong> {loan.total_payment} ETB</p>
        <p><strong>Total Repaid:</strong> {loan.total_repaid} ETB</p>
        <p><strong>Outstanding Balance:</strong> {loan.outstanding_balance} ETB</p>
      </div>
      <h3>Repayment History</h3>
      {repayments.length > 0 ? (
        <table className={styles.repaymentTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount Paid (ETB)</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((rep) => (
              <tr key={rep.id}>
                <td>{new Date(rep.repayment_date).toLocaleString()}</td>
                <td>{rep.amount_paid}</td>
                <td>{rep.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No repayments made yet.</p>
      )}
      <h3>Make a Repayment</h3>
      <form onSubmit={handleRepaymentSubmit} className={styles.repaymentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="repaymentAmount">Repayment Amount (ETB):</label>
          <input
            type="number"
            id="repaymentAmount"
            value={repaymentAmount}
            onChange={(e) => setRepaymentAmount(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="remark">Remark (optional):</label>
          <textarea
            id="remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          ></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Submit Repayment</button>
          <button type="button" onClick={handleReset} className={styles.resetButton}>Reset</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ManageLoan;
