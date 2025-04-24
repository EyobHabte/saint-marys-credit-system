// src/components/ViewDeposits.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ViewDeposits.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/deposits/list/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeposits(response.data);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        toast.error("Failed to fetch deposits.");
      }
    };

    fetchDeposits();
  }, [token]);

  return (
    <div className="view-deposits">
      <h2>Deposit Records</h2>
      {deposits.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Deposit Amount (ETB)</th>
              <th>Date</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(deposit => (
              <tr key={deposit.id}>
                <td>{deposit.id}</td>
                <td>
                  {deposit.member_detail
                    ? `${deposit.member_detail.first_name} ${deposit.member_detail.last_name}`
                    : "N/A"}
                </td>
                <td>{deposit.deposit_amount}</td>
                <td>{new Date(deposit.deposit_date).toLocaleDateString()}</td>
                <td>{deposit.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No deposits found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default ViewDeposits;
