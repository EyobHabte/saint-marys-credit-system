// src/Dashboard/RecentTransactions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const RecentTransactions = () => {
  const [activeLoansAmount, setActiveLoansAmount] = useState(0);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch loans list from the loan requests endpoint
        const loansResponse = await axios.get('http://localhost:8000/api/loans/requests/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        // Handle both paginated and non-paginated responses
        const loansData = loansResponse.data.results || loansResponse.data;
        let activeLoansAmountSum = 0;
        let interestSum = 0;
        if (Array.isArray(loansData)) {
          loansData.forEach(loan => {
            // For approved loans with outstanding balance, sum their outstanding balance
            if (loan.status === 'approved' && parseFloat(loan.outstanding_balance) > 0) {
              activeLoansAmountSum += parseFloat(loan.outstanding_balance);
            }
            // Sum interest amounts for approved loans
            if (loan.status === 'approved') {
              interestSum += parseFloat(loan.interest_amount);
            }
          });
        }

        setActiveLoansAmount(activeLoansAmountSum);
        setTotalInterest(interestSum);

        // Fetch withdrawals list
        const withdrawResponse = await axios.get('http://localhost:8000/api/withdraw/list/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const withdrawsData = withdrawResponse.data.results || withdrawResponse.data;
        let pendingWithdrawals = 0;
        if (Array.isArray(withdrawsData)) {
          withdrawsData.forEach(withdraw => {
            if (withdraw.status === 'pending') pendingWithdrawals += 1;
          });
        }
        setPendingWithdrawalsCount(pendingWithdrawals);
      } catch (error) {
        console.error("Error fetching recent transactions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading recent transactions...</div>;
  }

  return (
    <div className="recent-transactions">
      <div className="card orange">
        <h3>ETB {activeLoansAmount.toFixed(2)}</h3>
        <p>Active Loans Amount</p>
      </div>
      <div className="card red">
        <h3>{pendingWithdrawalsCount}</h3>
        <p>Pending Transactions</p>
      </div>
      <div className="card green">
        <h3>ETB {totalInterest.toFixed(2)}</h3>
        <p>Total Interests on Loans</p>
      </div>
    </div>
  );
};

export default RecentTransactions;
