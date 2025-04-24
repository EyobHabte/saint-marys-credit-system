// Example: in AdminTotalFunds.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminTotalFunds = () => {
  const [funds, setFunds] = useState(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/balance/calculate/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFunds(response.data.total_funds);
      } catch (error) {
        console.error("Error fetching total funds:", error.response || error.message);
        toast.error("Failed to fetch total funds.");
      }
    };

    fetchFunds();
  }, []);

  return (
    <div>
      <h3>Total Funds</h3>
      {funds !== null ? <p>{funds} ETB</p> : <p>Loading...</p>}
    </div>
  );
};

export default AdminTotalFunds;
