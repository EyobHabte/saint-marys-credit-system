// src/components/ActiveLoanDetailView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import styles from '../styles/ActiveLoanDetailView.module.css';
import 'react-toastify/dist/ReactToastify.css';

const ActiveLoanDetailView = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/loans/requests/${loanId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoan(response.data);
      } catch (error) {
        toast.error("Failed to fetch loan details.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoanDetails();
  }, [loanId, token]);

  if (loading) return <p>Loading loan details...</p>;
  if (!loan) return <p>No loan details found.</p>;

  return (
    <div className={styles.activeLoanDetailContainer}>
      <h2>Loan Details</h2>
      <div className={styles.detailItem}>
        <strong>Loan ID:</strong> {loan.id}
      </div>
      <div className={styles.detailItem}>
        <strong>Member:</strong> {loan.first_name} {loan.last_name}
      </div>
      <div className={styles.detailItem}>
        <strong>Email:</strong> {loan.email}
      </div>
      <div className={styles.detailItem}>
        <strong>Phone Number:</strong> {loan.phone_number}
      </div>
      <div className={styles.detailItem}>
        <strong>Loan Amount:</strong> {loan.loan_amount} ETB
      </div>
      <div className={styles.detailItem}>
        <strong>Loan Term:</strong> {loan.loan_term} months
      </div>
      <div className={styles.detailItem}>
        <strong>Interest Rate:</strong> {loan.interest_rate} % per month
      </div>
      <div className={styles.detailItem}>
        <strong>Interest Amount:</strong> {loan.interest_amount} ETB
      </div>
      <div className={styles.detailItem}>
        <strong>Total Payment:</strong> {loan.total_payment} ETB
      </div>
      <div className={styles.detailItem}>
        <strong>Total Repaid:</strong> {loan.total_repaid} ETB
      </div>
      <div className={styles.detailItem}>
        <strong>Outstanding Balance:</strong> {loan.outstanding_balance} ETB
      </div>
      <div className={styles.detailItem}>
        <strong>Status:</strong> {loan.status}
      </div>
      <div className={styles.detailItem}>
        <strong>Requested At:</strong> {new Date(loan.created_at).toLocaleString()}
      </div>
      <button onClick={() => navigate(-1)} className={styles.backButton}>Back</button>
      <ToastContainer />
    </div>
  );
};

export default ActiveLoanDetailView;
