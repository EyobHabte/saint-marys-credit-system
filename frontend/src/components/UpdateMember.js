import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/UpdateMember.css";

const UpdateMemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/members/list/?page=${currentPage}`);
        setMembers(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        setError("Failed to fetch members. Please try again later.");
        toast.error("Failed to fetch members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentPage]);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleUpdateClick = (id) => {
    navigate(`/admin/update-member/${id}`);
  };
  

  return (
    <div className="update-member-list">
      <h1>Update Member</h1>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading members...</p>
      ) : members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <>
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Job Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{`${member.first_name} ${member.last_name}`}</td>
                  <td>{member.email}</td>
                  <td>{member.job_position}</td>
                  <td>
                    <button
                      className="update-button"
                      onClick={() => handleUpdateClick(member.id)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

const UpdateMemberForm = () => {
  const { id } = useParams(); // Assuming the id in URL is actually the username
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    gender: "",
    job_position: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/members/detail-by-id/${id}/`);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching member details:", error.response || error.message);
        toast.error("Failed to fetch member details. Please try again later.");
      }
    };
  
    fetchMemberDetails();
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
  
    const data = new FormData();
  
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "employment_id" && !value) {
        // Skip employment_id if no new file is uploaded
        return;
      }
      data.append(key, value);
    });
  
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/members/update/${id}/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        toast.success("Member updated successfully!");
        setTimeout(() => navigate("/update-member"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const backendErrors = err.response.data;
        const updatedFieldErrors = {};
  
        for (const field in backendErrors) {
          updatedFieldErrors[field] = backendErrors[field].join(", ");
        }
  
        setFieldErrors(updatedFieldErrors);
        toast.error("Validation failed. Please check your input.");
      } else {
        toast.error("Failed to update member. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };  
    
  
  return (
    <div className="update-member-form">
      <h1>Update Member</h1>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <label>Last Name:</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

        <label>Phone Number:</label>
        <input
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />

        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label>Job Position:</label>
        <select name="job_position" value={formData.job_position} onChange={handleChange} required>
          <option value="">Select Job Position</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Administrative Staff">Administrative Staff</option>
          <option value="Technical Staff">Technical Staff</option>
          <option value="Support Staff">Support Staff</option>
        </select>

        <label>Employment ID:</label>
        <input
          type="file"
          name="employment_id"
          accept="image/*"
          onChange={handleChange}
        />
        {fieldErrors.employment_id && <p className="field-error">{fieldErrors.employment_id}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export { UpdateMemberList, UpdateMemberForm };

