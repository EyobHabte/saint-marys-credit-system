// src/Dashboard/ClientDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const ClientDetails = () => {
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [pendingLoans, setPendingLoans] = useState(0);
  const [totalFunds, setTotalFunds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Admin might not be authenticated.");
          setLoading(false);
          return;
        }

        // Fetch total members count (assumes a paginated response with a "count" field)
        const membersResponse = await axios.get('http://localhost:8000/api/members/list/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (membersResponse.data && typeof membersResponse.data.count === 'number') {
          setTotalMembers(membersResponse.data.count);
        } else {
          // Fallback if count is not provided
          setTotalMembers(membersResponse.data.length || 0);
        }

        // Fetch aggregated report data for loans and funds
        const reportResponse = await axios.get('http://localhost:8000/api/reports/admin/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (reportResponse.data) {
          setActiveLoans(reportResponse.data.active_loans || 0);
          setPendingLoans(reportResponse.data.pending_loans || 0);
          setTotalFunds(reportResponse.data.net_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading client details...</div>;
  }

  return (
    <div className="client-details section-container">
      <div className="card blue">
        <h3>{totalMembers}</h3>
        <p>All Members</p>
        <button onClick={() => window.location.href="/admin/members-list"}>View Members</button>
      </div>
      <div className="card orange">
        <h3>{activeLoans}</h3>
        <p>Active Loans</p>
        <button onClick={() => window.location.href="/admin/loan-requests"}>View Active Loans</button>
      </div>
      <div className="card red">
        <h3>{pendingLoans}</h3>
        <p>Pending Loans</p>
        <button onClick={() => window.location.href="/admin/loan-requests"}>View Pending Loans</button>
      </div>
      <div className="card green">
        <h3>ETB {parseFloat(totalFunds).toFixed(2)}</h3>
        <p>Total Funds</p>
        <button onClick={() => window.location.href="/admin/view-deposits"}>View Funds</button>
      </div>
    </div>
  );
};

export default ClientDetails;
