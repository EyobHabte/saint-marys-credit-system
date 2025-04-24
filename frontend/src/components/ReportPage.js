// src/components/ReportPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ReportPage.css";

const ReportPage = ({ reportType }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Choose the proper endpoint based on reportType.
  // For example, assume that the backend provides:
  //  - /api/reports/member for member reports
  //  - /api/reports/admin for admin reports
  const endpoint =
    reportType === "admin"
      ? "http://127.0.0.1:8000/api/reports/admin"
      : "http://127.0.0.1:8000/api/reports/member";

  const token = localStorage.getItem("token");

  // Fetch report data initially.
  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.start) params.start = dateRange.start;
      if (dateRange.end) params.end = dateRange.end;

      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    if (!dateRange.start || !dateRange.end) {
      toast.warning("Please select a valid date range.");
      return;
    }
    fetchReportData();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Loading report data...</p>;
  if (!reportData) return <p>No report data available.</p>;

  return (
    <div className="report-page-container">
      <h2>{reportType === "admin" ? "Admin Financial Report" : "Member Financial Report"}</h2>

      {/* Filter Section */}
      <div className="filter-section">
        <form onSubmit={handleDateFilter}>
          <div className="filter-group">
            <label htmlFor="start">Start Date:</label>
            <input
              type="date"
              name="start"
              id="start"
              value={dateRange.start}
              onChange={handleDateChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end">End Date:</label>
            <input
              type="date"
              name="end"
              id="end"
              value={dateRange.end}
              onChange={handleDateChange}
            />
          </div>
          <button type="submit" className="filter-btn">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Deposits</h3>
          <p>
            ETB{" "}
            {reportData.total_deposits
              ? Number(reportData.total_deposits).toFixed(2)
              : "0.00"}
          </p>
        </div>
        <div className="card">
          <h3>Total Withdrawals</h3>
          <p>
            ETB{" "}
            {reportData.total_withdrawals
              ? Number(reportData.total_withdrawals).toFixed(2)
              : "0.00"}
          </p>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <p>
            ETB{" "}
            {reportData.net_balance
              ? Number(reportData.net_balance).toFixed(2)
              : "0.00"}
          </p>
        </div>
        {reportType === "admin" && (
          <div className="card">
            <h3>Total Loans Requested</h3>
            <p>
              ETB{" "}
              {reportData.total_loans_requested
                ? Number(reportData.total_loans_requested).toFixed(2)
                : "0.00"}
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts">
        <div className="chart-container">
          <h3>Loan Status Overview</h3>
          <Pie
            data={{
              labels: ["Active Loans", "Completed Loans", "Pending Loans"],
              datasets: [
                {
                  data: [
                    reportData.active_loans || 0,
                    reportData.completed_loans || 0,
                    reportData.pending_loans || 0,
                  ],
                  backgroundColor: ["#007bff", "#28a745", "#ffc107"],
                },
              ],
            }}
          />
        </div>
        <div className="chart-container">
          <h3>Monthly Transactions</h3>
          <Line
            data={{
              labels: reportData.monthly_transactions?.map((t) => t.month) || [],
              datasets: [
                {
                  label: "Total Transactions",
                  data: reportData.monthly_transactions?.map((t) => t.amount) || [],
                  borderColor: "#007bff",
                  fill: false,
                },
              ],
            }}
          />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ReportPage;
