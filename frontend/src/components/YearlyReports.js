// src/components/YearlyReports.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "../styles/AdminReports.css";

// Helper function to aggregate monthly transactions into yearly totals.
const aggregateYearly = (monthlyTransactions) => {
  const yearly = {};
  monthlyTransactions.forEach((item) => {
    // Assuming item.month is in format "Jan 2025"
    const parts = item.month.split(" ");
    const year = parts[1];
    yearly[year] = (yearly[year] || 0) + parseFloat(item.amount);
  });
  return Object.keys(yearly)
    .sort((a, b) => a - b)
    .map((year) => ({ year, amount: yearly[year] }));
};

const YearlyReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // For yearly reports, we only use the transaction type filter.
  const [filters, setFilters] = useState({
    transactionType: "All",
  });

  const token = localStorage.getItem("token");
  const endpoint = "http://127.0.0.1:8000/api/reports/admin/";

  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.transactionType && filters.transactionType !== "All") {
        params.transaction_type = filters.transactionType.toLowerCase();
      }
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching yearly report data:", err.response || err.message);
      setError("Failed to fetch yearly report data.");
      toast.error("Failed to fetch yearly report data.");
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

  const handleClearFilters = () => {
    setFilters({ transactionType: "All" });
  };

  const yearlyData = reportData && reportData.monthly_transactions
    ? aggregateYearly(reportData.monthly_transactions)
    : [];

  return (
    <div className="admin-report-container">
      <ToastContainer />
      <h2>Yearly Reports</h2>
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
        <div className="filter-buttons">
          <button onClick={fetchReportData} className="filter-btn">Apply Filters</button>
          <button onClick={handleClearFilters} className="filter-btn clear">Clear Filters</button>
        </div>
      </div>
      {loading ? (
        <p>Loading yearly report data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : yearlyData.length > 0 ? (
        <div className="chart-container">
          <h3>Yearly Transactions</h3>
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
                  <td>{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No yearly data available.</p>
      )}
    </div>
  );
};

export default YearlyReports;
