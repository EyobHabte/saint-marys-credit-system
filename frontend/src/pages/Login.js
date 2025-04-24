// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/Login.module.css"; // CSS Modules import
import { toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/accounts/login/', {
        username,
        password,
      });

      if (response.data?.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);

        // Decode the JWT token to extract payload data.
        const payload = JSON.parse(atob(response.data.access.split('.')[1]));

        // Store userId in localStorage.
        // Adjust the property name if your token uses a different key (e.g., "user_id" or "id").
        if (payload.user_id) {
          localStorage.setItem('userId', payload.user_id);
        } else if (payload.id) { // Fallback in case the property is named "id"
          localStorage.setItem('userId', payload.id);
        }

        const role = payload.role;

        toast.success('Login successful!');

        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'finance_officer') {
          navigate('/dashboard');
        } else if (role === 'member') {
          localStorage.setItem('username', username);
          navigate('/member');
        } else {
          navigate('/');
        }
      } else {
        throw new Error('Invalid login response from server.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Invalid username or password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <input
            type="text"
            id="username"
            className={styles.formControl}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            id="password"
            className={styles.formControl}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={`${styles.loginBtn} btn-primary`} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/register" className={styles.link}>Register here</a>
      </p>
    </div>
  );
}

export default Login;
