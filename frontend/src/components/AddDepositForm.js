// src/components/AddDepositForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AddDepositForm.css';
import { toast, ToastContainer } from 'react-toastify';

const AddDepositForm = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [member, setMember] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/accounts/detail/${memberId}/`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        setMember(response.data);
      } catch (error) {
        console.error("Error fetching member details:", error);
        toast.error("Failed to fetch member details.");
      }
    };

    fetchMember();
  }, [memberId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      member: memberId,
      deposit_amount: depositAmount,
      remark: remark,
    };

    try {
      const response = await axios.post('http://localhost:8000/api/deposits/add/', data, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 201) {
        toast.success("Deposit added successfully!");
        // Wait 2 seconds so the user can see the success toast, then navigate
        setTimeout(() => {
          navigate('/admin/members-deposit-list');
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding deposit:", error.response || error.message);
      // Display error message from response if available, otherwise a default message.
      const errorMessage = error.response?.data?.message || "Failed to add deposit.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="add-deposit-form">
      <h2>Add Deposit for Member</h2>
      {member ? (
        <div className="member-info">
          <p><strong>Name:</strong> {member.first_name} {member.last_name}</p>
          <p><strong>Username:</strong> {member.username}</p>
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Phone:</strong> {member.phone_number}</p>
        </div>
      ) : (
        <p>Loading member details...</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Deposit Amount (ETB):</label>
          <input 
            type="number" 
            value={depositAmount} 
            onChange={(e) => setDepositAmount(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Remark:</label>
          <textarea 
            value={remark} 
            onChange={(e) => setRemark(e.target.value)} 
            placeholder="Optional remark"
          ></textarea>
        </div>
        <button type="submit" className="submit-btn">Add Deposit</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddDepositForm;
