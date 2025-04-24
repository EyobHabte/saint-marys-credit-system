import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AddMember.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddMember = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const memberDetails = location.state?.memberDetails || {};

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    gender: "",
    job_position: "",
    employment_id: null, // File input
    submitted_by: "",
    use_existing_employment_id: true, // Flag to use existing image
  });
  const [existingImage, setExistingImage] = useState(""); // For showing the existing image
  const [newImagePreview, setNewImagePreview] = useState(null); // For showing the new selected file preview
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // Track field-specific errors

  useEffect(() => {
    if (Object.keys(memberDetails).length > 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        first_name: memberDetails.first_name || "",
        last_name: memberDetails.last_name || "",
        username: memberDetails.username || "",
        email: memberDetails.email || "",
        phone_number: memberDetails.phone_number || "",
        gender: memberDetails.gender || "",
        job_position: memberDetails.employment_type || "",
        submitted_by: "",
      }));

      if (memberDetails.employment_id) {
        const relativePath = new URL(memberDetails.employment_id).pathname; // Extract relative path
        setExistingImage(relativePath); // Set only the relative path
      }
    }
  }, [memberDetails]); // Run only when memberDetails changes

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear field-specific error on change

    if (files && files[0]) {
      setFormData({
        ...formData,
        employment_id: files[0],
        use_existing_employment_id: false, // User selected a new file
      });
      setNewImagePreview(URL.createObjectURL(files[0])); // Generate preview for the new file
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateInputs = () => {
    const errors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.first_name.trim()) errors.first_name = "First name is required.";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required.";
    if (!formData.username.trim()) errors.username = "Username is required.";
    if (!emailRegex.test(formData.email)) errors.email = "Invalid email format.";
    if (!phoneRegex.test(formData.phone_number)) errors.phone_number = "Phone number must be 10 digits.";
    if (!formData.gender) errors.gender = "Gender is required.";
    if (!formData.job_position) errors.job_position = "Job position is required.";
    if (!formData.submitted_by.trim()) errors.submitted_by = "Submitted by is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setFormErrors({});

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "use_existing_employment_id") {
        data.append(key, value);
      }
    });

    if (formData.use_existing_employment_id) {
      data.append("existing_employment_id", existingImage);
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/members/add/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data.message); // Show success toast
      setTimeout(() => navigate("/member-requests"), 2000); // Redirect after 2 seconds
    } catch (error) {
      if (error.response && error.response.data) {
        setFormErrors(error.response.data); // Display field-specific errors
        Object.keys(error.response.data).forEach((key) => {
          toast.error(`${key}: ${error.response.data[key][0]}`); // Show error toast for each field
        });
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-member">
      <ToastContainer />
      <h1>Add Member</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>First Name:</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={formErrors.first_name ? "error-border" : ""}
          required
        />
        {formErrors.first_name && <p className="error">{formErrors.first_name}</p>}

        <label>Last Name:</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={formErrors.last_name ? "error-border" : ""}
          required
        />
        {formErrors.last_name && <p className="error">{formErrors.last_name}</p>}

        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={formErrors.username ? "error-border" : ""}
          required
        />
        {formErrors.username && <p className="error">{formErrors.username}</p>}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={formErrors.email ? "error-border" : ""}
          required
        />
        {formErrors.email && <p className="error">{formErrors.email}</p>}

        <label>Phone Number:</label>
        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className={formErrors.phone_number ? "error-border" : ""}
          required
        />
        {formErrors.phone_number && <p className="error">{formErrors.phone_number}</p>}

        <label>Gender:</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={formErrors.gender ? "error-border" : ""}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {formErrors.gender && <p className="error">{formErrors.gender}</p>}

        <label>Job Position:</label>
        <select
          name="job_position"
          value={formData.job_position}
          onChange={handleChange}
          className={formErrors.job_position ? "error-border" : ""}
          required
        >
          <option value="">Select Job Position</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Administrative Staff">Administrative Staff</option>
          <option value="Technical Staff">Technical Staff</option>
          <option value="Support Staff">Support Staff</option>
        </select>
        {formErrors.job_position && <p className="error">{formErrors.job_position}</p>}

        <label>Employment ID (Image):</label>
        <div className="image-preview">
          {newImagePreview ? (
            <>
              <p>Newly Selected Image:</p>
              <img src={newImagePreview} alt="New Employment ID" />
            </>
          ) : existingImage ? (
            <>
              <p>Existing Image:</p>
              <img src={`http://127.0.0.1:8000${existingImage}`} alt="Existing Employment ID" />
            </>
          ) : (
            <p>No Employment ID uploaded.</p>
          )}
        </div>
        <input
          type="file"
          name="employment_id"
          accept="image/*"
          onChange={handleChange}
        />

        <label>Submitted By:</label>
        <input
          type="text"
          name="submitted_by"
          value={formData.submitted_by}
          onChange={handleChange}
          className={formErrors.submitted_by ? "error-border" : ""}
          placeholder="Your Name"
          required
        />
        {formErrors.submitted_by && <p className="error">{formErrors.submitted_by}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddMember;
