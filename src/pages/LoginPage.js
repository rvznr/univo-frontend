import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const { access_token } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        console.log("✅ Token gespeichert:", access_token);
        navigate('/dashboard');
      } else {
        setError(t('login_failed_token'));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || t('login_failed_generic'));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={require('../image/logo.png')} alt="Logo" className="logo-img" />
        </div>
        <h2>{t('login_title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('email_label')}</label>
            <input
              type="email"
              placeholder={t('email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('password_label')}</label>
            <input
              type="password"
              placeholder={t('password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">
            {t('login_button')}
          </button>
        </form>

        <div className="other-options">
          <Link to="/signup" className="signup-link">
            {t('no_account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
