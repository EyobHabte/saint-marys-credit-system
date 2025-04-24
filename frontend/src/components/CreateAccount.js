import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CreateAccount.css';

const CreateAccount = () => {
  const [form, setForm] = useState({
    account_type: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isUsernameSelected, setIsUsernameSelected] = useState(false);

  const isAccountTypeSelected =
    form.account_type === 'admin' || form.account_type === 'finance_officer' || form.account_type === 'member';

  useEffect(() => {
    if (form.account_type === 'member') {
      setIsMember(true);
      fetchAllMembers();
    } else {
      setIsMember(false);
      setIsUsernameSelected(false);
    }
  }, [form.account_type]);

  const fetchAllMembers = async () => {
    let allMembers = [];
    let currentPage = 1;
    let hasNextPage = true;

    try {
      while (hasNextPage) {
        const response = await axios.get(`http://127.0.0.1:8000/api/members/list/`, {
          params: { page: currentPage },
        });
        allMembers = [...allMembers, ...response.data.results];
        hasNextPage = !!response.data.next; // Check if there's a next page
        currentPage += 1;
      }
      setMembers(allMembers);
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to fetch member data.');
    }
  };

  const handleAccountTypeChange = (e) => {
    const value = e.target.value;
    setForm({
      account_type: value,
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    });
    setIsUsernameSelected(false);
    setErrors({});
  };

  const handleUsernameChange = async (e) => {
    const selectedUsername = e.target.value.trim(); // Ensure no extra spaces
    setForm((prevForm) => ({ ...prevForm, username: selectedUsername }));

    if (selectedUsername) {
        setIsUsernameSelected(true);

        try {
            // Fetch member details from Member table
            const memberResponse = await axios.get(
                `http://127.0.0.1:8000/api/members/detail-by-username/${selectedUsername}/`
            );
            const memberData = memberResponse.data;

            setForm((prevForm) => ({
                ...prevForm,
                first_name: memberData.first_name,
                last_name: memberData.last_name,
                email: memberData.email,
                phone_number: memberData.phone_number,
            }));

            // Fetch password from MemberRequest table if available
            try {
                const passwordResponse = await axios.get(
                    `http://127.0.0.1:8000/member-registration/fetch-encrypted-password/${selectedUsername}/`
                );
                const passwordData = passwordResponse.data;

                if (passwordData?.encrypted_password) {
                    setForm((prevForm) => ({
                        ...prevForm,
                        password: passwordData.encrypted_password,
                    }));
                    toast.success("All fields autofilled successfully.");
                } else {
                    setForm((prevForm) => ({ ...prevForm, password: '' }));
                    toast.info("No password found for this username. Other fields autofilled.");
                }
            } catch (err) {
                setForm((prevForm) => ({ ...prevForm, password: '' }));
                toast.info("No password found for this username. Other fields autofilled.");
            }
        } catch (err) {
            toast.error("Failed to fetch member details.");
            setForm((prevForm) => ({
                ...prevForm,
                first_name: '',
                last_name: '',
                email: '',
                phone_number: '',
                password: '',
            }));
        }
    } else {
        setIsUsernameSelected(false);
        setForm((prevForm) => ({
            ...prevForm,
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            password: '',
        }));
    }
};
    
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        await axios.post('http://127.0.0.1:8000/api/accounts/create/', form);
        toast.success('Account created successfully!');
        setForm({
            account_type: '',
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
        });
    } catch (err) {
        if (err.response && err.response.data.errors) {
            const backendErrors = err.response.data.errors;
            for (const field in backendErrors) {
                toast.error(`${field}: ${backendErrors[field][0]}`);
            }
        } else {
            toast.error('Failed to create account. Please try again.');
        }
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className="create-account-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <select name="account_type" value={form.account_type} onChange={handleAccountTypeChange} required>
            <option value="">Select Account Type</option>
            <option value="admin">Admin</option>
            <option value="finance_officer">Finance Officer</option>
            <option value="member">Member</option>
          </select>
          <label>Account Type</label>
        </div>

        {isMember && (
          <div className="form-group">
            <select
              name="username"
              value={form.username}
              onChange={handleUsernameChange}
              disabled={!isAccountTypeSelected}
              required
            >
              <option value="">Select Username</option>
              {members.map((member) => (
                <option key={member.id} value={member.username}>
                  {member.username}
                </option>
              ))}
            </select>
            <label>Username</label>
          </div>
        )}

        {!isMember && (
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!isAccountTypeSelected}
              required
            />
            <label>Username</label>
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            disabled={!isAccountTypeSelected || (isMember && !isUsernameSelected)}
            required
          />
          <label>First Name</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            disabled={!isAccountTypeSelected || (isMember && !isUsernameSelected)}
            required
          />
          <label>Last Name</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!isAccountTypeSelected || (isMember && !isUsernameSelected)}
            required
          />
          <label>Email</label>
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            disabled={!isAccountTypeSelected || (isMember && !isUsernameSelected)}
            required
          />
          <label>Phone Number</label>
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={!isAccountTypeSelected || (isMember && !isUsernameSelected)}
            required={!isMember || isUsernameSelected}
          />
          <label>Password</label>
        </div>

        <button type="submit" className="create-btn" disabled={!isAccountTypeSelected || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateAccount;
