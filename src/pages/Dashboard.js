import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import BadgeDisplay from '../components/BadgeDisplay';
//import XPProgressBar from '../components/XPProgressBar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import '../i18n';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const Dashboard = () => {
  const { t } = useTranslation();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedModules, setCompletedModules] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ label: 'XP', data: [], backgroundColor: [] }] });
  const [quizData, setQuizData] = useState([]);
  const [classXPData, setClassXPData] = useState({ labels: [], datasets: [{ label: 'XP', data: [], backgroundColor: [] }] });
  const [userName, setUserName] = useState('');
  const [badges, setBadges] = useState([]);
  const [xpDetail, setXpDetail] = useState({ notes_xp: 0, exercise_xp: 0, feedback_xp: 0, quiz_xp: 0, total_xp: 0 });
  const [error, setError] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchAIRecommendations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
           "Authorization": `Bearer ${token}`,
           "Content-Type": "application/json"
        },
        body: JSON.stringify({}) 
      });

      const data = await res.json();
      setAiRecommendations(data.recommendations || []);
      console.log("🧠 AI RECOMMENDATIONS:", data.recommendations);

    } catch (err) {
      console.error('❌ AI recommendation error:', err);
      setAiRecommendations([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchAllData = async () => {
      try {
        const [xpRes, userRes, progressRes, badgesRes, quizRes, classXPRes, detailRes] = await Promise.all([
          fetch(`${API_URL}/api/user/xp`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/auth/me`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/user/progress/summary`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/user/badges`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/quizresults`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/user/xp/class`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/user/xp/detail`, { headers: getAuthHeaders() })
        ]);

        const xpData = await xpRes.json();
        setXp(xpData.total_xp || 0);
        setLevel(Math.floor((xpData.total_xp || 0) / 100) + 1);

        const userData = await userRes.json();
        setUserName(userData.name || '');

        const progressData = await progressRes.json();
        setCompletedModules(progressData.completed_modules || 0);

        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);

        let quizJson;
        try {
          quizJson = await quizRes.json();
        } catch (e) {
          console.error("⚠️ quizresults JSON parse error:", e);
          quizJson = [];
        }
        if (!Array.isArray(quizJson)) {
          console.warn("⚠️ quizresults is not an array:", quizJson);
          quizJson = [];
        }
        setQuizData(quizJson);
        setChartData({
          labels: quizJson.map((q, i) => `Quiz ${i + 1}`),
          datasets: [{
            label: 'XP',
            data: quizJson.map(q => Math.round(q.xp)),
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
            borderRadius: 8,
            barThickness: 40
          }]
        });

        const classData = await classXPRes.json();
        setClassXPData({
          labels: classData.data.map((item, i) =>
            item.user_id === classData.current_user_id ? t('you_label') : `${t('user')} ${i + 1}`
          ),
          datasets: [{
            label: t('total_xp_label'),
            data: classData.data.map(item => item.total_xp),
            backgroundColor: classData.data.map(item =>
              item.user_id === classData.current_user_id ? '#2d709f' : '#60a5fa'
            ),
            borderRadius: 6,
            barThickness: 30
          }]
        });

        const xpDetailData = await detailRes.json();
        setXpDetail(xpDetailData);

        fetchAIRecommendations();
      } catch (err) {
        console.error("❌ Dashboard data error:", err);
        setError(t('dashboard_error'));
      }
    };

    fetchAllData();
  }, [API_URL]);

  useEffect(() => {
    if (xp > 0 && completedModules >= 0) {
      fetchAIRecommendations();
    }
  }, [xp, completedModules]);

  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="h2-dashboard">
        {userName ? t("dashboard_of", { name: userName.toUpperCase() }) : t("dashboard_title")}
      </h2>


      <div className="dashboard-cards">
        <div className="dashboard-card xp-card">
          <h3 className="card-title">{t("xp_overview")}</h3>
          <p>{t("total_xp", { count: xpDetail.total_xp })}</p>
          <div className="xp-breakdown-bar">
            <div className="xp-part notes" style={{ width: `${(xpDetail.notes_xp / xpDetail.total_xp) * 100 || 0}%` }} />
            <div className="xp-part exercises" style={{ width: `${(xpDetail.exercise_xp / xpDetail.total_xp) * 100 || 0}%` }} />
            <div className="xp-part feedback" style={{ width: `${(xpDetail.feedback_xp / xpDetail.total_xp) * 100 || 0}%` }} />
            <div className="xp-part quiz" style={{ width: `${(xpDetail.quiz_xp / xpDetail.total_xp) * 100 || 0}%` }} />
          </div>
        </div>

        <div className="dashboard-card completed-modules-card">
          <h3 className="card-title">{t("completed_modules")}</h3>
          <p>{t("modules_completed", { count: completedModules })}</p>
        </div>

        <div className="level-card">
          <span className="level-number">{t("level_label", { level })}</span>
        </div>
      </div>

      <div className="badge-section">
        <h3 className="card-title">{t("earned_badges")}</h3>
        <div className="badge-scroll-container">
          <BadgeDisplay earnedBadgeIds={badges.map(b => b.badge_id)} />
        </div>
      </div>

      <div className="personalized-tips">
        <h3 className="h3-dashboard">{t("ai_recommendations")}</h3>
        <div className="tips-list vertical-ai-box">
  {aiRecommendations.length ? aiRecommendations.map((rec, idx) => (
    <div className="tip-item-compact" key={idx}>
      <h4>{rec.title}</h4>
      <p>{rec.description}</p>
      
    </div>
  )) : (
    <div>{t("ai_loading")}</div>
  )}
</div>

      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3 className="h3-chart">{t("quiz_xp_title")}</h3>
          {quizData.length ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 60 } }
              }}
            />
          ) : (
            <div className="chart-placeholder">{t("quiz_xp_placeholder")}</div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="h3-chart">{t("class_xp_title")}</h3>
          {classXPData.datasets.length ? (
            <Bar
              data={classXPData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          ) : (
            <div className="chart-placeholder">{t("class_xp_placeholder")}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
