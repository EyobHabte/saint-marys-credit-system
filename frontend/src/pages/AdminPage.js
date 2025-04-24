// src/pages/AdminPage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/AdminPage.css';

const AdminPage = () => {
  return (
    <div className="app-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="main-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
