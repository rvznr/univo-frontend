import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../image/logo.png';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const [menuActive, setMenuActive] = useState(false);
  const token = localStorage.getItem('token'); 

  if (!token) return null;

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <nav className={`navbar ${menuActive ? 'active' : ''}`}>
      <div className="logo">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        <span className="material-icons">menu</span>
      </div>

      <ul className={`navbar-links ${menuActive ? 'active' : ''}`}>
        <li>
          <Link to="/dashboard">
            <span className="material-icons">dashboard</span>
            <span className="navbar-text">{t('nav_dashboard')}</span>
          </Link>
        </li>
        <li>
          <Link to="/learnhub">
            <span className="material-icons">school</span>
            <span className="navbar-text">{t('nav_learnhub')}</span>
          </Link>
        </li>
        <li>
          <Link to="/quizselection">
            <span className="material-icons">quiz</span>
            <span className="navbar-text">{t('nav_quiz')}</span>
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <span className="material-icons">account_circle</span>
            <span className="navbar-text">{t('nav_profile')}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
