import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css'

const HomePage = () => {
  return (
    <div className="home">
      <h2>Welcome!</h2>
      <p>Start your journey for a more efficient learning experience on our platform.</p>
      <div>
        <Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}

export default HomePage;
