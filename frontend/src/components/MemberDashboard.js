// src/components/MemberDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "../styles/MemberDashboard.css";
import "react-toastify/dist/ReactToastify.css";

const MemberDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [memberInfo, setMemberInfo] = useState(null);

  // Retrieve the logged-in member's username and token from localStorage.
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // Fetch the member's financial report (aggregated data)
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // You can include date filtering if desired
      let url = "http://127.0.0.1:8000/api/reports/member";
      if (dateRange.start && dateRange.end) {
        url += `?start=${dateRange.start}&end=${dateRange.end}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  // Optionally, fetch member details if needed
  const fetchMemberInfo = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/members/detail/${username}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemberInfo(response.data);
    } catch (error) {
      console.error("Error fetching member details:", error);
      // If failed, you can fallback to using the username only.
      setMemberInfo({ username });
    }
  };

  useEffect(() => {
    if (username && token) {
      fetchReportData();
      fetchMemberInfo();
    } else {
      toast.error("User is not logged in.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, token]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  if (!reportData) {
    return <div className="dashboard-error">No report data available.</div>;
  }

  // Destructure data from reportData (ensure your backend returns these fields)
  const {
    total_deposits,
    total_withdrawals,
    net_balance,
    total_loans_requested,
    active_loans,
    pending_loans,
    completed_loans,
    monthly_transactions,
  } = reportData;

  return (
    <div className="member-dashboard-container">
      <ToastContainer />
      <header className="dashboard-header">
        <h1>
          Welcome,{" "}
          {memberInfo
            ? `${memberInfo.first_name} ${memberInfo.last_name}`
            : username}
          !
        </h1>
        {memberInfo && (
          <p>
            <span>Email: {memberInfo.email}</span> |{" "}
            <span>Phone: {memberInfo.phone_number}</span>
          </p>
        )}
      </header>

      {/* Date Filter */}
      <section className="filter-section">
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
          <button type="submit" className="filter-btn">
            Apply Filters
          </button>
        </form>
      </section>

      {/* Summary Cards */}
      <section className="dashboard-cards">
        <div className="card">
          <h3>Total Deposits</h3>
          <p>ETB {parseFloat(total_deposits).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Withdrawals</h3>
          <p>ETB {parseFloat(total_withdrawals).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <p>ETB {parseFloat(net_balance).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Loans Requested</h3>
          <p>ETB {parseFloat(total_loans_requested).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Active Loans</h3>
          <p>{active_loans}</p>
        </div>
        <div className="card">
          <h3>Pending Loans</h3>
          <p>{pending_loans}</p>
        </div>
        <div className="card">
          <h3>Completed Loans</h3>
          <p>{completed_loans}</p>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <div className="chart-container">
          <h3>Loan Status Overview</h3>
          <Pie
            data={{
              labels: ["Active", "Pending", "Completed"],
              datasets: [
                {
                  data: [active_loans, pending_loans, completed_loans],
                  backgroundColor: ["#007bff", "#ffc107", "#28a745"],
                },
              ],
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Monthly Net Transactions</h3>
          <Line
            data={{
              labels: monthly_transactions.map((t) => t.month),
              datasets: [
                {
                  label: "Net Amount (ETB)",
                  data: monthly_transactions.map((t) => t.amount),
                  borderColor: "#007bff",
                  backgroundColor: "rgba(0, 123, 255, 0.2)",
                  fill: true,
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Optional: Recent Transactions Table (if available) */}
      {/* You can integrate a table here by fetching recent transactions from your unified transactions endpoint */}
    </div>
  );
};

export default MemberDashboard;
