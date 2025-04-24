// src/components/AddDeposit.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/AddDeposit.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddDeposit = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const token = localStorage.getItem("token");

  // Fetch members list on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/members/', {
          headers: { "Authorization": `Bearer ${token}` },
        });
        // Determine the members array from the response data
        const data = response.data;
        const membersArray = Array.isArray(data)
          ? data
          : Array.isArray(data.members)
            ? data.members
            : Array.isArray(data.data)
              ? data.data
              : [];
        setMembers(membersArray);
      } catch (error) {
        toast.error("Failed to fetch members.");
      }
    };
    fetchMembers();
  }, [token]);
  

  // When a member is selected, compute deposit (15% of monthly salary)
  const handleMemberChange = (e) => {
    const memberId = e.target.value;
    setSelectedMember(memberId);
    const member = members.find(m => m.id.toString() === memberId);
    if (member) {
      const salary = parseFloat(member.monthly_salary);
      setMonthlySalary(salary);
      setDepositAmount((salary * 0.15).toFixed(2));
    } else {
      setMonthlySalary(0);
      setDepositAmount(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error("Please select a member.");
      return;
    }
    try {
      const data = {
        member: selectedMember,
        deposit_amount: depositAmount,
        // Optionally, you can include deposit_date here (or let the backend add it)
        remark: remark
      };
      const response = await axios.post(
        'http://localhost:8000/api/deposits/add/',
        data,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (response.status === 201) {
        toast.success("Deposit added successfully!");
        // Clear the form
        setSelectedMember('');
        setMonthlySalary(0);
        setDepositAmount(0);
        setRemark('');
      }
    } catch (error) {
      console.error("Add deposit error:", error.response || error.message);
      toast.error("Failed to add deposit.");
    }
  };

  return (
    <div className={styles.addDepositContainer}>
      <h2>Add Deposit</h2>
      <form onSubmit={handleSubmit} className={styles.depositForm}>
        <div className={styles.formGroup}>
          <label htmlFor="memberSelect">Select Member:</label>
          <select
            id="memberSelect"
            value={selectedMember}
            onChange={handleMemberChange}
            required
          >
            <option value="">-- Select Member --</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
        </div>
        {selectedMember && (
          <>
            <div className={styles.formGroup}>
              <label>Monthly Salary:</label>
              <span>{monthlySalary} ETB</span>
            </div>
            <div className={styles.formGroup}>
              <label>Deposit Amount (15% of Salary):</label>
              <span>{depositAmount} ETB</span>
            </div>
          </>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="remark">Remark:</label>
          <textarea
            id="remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Optional remark"
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Add Deposit
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddDeposit;