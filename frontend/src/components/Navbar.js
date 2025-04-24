// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <Link className="navbar-brand" to="/">CSMS</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/account">Account</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/loan">Loan</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/savings">Savings</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/reports">Reports</Link></li>
        </ul>
        <button className="btn btn-outline-danger my-2 my-sm-0" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
