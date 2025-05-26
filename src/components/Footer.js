import React from 'react';
import '../styles/Footer.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 UNIVO • {t('footer_rights')}</p>
        <div className="footer-links">
          <a href="/about">{t('footer_about')}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
