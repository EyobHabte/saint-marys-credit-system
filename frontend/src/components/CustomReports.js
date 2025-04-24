// src/components/CustomReports.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "../styles/AdminReports.css";

const CustomReports = () => {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // For custom report, use both date range and transaction type filters.
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "All",
  });

  const token = localStorage.getItem("token");
  const endpoint = "http://127.0.0.1:8000/api/reports/admin/";

  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.startDate) params.start = filters.startDate;
      if (filters.endDate) params.end = filters.endDate;
      if (filters.transactionType && filters.transactionType !== "All") {
        params.transaction_type = filters.transactionType.toLowerCase();
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      // Expect detailedData to include summary fields and detailed_transactions array.
      setDetailedData(response.data);
    } catch (err) {
      console.error("Error fetching custom report data:", err.response || err.message);
      setError("Failed to fetch custom report data.");
      toast.error("Failed to fetch custom report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReportData();
    }
  }, [filters, token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", transactionType: "All" });
    fetchReportData();
  };

  const handleDownloadCSV = () => {
    if (!detailedData || !detailedData.detailed_transactions || detailedData.detailed_transactions.length === 0) {
      toast.info("No transaction data to download.");
      return;
    }
    const header = ["ID", "Type", "Amount (ETB)", "Date", "Note"];
    const rows = detailedData.detailed_transactions.map((tx) => [
      tx.id,
      tx.transaction_type,
      parseFloat(tx.amount).toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `custom_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!detailedData || !detailedData.detailed_transactions || detailedData.detailed_transactions.length === 0) {
      toast.info("No transaction data to download.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Custom Financial Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    const headers = [["ID", "Type", "Amount (ETB)", "Date", "Note"]];
    const rows = detailedData.detailed_transactions.map((tx) => [
      tx.id,
      tx.transaction_type,
      parseFloat(tx.amount).toFixed(2),
      new Date(tx.date).toLocaleString(),
      tx.note,
    ]);
    doc.autoTable({
      startY: 35,
      head: headers,
      body: rows,
    });
    doc.save(`custom_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="admin-report-container">
      <ToastContainer />
      <h2>Custom Financial Report</h2>
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
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="loan">Loan</option>
            </select>
          </div>
          <div className="filter-buttons">
            <button type="submit" className="filter-btn">Apply Filters</button>
            <button type="button" className="filter-btn clear" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        </form>
      </div>
      {loading ? (
        <p>Loading custom report data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : detailedData && detailedData.detailed_transactions && detailedData.detailed_transactions.length > 0 ? (
        <>
          <div className="summary-cards">
            <div className="card">
              <h3>Total Deposits</h3>
              <p>ETB {detailedData.total_deposits.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Total Withdrawals</h3>
              <p>ETB {detailedData.total_withdrawals.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Total Loans Requested</h3>
              <p>ETB {detailedData.total_loans_requested.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Net Balance</h3>
              <p>ETB {detailedData.net_balance.toFixed(2)}</p>
            </div>
            <div className="card">
              <h3>Transaction Count</h3>
              <p>{detailedData.transaction_count}</p>
            </div>
          </div>
          <div className="chart-container">
            <h3>Detailed Transactions</h3>
            <table className="chart-table">
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
                {detailedData.detailed_transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.transaction_type}</td>
                    <td>{parseFloat(tx.amount).toFixed(2)}</td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>No detailed transaction data available.</p>
      )}
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

export default CustomReports;
