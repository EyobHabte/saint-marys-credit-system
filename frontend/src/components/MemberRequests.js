// src/components/MemberRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/MemberRequests.css";

const MemberRequests = ({ updateNotificationCount }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchRequests = async (page) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/member-registration/member-requests/?page=${page}&per_page=5`
      );
      setRequests(response.data.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.count / 5));
      if (updateNotificationCount) {
        updateNotificationCount(response.data.count);
      }
    } catch (err) {
      console.error("Error fetching member requests:", err.response || err.message);
      setError("Unable to fetch member requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  // Updated navigation to include '/admin'
  const handleViewDetails = (id) => {
    navigate(`/admin/member-requests/${id}`);
  };
  

  return (
    <div className="member-requests">
      <h1>Member Requests</h1>
      {loading ? (
        <p>Loading member requests...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <table className="requests-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Submitted Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{`${request.first_name} ${request.last_name}`}</td>
                  <td>
                    {request.submitted_at
                      ? new Date(request.submitted_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="view-details-button"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberRequests;
