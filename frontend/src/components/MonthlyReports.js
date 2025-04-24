// src/components/MonthlyReports.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "../styles/AdminReports.css";

const MonthlyReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // For monthly reports, we only use the transaction type filter.
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
      console.error("Error fetching monthly report data:", err.response || err.message);
      setError("Failed to fetch monthly report data.");
      toast.error("Failed to fetch monthly report data.");
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

  return (
    <div className="admin-report-container">
      <ToastContainer />
      <h2>Monthly Reports</h2>
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
        <p>Loading monthly report data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : reportData && reportData.monthly_transactions && reportData.monthly_transactions.length > 0 ? (
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
                  <td>{parseFloat(item.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No monthly data available.</p>
      )}
    </div>
  );
};

export default MonthlyReports;
