import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosConfig';
import '../styles/NotePage.css';

function NotePage() {
  const { t } = useTranslation();
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpSent, setXpSent] = useState(false);
  const [fade, setFade] = useState(true);

  const serverBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    api.get(`/api/notes/${noteId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => setNote(res.data))
      .catch(err => console.error('❌ Failed to fetch note data:', err));
  }, [noteId]);

  const handleNext = () => {
    if (pageIndex < (note.contents?.length || 0) - 1) {
      setFade(false);
      setTimeout(() => {
        setPageIndex(prev => prev + 1);
        setFade(true);
      }, 200);
    } else {
      setIsCompleted(true);
      if (!xpSent) {
        api.post('/user/xp/note', { module_id: note.module_id }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }).then(() => setXpSent(true))
          .catch(err => console.error("📋 Error saving Note XP:", err));
      }
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setFade(false);
      setTimeout(() => {
        setPageIndex(prev => prev - 1);
        setFade(true);
      }, 200);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pageIndex, note]);

  if (!note || !note.contents?.length) {
    return <div className="note-page">{t('note_loading')}</div>;
  }

  const currentPage = note.contents[pageIndex];

  let adjustedContent = currentPage.content;
  if (adjustedContent) {
  adjustedContent = adjustedContent
    .replace(/src="\/static\/images\//g, `src="${serverBaseUrl}/static/images/`)
    .replace(/src="\/api\/images\/(?!by-name)/g, `src="${serverBaseUrl}/api/images/by-name/`)
    .replace(/src="\/(?!\/)/g, `src="${serverBaseUrl}/`);
}


  return (
    <div className="note-layout">
      <aside className="note-sidebar">
        <h4 className="sidebar-title">{t('Themen')}</h4>
        <ul className="sidebar-list">
          {note.contents.map((page, index) => (
            <li
              key={index}
              className={`sidebar-item ${pageIndex === index ? 'active' : ''}`}
              onClick={() => setPageIndex(index)}
            >
              {index + 1}. {page.title}
            </li>
          ))}
        </ul>
      </aside>

      <main className="note-main">
        <div className="note-page">
          <h2>{note.title}</h2>

          <div className="page-header">
            <span className="page-number">
              {t('page_number', { current: pageIndex + 1, total: note.contents.length })}
            </span>
            <h3 className="page-title">{currentPage.title}</h3>
          </div>

          <div className={`note-content ${fade ? 'fade-in' : ''}`}>
            <div dangerouslySetInnerHTML={{ __html: adjustedContent }} />
          </div>

          <div className="note-nav">
            <button className="nav-btn" onClick={handlePrev} disabled={pageIndex === 0}>⬅ {t('back')}</button>
            <button className="nav-btn" onClick={handleNext} disabled={isCompleted}>{t('next')} ➡</button>
          </div>

          {isCompleted && <div className="xp-box">🎉 {t('note_completed')}</div>}
          <button className="back-btn" onClick={() => navigate(-1)}>🔙 {t('return_to_learnhub')}</button>
        </div>
      </main>
    </div>
  );
}

export default NotePage;
