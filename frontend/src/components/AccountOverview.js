// src/Dashboard/AccountOverview.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineGraph from '../components/LineGraph';
import '../styles/AdminDashboard.css';

const AccountOverview = () => {
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve token from localStorage (ensure the admin is logged in)
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch monthly transactions from the admin report endpoint
        const reportResponse = await axios.get('http://localhost:8000/api/reports/admin/', {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (reportResponse.data && reportResponse.data.monthly_transactions) {
          setMonthlyTransactions(reportResponse.data.monthly_transactions);
        }

        // Fetch all loan requests from the loans endpoint
        const loansResponse = await axios.get('http://localhost:8000/api/loans/requests/', {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        // Handle both paginated (using results) and non-paginated responses
        const loansData = loansResponse.data.results || loansResponse.data;
        let activeLoansData = [];
        if (Array.isArray(loansData)) {
          activeLoansData = loansData.filter(loan => {
            // Convert outstanding_balance to a float (if provided as a string)
            const outstanding = parseFloat(loan.outstanding_balance || 0);
            return loan.status === 'approved' && outstanding > 0;
          });
        }
        setActiveLoans(activeLoansData);
      } catch (error) {
        console.error("Error fetching account overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOverviewData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Prepare graph data for the LineGraph component.
  // Expected format: an object with "labels" (array of month strings) and "datasets" (array with one dataset).
  const graphData = {
    labels: monthlyTransactions.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Net Transactions',
        data: monthlyTransactions.map(item => item.amount),
        fill: 'start',
        backgroundColor: 'rgba(58, 123, 213, 0.2)',
        borderColor: '#3A7BD5',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  if (loading) {
    return <div>Loading account overview...</div>;
  }

  return (
    <div className="account-overview section-container">
      <h2>Account Overview</h2>
      <div className="overview-content">
        {/* Chart Section */}
        <div className="chart-container">
          {/* Pass dynamic graphData to the LineGraph component */}
          <LineGraph data={graphData} />
        </div>
        
        {/* Active Loans Table */}
        <div className="active-loans">
          <h3>Active Loans</h3>
          <div className="table-controls">
            <div>
              Display 
              <select>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              records
            </div>
            <div>
              Search: <input type="text" placeholder="Search..." />
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Applied Amount (ETB)</th>
                <th>Balance Due (ETB)</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.length > 0 ? (
                activeLoans.map((loan, index) => (
                  <tr key={index}>
                    <td>{loan.first_name} {loan.last_name}</td>
                    <td>{parseFloat(loan.loan_amount).toFixed(2)}</td>
                    <td>{parseFloat(loan.outstanding_balance).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No active loans available</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="table-controls pagination">
            <div>Showing {activeLoans.length} entries</div>
            <div>
              <button disabled>Previous</button>
              <button disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
