// src/components/EnhancedMemberTransactions.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/EnhancedMemberTransactions.css";

const EnhancedMemberTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters: date range and transaction type. By default, show all.
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    type: "All",
  });

  // Retrieve the logged-in member's id and token from localStorage.
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      // --- 1. Fetch Deposits, Loan Requests, and Withdrawals concurrently ---
      const depositsPromise = axios.get("http://127.0.0.1:8000/api/deposits/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const loanRequestsPromise = axios.get("http://127.0.0.1:8000/api/loans/requests/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const withdrawsPromise = axios.get("http://127.0.0.1:8000/api/withdraws/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [depositsRes, loanRequestsRes, withdrawsRes] = await Promise.all([
        depositsPromise,
        loanRequestsPromise,
        withdrawsPromise,
      ]);

      // --- 2. Process Deposits ---
      const userDeposits = depositsRes.data.filter(
        (deposit) => String(deposit.member) === String(userId)
      );
      const depositTransactions = userDeposits.map((deposit) => ({
        id: `deposit-${deposit.id}`,
        type: "Deposit",
        amount: parseFloat(deposit.deposit_amount),
        date: deposit.deposit_date,
        note: deposit.remark || "",
      }));

      // --- 3. Process Loan Requests ---
      const userLoanRequests = loanRequestsRes.data.filter(
        (loan) => String(loan.user) === String(userId)
      );
      const loanRequestTransactions = userLoanRequests.map((loan) => ({
        id: `loan-${loan.id}`,
        type: "Loan Request",
        amount: parseFloat(loan.loan_amount),
        date: loan.created_at,
        note: `Status: ${loan.status}`,
      }));

      // --- 4. Process Loan Repayments ---
      const repaymentPromises = userLoanRequests.map((loan) =>
        axios
          .get(`http://127.0.0.1:8000/api/loans/${loan.id}/repayments/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) =>
            res.data.map((repayment) => ({
              id: `repayment-${loan.id}-${repayment.id}`,
              type: "Loan Repayment",
              amount: parseFloat(repayment.amount_paid),
              date: repayment.repayment_date,
              note: repayment.remark || "",
            }))
          )
          .catch((err) => {
            console.error(`Error fetching repayments for loan ${loan.id}:`, err);
            return []; // Skip repayments for this loan on error.
          })
      );
      const repaymentsArrays = await Promise.all(repaymentPromises);
      const repaymentTransactions = repaymentsArrays.flat();

      // --- 5. Process Withdrawals ---
      const userWithdrawals = withdrawsRes.data.filter(
        (withdraw) => String(withdraw.member) === String(userId)
      );
      const withdrawTransactions = userWithdrawals.map((withdraw) => ({
        id: `withdraw-${withdraw.id}`,
        type: "Withdrawal",
        amount: parseFloat(withdraw.withdraw_amount),
        date: withdraw.withdraw_date,
        note: `Status: ${withdraw.status}` +
              (withdraw.bank_account ? `, Bank: ${withdraw.bank_account}` : "") +
              (withdraw.remark ? `, Note: ${withdraw.remark}` : ""),
      }));

      // --- 6. Combine Transactions ---
      let allTransactions = [
        ...depositTransactions,
        ...loanRequestTransactions,
        ...repaymentTransactions,
        ...withdrawTransactions,
      ];

      // --- 7. Apply Date Filters ---
      if (filter.startDate) {
        const start = new Date(filter.startDate);
        allTransactions = allTransactions.filter(
          (tx) => new Date(tx.date) >= start
        );
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        allTransactions = allTransactions.filter(
          (tx) => new Date(tx.date) <= end
        );
      }

      // --- 8. Apply Transaction Type Filter ---
      if (filter.type !== "All") {
        allTransactions = allTransactions.filter(
          (tx) => tx.type === filter.type
        );
      }

      // --- 9. Sort transactions by date (most recent first) ---
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again later.");
      toast.error("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  // Clear filters: reset to default so all transactions are shown.
  const handleClearFilters = () => {
    setFilter({ startDate: "", endDate: "", type: "All" });
  };

  // Calculate summary statistics.
  const totalDeposit = transactions
    .filter((tx) => tx.type === "Deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalLoanRequested = transactions
    .filter((tx) => tx.type === "Loan Request")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalRepayment = transactions
    .filter((tx) => tx.type === "Loan Repayment")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalWithdrawal = transactions
    .filter((tx) => tx.type === "Withdrawal")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="enhanced-transactions-container">
      <h2>Your Transactions</h2>
      
      {/* Summary Cards */}
      <div className="summary">
        <div className="summary-card">
          <h3>Total Deposits</h3>
          <p>ETB {totalDeposit.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Loan Requested</h3>
          <p>ETB {totalLoanRequested.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Repayments</h3>
          <p>ETB {totalRepayment.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Withdrawals</h3>
          <p>ETB {totalWithdrawal.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="type">Transaction Type:</label>
            <select
              name="type"
              id="type"
              value={filter.type}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Deposit">Deposit</option>
              <option value="Loan Request">Loan Request</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
          </div>
          <button type="submit" className="filter-btn">
            Apply Filters
          </button>
          <button type="button" className="filter-btn clear" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount (ETB)</th>
              <th>Date</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.type}</td>
                <td>{tx.amount.toFixed(2)}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
};

export default EnhancedMemberTransactions;
