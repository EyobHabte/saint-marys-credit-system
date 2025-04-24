import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";

function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
    gender: "",
    address: "",
    date_of_birth: "",
    employment_type: "",
    employment_id: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!/^[A-Za-z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores.";
        }
        break;
      case "phone_number":
        if (value && !/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits.";
        }
        break;
      case "email":
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          error = "Invalid email address.";
        }
        break;
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters.";
        }
        break;
      case "confirm_password":
        if (value !== form.password) {
          error = "Passwords do not match.";
        }
        break;
      case "employment_id":
        if (!value) {
          error = "Employment ID is required.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
    }));

    const fieldError = validateField(name, newValue);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldError,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/member-registration/register/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        toast.success("Registration successful! Please wait for admin approval.");
        setForm({
          first_name: "",
          last_name: "",
          username: "",
          phone_number: "",
          email: "",
          password: "",
          confirm_password: "",
          gender: "",
          address: "",
          date_of_birth: "",
          employment_type: "",
          employment_id: null,
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data.errors || {};
        const formattedErrors = {};

        for (const field in backendErrors) {
          formattedErrors[field] = Array.isArray(backendErrors[field])
            ? backendErrors[field][0]
            : backendErrors[field];
        }

        setErrors(formattedErrors);

        // Show toast error for Employment ID
        if (backendErrors.employment_id) {
          toast.error(backendErrors.employment_id);
        } else {
          toast.error("Validation failed. Please check your input.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create Your Account</h2>
      <form onSubmit={handleRegister}>
        {/* Form fields */}
        {[
          { name: "first_name", type: "text", label: "First Name" },
          { name: "last_name", type: "text", label: "Last Name" },
          { name: "username", type: "text", label: "Username" },
          { name: "phone_number", type: "tel", label: "Phone Number" },
          { name: "email", type: "email", label: "Email (optional)" },
          { name: "password", type: "password", label: "Password" },
          { name: "confirm_password", type: "password", label: "Confirm Password" },
          { name: "address", type: "text", label: "Address" },
          { name: "date_of_birth", type: "date", label: "Date of Birth" },
        ].map(({ name, type, label }) => (
          <div className="form-group" key={name}>
            <input
              type={type}
              name={name}
              className={`form-control ${errors[name] ? "error-border" : ""}`}
              placeholder=" "
              value={form[name] || ""}
              onChange={handleChange}
              required={name !== "email"}
            />
            <label>{label}</label>
            {errors[name] && <span className="error">{errors[name]}</span>}
          </div>
        ))}

        <div className="form-group select-group">
          <label className="top-label">Gender:</label>
          <select
            name="gender"
            className={`form-control ${errors.gender ? "error-border" : ""}`}
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>
        <div className="form-group select-group">
          <label className="top-label">Job Position:</label>
          <select
            name="employment_type"
            className={`form-control ${errors.employment_type ? "error-border" : ""}`}
            value={form.employment_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Job Position</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Administrative Staff">Administrative Staff</option>
            <option value="Technical Staff">Technical Staff</option>
            <option value="Support Staff">Support Staff</option>
          </select>
          {errors.employment_type && <p className="error">{errors.employment_type}</p>}
        </div>

        <div className="form-group file-upload">
          <input
            type="file"
            name="employment_id"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
          <label>Upload Employment ID (image only)</label>
          {errors.employment_id && <p className="error">{errors.employment_id}</p>}
        </div>
        <button type="submit" className="reg_btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register"}
        </button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
      <ToastContainer />
    </div>
  );
}

export default Register;
