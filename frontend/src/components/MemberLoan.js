// src/components/MemberLoan.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHandHoldingUsd } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/MemberLoan.module.css';

const MemberLoan = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [interest, setInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestRate = 0.02; // 2% per month

  useEffect(() => {
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm);
    if (!isNaN(amount) && !isNaN(term)) {
      const calculatedInterest = amount * interestRate * term;
      setInterest(calculatedInterest.toFixed(2));
      setTotalPayment((amount + calculatedInterest).toFixed(2));
    } else {
      setInterest(0);
      setTotalPayment(0);
    }
  }, [loanAmount, loanTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate input
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm);
    if (isNaN(amount) || isNaN(term) || amount <= 0 || term <= 0) {
      toast.error("Please enter valid loan amount and term.");
      setIsSubmitting(false);
      return;
    }

    // Retrieve the JWT token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Retrieve userId from localStorage (assumed to be stored on login)
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Check if there is an existing pending or active loan for this user
    try {
      const statusResponse = await axios.get(`http://localhost:8000/api/loans/status/${userId}/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (statusResponse.data && Object.keys(statusResponse.data).length > 0) {
        const currentLoan = statusResponse.data;
        // Block new loan submission if there's a loan that is pending or approved (active)
        if (currentLoan.status === "pending" || currentLoan.status === "approved") {
          toast.error("You already have a pending or active loan. Please wait until it is processed or repaid.");
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error checking current loan status:", error.response || error.message);
      toast.error("Failed to verify current loan status. Please try again later.");
      setIsSubmitting(false);
      return;
    }

    // Proceed with loan submission if no pending/active loan exists
    try {
      const response = await axios.post(
        "http://localhost:8000/api/loans/submit/",
        {
          loan_amount: amount,
          loan_term: term,
          purpose: purpose,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Loan request submitted successfully!");
        setLoanAmount('');
        setLoanTerm('');
        setPurpose('');
      }
    } catch (error) {
      console.error("Loan submission error:", error.response || error.message);
      toast.error("Failed to submit loan request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.memberLoanContainer}>
      <div className={styles.loanHeader}>
        <FaHandHoldingUsd className={styles.loanIcon} />
        <h2>Loan Application</h2>
      </div>
      <form className={styles.loanForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="loanAmount">Loan Amount (ETB)</label>
          <input
            type="number"
            id="loanAmount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="Enter loan amount"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="loanTerm">Loan Term (months)</label>
          <input
            type="number"
            id="loanTerm"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            placeholder="Enter loan term in months"
            required
          />
        </div>
        <div className={styles.calculationInfo}>
          <p>Interest (2% per month): <strong>{interest} ETB</strong></p>
          <p>Total Amount to Pay: <strong>{totalPayment} ETB</strong></p>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="purpose">Purpose</label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Describe the purpose of the loan"
            required
          />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Apply for Loan'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default MemberLoan;
