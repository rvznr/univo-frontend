import React, { useState, useEffect } from 'react';
import '../styles/LearnHub.css';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';

function LearnHub() {
  const { t } = useTranslation();
  const [modulesData, setModulesData] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [showConfetti] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [sortType, setSortType] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModulesAndProgress = async () => {
      const token = localStorage.getItem('token');
      try {
        const [modRes, progressRes] = await Promise.all([
        api.get('/api/modules', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/user/progress/mine', { headers: { Authorization: `Bearer ${token}` } })

        ]);

        setModulesData(modRes.data);

        const totalLearnXP = progressRes.data.reduce((acc, p) => {
          return acc + (p.xp_from_notes || 0) + (p.xp_from_exercises || 0);
        }, 0);

        setTotalXP(totalLearnXP);
      } catch (err) {
        console.error("❌ Error fetching modules or progress:", err);
      }
    };

    fetchModulesAndProgress();
  }, []);

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sortedModules = [...modulesData];
  if (sortType === 'most') {
    sortedModules.sort((a, b) => {
      const xpA = (a.user_progress?.xp_from_notes || 0) + (a.user_progress?.xp_from_exercises || 0);
      const xpB = (b.user_progress?.xp_from_notes || 0) + (b.user_progress?.xp_from_exercises || 0);
      return xpB - xpA;
    });
  } else if (sortType === 'least') {
    sortedModules.sort((a, b) => {
      const xpA = (a.user_progress?.xp_from_notes || 0) + (a.user_progress?.xp_from_exercises || 0);
      const xpB = (b.user_progress?.xp_from_notes || 0) + (b.user_progress?.xp_from_exercises || 0);
      return xpA - xpB;
    });
  }

  const handleXPPostAndGoToNote = (moduleId, noteId) => {
    api.post('/user/xp/note', { module_id: moduleId })
      .then(() => {
        setTimeout(() => {
          navigate(`/note/${noteId}`);
        }, 300);
      })
      .catch(err => console.error("❌ Failed to save XP:", err));
  };

  return (
    <div className="learnhub">
      <h1>LearnHub</h1>
      <div className="learnhub-info-box">
        {t('learnhub_selection_info_box')}
      </div>

      {showConfetti && <div className="confetti">🎉 Module Completed! +50 XP</div>}

      <div className="sort-container">
        <label htmlFor="sortSelect">{t('sort_by')}:</label>
        <select id="sortSelect" value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="default">{t('default')}</option>
          <option value="most">{t('most_completed')}</option>
          <option value="least">{t('least_completed')}</option>
        </select>
      </div>

      <div className="card-container">
        {sortedModules.map((mod, i) => {
          const moduleProgressPercent = mod.user_progress?.percent || 0;

          return (
            <div key={i} className={`module-card ${mod.fullWidth ? 'full-width' : ''}`}>
              {mod.image && (
                <img
                  src={`data:image/png;base64,${mod.image}`}
                  alt={mod.title}
                  className="module-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              <h3>{mod.title}</h3>
              <p>{t('module_progress')}: {moduleProgressPercent}%</p>

              <div className="module-progress-bar">
                <div className="module-progress-fill" style={{ width: `${moduleProgressPercent}%` }}></div>
              </div>

              {!mod.isLocked && (
                <button
                  className={`dropdown-btn ${openIndex === i ? 'active' : ''}`}
                  onClick={() => toggleDropdown(i)}
                >
                  {openIndex === i ? t('hide') : t('notes_and_exercises')}
                </button>
              )}

              {openIndex === i && (
                <ul className="dropdown-list">
                  {mod.notes?.length > 0 && (
                    <li>
                      <button
                        className="note-link"
                        onClick={() => handleXPPostAndGoToNote(mod.id, mod.notes?.[0]?.id)}
                      >
                        📄 {t('lecture_notes')}
                      </button>
                    </li>
                  )}
                  {mod.exercises?.length > 0 && (
                    <li>
                      <button
                        className="note-link"
                        onClick={() => navigate(`/exercise/${mod.id}`)}
                      >
                        🧩 {t('exercises')}
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LearnHub;