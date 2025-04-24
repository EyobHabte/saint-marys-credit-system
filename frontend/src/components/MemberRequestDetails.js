// src/components/MemberRequestDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MemberRequestDetails.css";

const MemberRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/member-registration/member-requests/${id}/`);
      setRequest(response.data);
    } catch (err) {
      console.error("Error fetching request details:", err.response || err.message);
      setError("Unable to fetch member request details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    // Navigate to the Add Member page under /admin and pass state
    navigate("/admin/add-member", { state: { memberDetails: request } });
  };

  const handleReject = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/member-registration/member-requests/${id}/action/`, { action: "reject", reason: rejectReason });
      alert("Request rejected successfully.");
    } catch (err) {
      console.error("Error rejecting request:", err.response || err.message);
      alert("Failed to reject request.");
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  return (
    <div className="member-request-details">
      {loading ? (
        <p className="loading">Loading request details...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h1>Member Request Details</h1>
          <div className="details-card">
            <p><strong>Full Name:</strong> {`${request.first_name} ${request.last_name}`}</p>
            <p><strong>Username:</strong> {request.username}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone Number:</strong> {request.phone_number}</p>
            <p><strong>Gender:</strong> {request.gender}</p>
            <p><strong>Address:</strong> {request.address}</p>
            <p><strong>Employment Type:</strong> {request.employment_type}</p>
            <p><strong>Submitted At:</strong> {new Date(request.submitted_at).toLocaleString()}</p>
            <p><strong>Employment ID:</strong></p>
            <img src={request.employment_id} alt="Employment ID" className="employment-id-image" />
          </div>
          <div className="action-buttons">
            <button className="approve-button" onClick={handleApprove}>Approve</button>
            <button className="reject-button" onClick={() => setShowRejectReason(true)}>Reject</button>
          </div>
          {showRejectReason && (
            <div className="reject-section">
              <textarea placeholder="Enter reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              <button onClick={handleReject}>Submit Rejection</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberRequestDetails;
