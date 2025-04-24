// src/components/MemberLoanPage.jsx
import React, { useState } from "react";
import MemberLoan from "./MemberLoan";
import MemberLoanStatus from "./MemberLoanStatus";
import "../styles/MemberLoanPage.css";

const MemberLoanPage = () => {
  const [activeTab, setActiveTab] = useState("apply");

  return (
    <div id="memberLoanPageContainer" className="member-loan-page-container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "apply" ? "active" : ""}`}
          onClick={() => setActiveTab("apply")}
        >
          Apply for Loan
        </button>
        <button
          className={`tab-button ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          Loan Status
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "apply" ? <MemberLoan /> : <MemberLoanStatus />}
      </div>
    </div>
  );
};

export default MemberLoanPage;
