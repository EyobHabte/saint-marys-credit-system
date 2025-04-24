// src/components/MemberDepositList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/MemberDepositList.css';
import { toast } from 'react-toastify';

const MemberDepositList = () => {
  const [members, setMembers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/accounts/list/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        // Filter to include only accounts where account_type is "member"
        const memberAccounts = response.data.filter(account => account.account_type === 'member');
        setMembers(memberAccounts);
      } catch (error) {
        console.error("Error fetching member accounts:", error);
        toast.error("Failed to fetch member accounts.");
      }
    };

    fetchMembers();
  }, [token]);

  return (
    <div className="member-deposit-list">
      <h2>Member Accounts</h2>
      {members.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Deposit</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.username}</td>
                <td>{member.first_name} {member.last_name}</td>
                <td>{member.email}</td>
                <td>{member.phone_number}</td>
                <td>
                  <Link to={`/admin/add-deposit/${member.id}`} className="deposit-btn">
                    Deposit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No member accounts found.</p>
      )}
    </div>
  );
};

export default MemberDepositList;
