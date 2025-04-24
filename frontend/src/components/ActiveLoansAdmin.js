// src/components/ActiveLoansAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ActiveLoansAdmin.module.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ActiveLoansAdmin = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch all approved loans with an outstanding balance greater than zero.
  const fetchActiveLoans = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/loans/requests/');
      const activeLoans = response.data.filter(loan =>
        loan.status === 'approved' && parseFloat(loan.outstanding_balance) > 0
      );
      setLoans(activeLoans);
    } catch (error) {
      toast.error("Failed to fetch active loans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  // Navigate to the new active loan details page.
  const handleViewDetails = (loanId) => {
    navigate(`/admin/active-loan-details/${loanId}`);
  };

  // Process a partial repayment for a given loan.
  const handleProcessRepayment = async (loan) => {
    const outstanding = parseFloat(loan.outstanding_balance);
    const monthlyInstallment = parseFloat(loan.total_payment) / parseFloat(loan.loan_term);

    const input = window.prompt(
      `Enter repayment amount for Loan ID ${loan.id} (Outstanding: ${outstanding.toFixed(2)} ETB):`,
      monthlyInstallment.toFixed(2)
    );
    if (input === null) return; // Cancelled
    const partialAmount = parseFloat(input);
    if (isNaN(partialAmount) || partialAmount <= 0) {
      toast.error("Invalid repayment amount entered.");
      return;
    }
    if (partialAmount > outstanding) {
      toast.error("Repayment amount exceeds outstanding balance.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8000/api/loans/${loan.id}/repayments/submit/`,
        { amount_paid: partialAmount, remark: 'Partial repayment processed by admin' },
        { 
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      toast.success(`Processed repayment for Loan ID ${loan.id}`);
      fetchActiveLoans();
    } catch (error) {
      console.error("Repayment error:", error.response || error.message);
      toast.error("Failed to process repayment.");
    }
  };

  if (loading) return <p>Loading active loans...</p>;
  if (loans.length === 0) return <p>No active loans found.</p>;

  return (
    <div className={styles.adminLoansContainer}>
      <h2>Active Loans</h2>
      <table className={styles.loansTable}>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Member</th>
            <th>Total Payment (ETB)</th>
            <th>Total Repaid (ETB)</th>
            <th>Outstanding (ETB)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.first_name} {loan.last_name}</td>
              <td>{loan.total_payment}</td>
              <td>{loan.total_repaid}</td>
              <td>{loan.outstanding_balance}</td>
              <td>
                <button onClick={() => handleViewDetails(loan.id)}>View Details</button>
                <button onClick={() => handleProcessRepayment(loan)}>Process Repayment</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default ActiveLoansAdmin;
