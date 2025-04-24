import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ViewAccount.css';

const ViewAccount = () => {
    const [accounts, setAccounts] = useState([]); // Ensure initial state is an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/accounts/list/?page=${currentPage}`);
                // Directly set the accounts from the response
                setAccounts(response.data); // Use response.data directly since it's an array
                setTotalPages(Math.ceil(response.data.length / 10)); // Assuming page size is 10
            } catch (err) {
                console.error("Error fetching accounts:", err); // Log the error for debugging
                setError("Failed to fetch accounts.");
                toast.error("Failed to fetch accounts.");
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [currentPage]);

    const handlePageChange = (direction) => {
        if (direction === "next" && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === "prev" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="view-account-container">
            <h2>View Accounts</h2>
            {loading ? (
                <p>Loading accounts...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <table className="accounts-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Account Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.length > 0 ? (
                            accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.username}</td>
                                    <td>{account.first_name}</td>
                                    <td>{account.last_name}</td>
                                    <td>{account.email}</td>
                                    <td>{account.phone_number}</td>
                                    <td>{account.account_type}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No accounts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            <div className="pagination">
                <button onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={() => handlePageChange("next")} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ViewAccount;