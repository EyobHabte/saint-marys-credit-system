import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/DeleteAccount.css';

const DeleteAccount = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/accounts/list/');
                setAccounts(response.data);
            } catch (err) {
                setError("Failed to fetch accounts.");
                toast.error("Failed to fetch accounts.");
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this account?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/accounts/delete/${id}/`);
            setAccounts(accounts.filter(account => account.id !== id));
            toast.success("Account deleted successfully!");
        } catch (err) {
            toast.error("Failed to delete account.");
        }
    };

    return (
        <div className="delete-account-container">
            <h2>Delete Account</h2>
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
                            <th>Account Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td>{account.username}</td>
                                <td>{account.first_name}</td>
                                <td>{account.last_name}</td>
                                <td>{account.email}</td>
                                <td>{account.account_type}</td>
                                <td>
                                    <button className="delete-button" onClick={() => handleDelete(account.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <ToastContainer />
        </div>
    );
};

export default DeleteAccount;