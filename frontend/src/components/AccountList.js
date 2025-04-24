import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AccountList.css';

const AccountList = () => {
    const navigate = useNavigate();
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

    const handleUpdateClick = (id) => {
        navigate(`/update-account/${id}`); // Navigate to the update account page with the account ID
    };

    return (
        <div className="account-list-container">
            <h2>Account List</h2>
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
                                <td>{account.account_type}</td>
                                <td>
                                    <button onClick={() => handleUpdateClick(account.id)}>Update</button>
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

export default AccountList;