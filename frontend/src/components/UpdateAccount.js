// src/components/UpdateAccount.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UpdateAccount.css';

const UpdateAccount = () => {
  const { id } = useParams(); // Get the account ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    account_type: '',
    password: '', // Optional field; if blank, keep current password
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch account details on component mount
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/accounts/detail/${id}/`);
        // Populate the form with fetched data; leave password blank
        setFormData({
          username: response.data.username,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          phone_number: response.data.phone_number,
          account_type: response.data.account_type,
          password: "",
        });
      } catch (error) {
        toast.error("Failed to fetch account details.");
        console.error("Fetch account error:", error);
      }
    };
    fetchAccountDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate the form (basic validation)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required.";
    if (!formData.account_type) newErrors.account_type = "Account type is required.";
    // Only validate password if provided
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8000/api/accounts/update/${id}/`, formData);
      toast.success("Account updated successfully!");
      // After 2 seconds, navigate back to the update account list page
      setTimeout(() => {
        navigate("/accounts/list");
      }, 2000);
    } catch (error) {
      console.error("Update error:", error.response?.data);
      toast.error("Failed to update account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="updateAccountContainer" className="update-account-container">
      <h2>Update Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} readOnly />
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
          {errors.first_name && <p className="error">{errors.first_name}</p>}
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
          {errors.last_name && <p className="error">{errors.last_name}</p>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          {errors.phone_number && <p className="error">{errors.phone_number}</p>}
        </div>
        <div className="form-group">
          <label>Account Type</label>
          <select name="account_type" value={formData.account_type} onChange={handleChange}>
            <option value="">Select Account Type</option>
            <option value="admin">Admin</option>
            <option value="finance_officer">Finance Officer</option>
            <option value="member">Member</option>
          </select>
          {errors.account_type && <p className="error">{errors.account_type}</p>}
        </div>
        <div className="form-group">
          <label>Password (leave blank to keep current password)</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter new password" />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <button type="submit" className="update-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Account"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default UpdateAccount;
