// src/components/AdminReportPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminReportPage.css";

// Helper function: Aggregate monthly transactions into yearly data.
const aggregateYearly = (monthlyTransactions) => {
  const yearly = {};
  monthlyTransactions.forEach((item) => {
    // Expecting item.month in format "Jan 2025"
    const year = item.month.split(" ")[1];
    yearly[year] = (yearly[year] || 0) + item.amount;
  });
  return Object.keys(yearly)
    .sort((a, b) => a - b)
    .map((year) => ({ year, amount: yearly[year] }));
};

const AdminReportPage = () => {
  // activeTab can be "monthly", "yearly", or "custom"
  const [activeTab, setActiveTab] = useState("monthly");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For filters:
  // For monthly/yearly: only transactionType is used.
  // For custom: both date range and transaction type.
  const [filters, setFilters] = useState({
    transactionType: "All",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");

  // The admin report endpoint.
  const endpoint = "http://127.0.0.1:8000/api/reports/admin/";

  // Fetch report data from the admin report endpoint.
  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      // For custom report, include date filters.
      if (activeTab === "custom") {
        if (filters.startDate) params.start = filters.startDate;
        if (filters.endDate) params.end = filters.endDate;
      }
      // For all modes, if transaction type is not "All", include it.
      if (filters.transactionType && filters.transactionType !== "All") {
        // (Assuming the backend expects lowercase values)
        params.transaction_type = filters.transactionType.toLowerCase();
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      // Expecting response.data to include:
      // total_deposits, total_withdrawals, total_loans_requested, net_balance,
      // transaction_count, monthly_transactions, and optionally detailed_transactions.
      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching report data:", err.response || err.message);
      setError("Failed to fetch reports. Please try again later.");
      toast.error("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when activeTab or filters change.
  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters, token]);

  // Handle tab changes.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset filters when switching tabs.
    if (tab === "custom") {
      setFilters({ transactionType: "All", startDate: "", endDate: "" });
    } else {
      // For monthly and yearly, clear date filters.
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
    }
  };

  // Handle filter changes.
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    if (activeTab === "custom") {
      setFilters({ transactionType: "All", startDate: "", endDate: "" });
    } else {
      setFilters((prev) => ({ ...prev, transactionType: "All" }));
    }
  };

  // Download CSV of detailed transactions.
  const handleDownloadCSV = () => {
    if (!reportData || !reportData.detailed_transactions || reportData.detailed_transactions.length === 0) {
      toast.info("No transaction data to download.");
      return;
    }
    const header = ["ID", "Type", "Amount (ETB)", "Date", "Note"];
    const rows = reportData.detailed_transactions.map((tx) => [
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
    const fileName = `admin_report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF using jsPDF.
  const handleDownloadPDF = () => {
    if (!reportData || !reportData.detailed_transactions || reportData.detailed_transactions.length === 0) {
      toast.info("No transaction data to download.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Admin Financial Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);
    const headers = [["ID", "Type", "Amount (ETB)", "Date", "Note"]];
    const rows = reportData.detailed_transactions.map((tx) => [
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
    doc.save(`admin_report_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="admin-report-container">
      <ToastContainer />
      <h2>Admin Financial Reports</h2>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => handleTabChange("monthly")}
        >
          Monthly Report
        </button>
        <button
          className={`tab-btn ${activeTab === "yearly" ? "active" : ""}`}
          onClick={() => handleTabChange("yearly")}
        >
          Yearly Report
        </button>
        <button
          className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
          onClick={() => handleTabChange("custom")}
        >
          Custom Report
        </button>
      </div>
      
      {/* Filter Section */}
      <div className="filter-section">
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
        {activeTab === "custom" && (
          <>
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
          </>
        )}
        <div className="filter-buttons">
          <button onClick={fetchReportData} className="filter-btn">
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="filter-btn clear">
            Clear Filters
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Deposits</h3>
          <p>ETB {reportData?.total_deposits?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="card">
          <h3>Total Withdrawals</h3>
          <p>ETB {reportData?.total_withdrawals?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="card">
          <h3>Total Loans Requested</h3>
          <p>ETB {reportData?.total_loans_requested?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <p>ETB {reportData?.net_balance?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="card">
          <h3>Transaction Count</h3>
          <p>{reportData?.transaction_count || 0}</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-section">
        {activeTab === "monthly" && reportData?.monthly_transactions && (
          <div className="chart-container">
            <h3>Monthly Transactions</h3>
            <table className="chart-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Net Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.monthly_transactions.map((item) => (
                  <tr key={item.month}>
                    <td>{item.month}</td>
                    <td>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "yearly" && reportData?.monthly_transactions && (
          <div className="chart-container">
            <h3>Yearly Transactions</h3>
            {(() => {
              const yearlyData = aggregateYearly(reportData.monthly_transactions);
              return (
                <table className="chart-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Net Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((item) => (
                      <tr key={item.year}>
                        <td>{item.year}</td>
                        <td>{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}
        {activeTab === "custom" && (
          <div className="chart-container">
            <h3>Custom Detailed Transactions</h3>
            {reportData?.detailed_transactions && reportData.detailed_transactions.length > 0 ? (
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
                  {reportData.detailed_transactions.map((tx) => (
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
            ) : (
              <p>No detailed transaction data available.</p>
            )}
          </div>
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

export default AdminReportPage;
