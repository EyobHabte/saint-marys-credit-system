// src/components/MemberProfileUpdate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/MemberProfileUpdate.css";

const MemberProfileUpdate = () => {
  const [formData, setFormData] = useState({
    account_type: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // For this example, we assume the logged-in member's id is stored in localStorage.
  // In a production app, you might get this from a context or authentication provider.
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/accounts/detail/${userId}/`
        );
        setFormData(response.data);
      } catch (error) {
        toast.error("Failed to fetch account details.");
        console.error(error);
      }
    };
    if (userId) {
      fetchAccountDetails();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Prepare data to send (if password is left blank, it will not be updated)
    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/accounts/update/${userId}/`,
        dataToSend
      );
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        // Optionally navigate to the profile view page or refresh data
        navigate("/member/profile");
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMap = {};
        Object.keys(errors).forEach((key) => {
          errorMap[key] = errors[key][0];
        });
        setFieldErrors(errorMap);
        toast.error("Validation errors occurred.");
      } else {
        toast.error("Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-profile-update">
      <h1>Update Profile</h1>
      <form onSubmit={handleSubmit}>
        {/* Account Type (read-only) */}
        <div className="form-group">
          <label>Account Type:</label>
          <input type="text" name="account_type" value={formData.account_type} disabled />
        </div>
        {/* Username (read-only for members) */}
        <div className="form-group">
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} disabled />
        </div>
        {/* Password */}
        <div className="form-group">
          <label>Password (leave blank to keep current):</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
          />
          {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}
        </div>
        {/* First Name */}
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          {fieldErrors.first_name && <span className="error">{fieldErrors.first_name}</span>}
        </div>
        {/* Last Name */}
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          {fieldErrors.last_name && <span className="error">{fieldErrors.last_name}</span>}
        </div>
        {/* Email */}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
        </div>
        {/* Phone Number */}
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
          {fieldErrors.phone_number && <span className="error">{fieldErrors.phone_number}</span>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default MemberProfileUpdate;
