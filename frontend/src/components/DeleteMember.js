import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import "../styles/DeleteMember.css";

const DeleteMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMembers = async (page = 1) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/members/list/?page=${page}`);
        setMembers(response.data.results); // Use the paginated results
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming page size is 10
      } catch (err) {
        toast.error("Failed to fetch members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/members/delete/${id}/`);
      setMembers(members.filter((member) => member.id !== id));
      toast.success("Member deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete member. Please try again.");
    }
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="delete-member">
      <h1>Delete Member</h1>
      <ToastContainer /> {/* Add ToastContainer */}
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
                      className="delete-button"
                      onClick={() => handleDelete(member.id)}
                    >
                      Delete
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
    </div>
  );
};

export default DeleteMember;
