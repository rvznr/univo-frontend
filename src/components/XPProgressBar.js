import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/XPProgressBar.css';

const XPProgressBar = () => {
  const [xp, setXP] = useState(0);
  const [goal, setGoal] = useState(500); // Örnek hedef XP
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/user/xp', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setXP(res.data.total_xp);
        setPercent((res.data.total_xp / goal) * 100);
      })
      .catch(err => console.error("XP Progress Bar Error:", err));
      }, []);

  return (
    <div className="xp-progress-container">
      <div className="xp-progress-bar-bg">
        <div className="xp-progress-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default XPProgressBar;
