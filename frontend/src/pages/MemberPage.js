// src/pages/MemberPage.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import MemberSidebar from '../components/MemberSidebar';
import MemberHeader from '../components/MemberHeader';
import '../styles/MemberPage.css';

const MemberPage = () => {
  return (
    <div className="member-app-container">
      <div className="sidebar-container">
        <MemberSidebar />
      </div>
      <div className="main-container">
        <div className="header-container">
          <MemberHeader />
        </div>
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MemberPage;
