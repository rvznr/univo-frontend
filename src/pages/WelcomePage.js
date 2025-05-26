import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/WelcomePage.css';
import { useTranslation } from 'react-i18next';

const WelcomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="welcome-container">
      <video autoPlay loop muted>
        <source src={require('../image/welcome.mp4')} type="video/mp4" />
      </video>

      <div className="button-container">
        <Link to="/login" className="welcome-btn">{t('login_button')}</Link>
        <Link to="/signup" className="welcome-btn">{t('register_button')}</Link>
      </div>
    </div>
  );
};

export default WelcomePage;
