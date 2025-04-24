// src/components/AdminDetailReport.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminDetailReport.css";

const AdminDetailReport = () => {
  // State for the aggregated detailed transactions (from all apps)
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters for date range and transaction type.
  // By default, no filters are applied (show all transactions).
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "All",
  });

  const token = localStorage.getItem("token");

  // Endpoints from your backend apps:
  const depositsEndpoint = "http://127.0.0.1:8000/api/deposits/list/";
  const loansEndpoint = "http://127.0.0.1:8000/api/loans/requests/";
  const withdrawsEndpoint = "http://127.0.0.1:8000/api/withdraws/list/";

  // Fetch and combine transactions from Deposits, Loans (and their repayments), and Withdrawals.
  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch deposits, loan requests, and withdrawals concurrently.
      const [depositsRes, loanRequestsRes, withdrawsRes] = await Promise.all([
        axios.get(depositsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(loansEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(withdrawsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // 2. Process Deposits.
      const depositTransactions = depositsRes.data.map((deposit) => ({
        id: `deposit-${deposit.id}`,
        transaction_type: "Deposit",
        amount: parseFloat(deposit.deposit_amount),
        date: deposit.deposit_date,
        note: deposit.remark || "",
      }));

      // 3. Process Loan Requests.
      const loanRequestTransactions = loanRequestsRes.data.map((loan) => ({
        id: `loan-${loan.id}`,
        transaction_type: "Loan Request",
        amount: parseFloat(loan.loan_amount),
        date: loan.created_at,
        note: `Status: ${loan.status}`,
      }));

      // 4. Process Loan Repayments for each loan.
      const repaymentPromises = loanRequestsRes.data.map((loan) =>
        axios
          .get(`http://127.0.0.1:8000/api/loans/${loan.id}/repayments/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) =>
            res.data.map((repayment) => ({
              id: `repayment-${loan.id}-${repayment.id}`,
              transaction_type: "Loan Repayment",
              amount: parseFloat(repayment.amount_paid),
              date: repayment.repayment_date,
              note: repayment.remark || "",
            }))
          )
          .catch((err) => {
            console.error(`Error fetching repayments for loan ${loan.id}:`, err);
            return []; // Skip repayments if error occurs.
          })
      );
      const repaymentArrays = await Promise.all(repaymentPromises);
      const repaymentTransactions = repaymentArrays.flat();

      // 5. Process Withdrawals.
      const withdrawTransactions = withdrawsRes.data.map((withdraw) => ({
        id: `withdraw-${withdraw.id}`,
        transaction_type: "Withdrawal",
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

      // 7. Apply Date Filters (if provided).
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
          (tx) => tx.transaction_type === filters.transactionType
        );
      }

      // 9. Sort transactions by date (most recent first).
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

  // On component mount, fetch all transactions (with no filters applied).
  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", transactionType: "All" });
    fetchTransactions();
  };

  // Download CSV: use the currently displayed transactions.
  const handleDownloadCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.info("No transactions to download.");
      return;
    }
    const header = ["ID", "Type", "Amount (ETB)", "Date", "Note"];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.transaction_type,
      tx.amount.toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `admin_detailed_report_${new Date().toISOString().slice(0, 10)}.csv`;
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
    doc.text("Admin Detailed Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    const headers = [["ID", "Type", "Amount (ETB)", "Date", "Note"]];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.transaction_type,
      tx.amount.toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    doc.autoTable({
      startY: 35,
      head: headers,
      body: rows,
    });
    doc.save(`admin_detailed_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Calculate summary statistics for display in cards.
  const totalDeposit = transactions
    .filter((tx) => tx.transaction_type === "Deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalLoanRequested = transactions
    .filter((tx) => tx.transaction_type === "Loan Request")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalRepayment = transactions
    .filter((tx) => tx.transaction_type === "Loan Repayment")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalWithdrawal = transactions
    .filter((tx) => tx.transaction_type === "Withdrawal")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="admin-report-container">
      <h2>Admin Detailed Transactions Report</h2>
      
      {/* Filter Controls */}
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
          <div className="filter-buttons">
            <button type="submit" className="filter-btn">
              Apply Filters
            </button>
            <button type="button" className="filter-btn clear" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards */}
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

      {/* Detailed Transactions Table */}
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
                  <td>{tx.transaction_type}</td>
                  <td>{tx.amount.toFixed(2)}</td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Download Section */}
      <div className="download-section">
        <button onClick={handleDownloadCSV} className="download-btn">
          Download CSV
        </button>
        <button onClick={handleDownloadPDF} className="download-btn pdf">
          Download PDF
        </button>
      </div>
      {loading && <p>Loading report data...</p>}
      {error && <p className="error">{error}</p>}
      <ToastContainer />
    </div>
  );
};

export default AdminDetailReport;
