// src/components/MemberWithdraw.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/MemberWithdraw.css';

const MemberWithdraw = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Fetch the current available balance from the Balance Calculator endpoint.
  const fetchAvailableBalance = async () => {
    if (userId && token) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/balance/calculate/?member_id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assume the response returns an object with a "balance" field.
        setAvailableBalance(response.data.balance);
      } catch (error) {
        console.error("Failed to fetch available balance:", error);
        toast.error("Failed to fetch available balance.");
      }
    }
  };

  // Fetch the balance when the component mounts.
  useEffect(() => {
    fetchAvailableBalance();
  }, [userId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    if (availableBalance !== null && amount > availableBalance) {
      toast.error("Withdrawal amount exceeds available balance.");
      return;
    }
    if (!bankAccount.trim()) {
      toast.error("Please enter your bank account number.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send the withdrawal request using the correct field names.
      const response = await axios.post(
        "http://127.0.0.1:8000/api/withdraws/add/",
        {
          member: userId,
          withdraw_amount: withdrawAmount,
          bank_account: bankAccount,  // Updated field name
          remark: note,               // Updated field name (was "note" in state)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Withdrawal request submitted successfully!");
        // Update the available balance after submission.
        await fetchAvailableBalance();
        // Clear the form.
        setWithdrawAmount('');
        setBankAccount('');
        setNote('');
      }
    } catch (error) {
      console.error("Withdrawal error:", error.response || error.message);
      toast.error("Failed to submit withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="enhanced-withdraw-page">
      <div className="withdraw-header">
        <FaMoneyBillWave className="withdraw-icon" />
        <h2>Withdraw Funds</h2>
      </div>
      <div className="balance-display">
        {availableBalance !== null ? (
          <p>
            Available Balance: <strong>{availableBalance} ETB</strong>
          </p>
        ) : (
          <p>Loading balance...</p>
        )}
      </div>
      <form className="withdraw-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="withdrawAmount">Withdrawal Amount (ETB)</label>
          <input
            type="number"
            id="withdrawAmount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bankAccount">Bank Account Number</label>
          <input
            type="text"
            id="bankAccount"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter your bank account number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="note">Note (Optional)</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional information or reason"
          />
        </div>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default MemberWithdraw;
