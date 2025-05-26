import React from 'react';
import '../styles/About.css';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about">
      <div className="about-container">
        <div className="about-box">
          <h2>{t("about_title")}</h2>
          <hr />
          <p>{t("about_paragraph1")}</p>
          <p>{t("about_paragraph2")}</p>

          <div className="vision-mission">
            <div className="vision">
              <h3>{t("our_vision")}</h3>
              <p>{t("vision_text")}</p>
            </div>
            <div className="mission">
              <h3>{t("our_mission")}</h3>
              <p>{t("mission_text")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
