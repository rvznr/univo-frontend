import React, { useEffect, useState } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', schoolId: '', gender: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [editMode, setEditMode] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(t('unauthorized'));
        return res.json();
      })
      .then(data => {
        setFormData({ name: data.name, email: data.email, schoolId: data.schoolId, gender: data.gender });
      })
      .catch(err => {
        console.error(t('fetch_user_error'), err);
        localStorage.clear();
        navigate('/');
      });
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const saveChanges = () => {
    if (passwordData.oldPassword && passwordData.newPassword === passwordData.confirmPassword) {
      console.log('Password update:', passwordData);
    } else {
      alert(t('password_mismatch'));
      return;
    }
    console.log('Updated info:', formData);
    setEditMode(false);
  };

  const submitFeedback = async () => {
    if (feedback.trim() === '') return;
    setFeedbackStatus(t('sending'));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        { message: feedback },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      alert(t('feedback_thanks'));
      setFeedback('');
      setFeedbackStatus('');
    } catch (err) {
      console.error(t('feedback_error'), err);
      alert(err.response?.data?.error || t('feedback_error_default'));
      setFeedbackStatus('');
    }
  };

  const getAvatar = () => {
    const gender = (formData.gender || '').toLowerCase();
    if (gender === 'weiblich' || gender === 'female') return '/image/female-icon.png';
    if (gender === 'männlich' || gender === 'male') return '/image/male-icon.png';
    return '/image/non-binary-icon.png';
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img src={getAvatar()} alt="Profil" className="profile-avatar" />

        {editMode ? (
          <>
            <input name="name" value={formData.name} onChange={handleChange} placeholder={t('name')} />
            <input name="email" value={formData.email} onChange={handleChange} placeholder={t('email')} />
            <input name="schoolId" value={formData.schoolId} onChange={handleChange} placeholder={t('student_id')} />
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Weiblich">{t('female')}</option>
              <option value="Männlich">{t('male')}</option>
              <option value="Keine Angabe">{t('no_specify')}</option>
            </select>
            <hr />
            <h3>🔐 {t('update_password')}</h3>
            <input name="oldPassword" type="password" placeholder={t('old_password')} value={passwordData.oldPassword} onChange={handlePasswordChange} />
            <input name="newPassword" type="password" placeholder={t('new_password')} value={passwordData.newPassword} onChange={handlePasswordChange} />
            <input name="confirmPassword" type="password" placeholder={t('confirm_new_password')} value={passwordData.confirmPassword} onChange={handlePasswordChange} />
            <button className="logout-btn" onClick={saveChanges}>📀 {t('save_changes')}</button>
          </>
        ) : (
          <>
            <p><strong>{t('full_name')}:</strong> {formData.name}</p>
            <p><strong>{t('email')}:</strong> {formData.email}</p>
            <p><strong>{t('student_id')}:</strong> {formData.schoolId}</p>
            <p><strong>{t('gender')}:</strong> {formData.gender}</p>
            <button className="logout-btn" onClick={() => setEditMode(true)}>✏️ {t('edit')}</button>
          </>
        )}

        <button className="logout-btn" onClick={handleLogout}>🚪 {t('logout')}</button>
      </div>

<div className="feedback-section">
  <h2>🗣️ {t('feedback')}</h2>
  <p style={{ fontSize: '14px', color: '#4caf50', marginBottom: '6px' }}>
    💡 {t('feedback_bonus_info')}
  </p>
  <textarea
    placeholder={t('feedback_placeholder')}
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
  />
  <button
    className="logout-btn"
    onClick={submitFeedback}
    disabled={feedbackStatus === t('sending')}
  >
    ✉️ {feedbackStatus || t('send_feedback')}
  </button>
</div>
    </div>
  );
}

export default Profile;
