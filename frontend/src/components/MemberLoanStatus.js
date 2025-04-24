// src/components/MemberLoanStatus.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/MemberLoanStatus.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MemberLoanStatus = () => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLoanStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/loans/status/${userId}/`);
        if (response.data && Object.keys(response.data).length > 0) {
          setLoan(response.data);
        } else {
          setLoan(null);
        }
      } catch (err) {
        setError("Failed to fetch loan status.");
        toast.error("Failed to fetch loan status.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLoanStatus();
    } else {
      // If no userId is available, stop loading and notify the user.
      setLoading(false);
      setError("No user ID found. Please log in to view your loan status.");
    }
  }, [userId]);

  if (loading) return <p>Loading loan status...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.memberLoanStatus}>
      {loan ? (
        <div className={styles.loanDetails}>
          <h2>Your Loan Application Status</h2>
          <p><strong>Status:</strong> {loan.status}</p>
          <p><strong>Loan Amount:</strong> {loan.loan_amount} ETB</p>
          <p><strong>Loan Term:</strong> {loan.loan_term} months</p>
          <p><strong>Interest Amount:</strong> {loan.interest_amount} ETB</p>
          <p><strong>Total Amount to Pay:</strong> {loan.total_payment} ETB</p>
          <p><strong>Applied On:</strong> {new Date(loan.created_at).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>You have not applied for any loan yet.</p>
      )}
    </div>
  );
};

export default MemberLoanStatus;
