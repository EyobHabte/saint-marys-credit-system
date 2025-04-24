// src/components/FinancialTransactionsReport.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "react-toastify/dist/ReactToastify.css";
import "../styles/FinancialTransactionsReport.css";

const FinancialTransactionsReport = () => {
  // State for detailed transactions list
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters for dates, transaction type, and search keyword for the Note.
  // Default: all dates, transactionType "All", and empty search.
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "All",
    search: "",
  });

  // Retrieve token, userId, and username from localStorage.
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Endpoints:
  const depositsEndpoint = "http://127.0.0.1:8000/api/deposits/list/";
  const loansEndpoint = "http://127.0.0.1:8000/api/loans/requests/";
  const withdrawsEndpoint = "http://127.0.0.1:8000/api/withdraws/list/";

  // Fetch transactions from deposits, loan requests (plus repayments), and withdrawals.
  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch deposits, loan requests, and withdrawals concurrently.
      const depositsPromise = axios.get(depositsEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const loanRequestsPromise = axios.get(loansEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const withdrawsPromise = axios.get(withdrawsEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [depositsRes, loanRequestsRes, withdrawsRes] = await Promise.all([
        depositsPromise,
        loanRequestsPromise,
        withdrawsPromise,
      ]);

      // 2. Process Deposits.
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

      // 3. Process Loan Requests.
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

      // 4. Process Loan Repayments.
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

      // 5. Process Withdrawals.
      const userWithdrawals = withdrawsRes.data.filter(
        (withdraw) => String(withdraw.member) === String(userId)
      );
      const withdrawTransactions = userWithdrawals.map((withdraw) => ({
        id: `withdraw-${withdraw.id}`,
        type: "Withdrawal",
        amount: parseFloat(withdraw.withdraw_amount),
        date: withdraw.withdraw_date,
        note:
          `Status: ${withdraw.status}` +
          (withdraw.bank_account ? `, Bank: ${withdraw.bank_account}` : "") +
          (withdraw.remark ? `, Note: ${withdraw.remark}` : ""),
      }));

      // 6. Combine all transactions.
      let allTransactions = [
        ...depositTransactions,
        ...loanRequestTransactions,
        ...repaymentTransactions,
        ...withdrawTransactions,
      ];

      // 7. Apply Date Filters.
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        allTransactions = allTransactions.filter(
          (tx) => new Date(tx.date) >= start
        );
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        allTransactions = allTransactions.filter(
          (tx) => new Date(tx.date) <= end
        );
      }

      // 8. Apply Transaction Type Filter (if not "All").
      if (filters.transactionType && filters.transactionType !== "All") {
        allTransactions = allTransactions.filter(
          (tx) => tx.type === filters.transactionType
        );
      }

      // 9. Apply Search Filter on Note (if provided).
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase();
        allTransactions = allTransactions.filter((tx) =>
          (tx.note || "").toLowerCase().includes(searchTerm)
        );
      }

      // 10. Sort transactions by date (most recent first).
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

  // Fetch default transactions on mount (do not include filters in dependency).
  useEffect(() => {
    if (userId && token) {
      fetchTransactions();
    }
  }, [userId, token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", transactionType: "All", search: "" });
    fetchTransactions();
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

  // Download CSV: include all transactions based on current filters.
  const handleDownloadCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.info("No transactions to download.");
      return;
    }
    const header = ["ID", "Type", "Amount (ETB)", "Date", "Note"];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.type,
      parseFloat(tx.amount).toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `financial_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF using jsPDF.
  const handleDownloadPDF = () => {
    if (!transactions || transactions.length === 0) {
      toast.info("No transactions to download.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Financial Transactions Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    const headers = [["ID", "Type", "Amount (ETB)", "Date", "Note"]];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.type,
      parseFloat(tx.amount).toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    doc.autoTable({
      startY: 35,
      head: headers,
      body: rows,
    });
    doc.save(`financial_transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="financial-report-container">
      <h2>Financial Transactions Report</h2>
      
      <div className="controls">
        <button onClick={fetchTransactions} className="refresh-btn">
          Refresh Data
        </button>
        <span className="report-header">
          {filters.startDate || filters.endDate || (filters.transactionType !== "All") || (filters.search.trim() !== "")
            ? "Filtered Transactions"
            : "All Transactions"}
        </span>
      </div>
      
      <div className="filter-section">
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="transactionType">Transaction Type:</label>
            <select
              name="transactionType"
              id="transactionType"
              value={filters.transactionType}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Deposit">Deposit</option>
              <option value="Loan Request">Loan Request</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
          </div>
          <div className="filter-group search-group">
            <label htmlFor="search">Search Note:</label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Enter keyword..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-buttons">
            <button type="submit" className="filter-btn">
              Apply Filters
            </button>
            <button
              type="button"
              className="filter-btn clear"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Deposits</h3>
          <p>ETB {totalDeposit.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Loan Requested</h3>
          <p>ETB {totalLoanRequested.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Repayments</h3>
          <p>ETB {totalRepayment.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Withdrawals</h3>
          <p>ETB {totalWithdrawal.toFixed(2)}</p>
        </div>
      </div>

      <div className="transactions-table-container">
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
      </div>

      <div className="download-section">
        <button onClick={handleDownloadCSV} className="download-btn">
          Download CSV
        </button>
        <button onClick={handleDownloadPDF} className="download-btn pdf">
          Download PDF
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FinancialTransactionsReport;
