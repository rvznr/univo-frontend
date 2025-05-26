import React, { useEffect, useState } from 'react';
import '../styles/Review.css';
import ReactMarkdown from 'react-markdown';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const Review = () => {
  const [topicTitle, setTopicTitle] = useState('');
  const [topicExplanation, setTopicExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/ai/topic-explanation`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (!res.ok || !data.explanation) {
        setError("❌ Erklärung konnte nicht geladen werden.");
      } else {
        setTopicTitle(data.topic);
        setTopicExplanation(data.explanation);
      }
    } catch (err) {
      setError("❌ Verbindung fehlgeschlagen.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExplanation();
  }, []);

  return (
    <div className="review-page">
      <h2 className="review-title">📘 Thema: {topicTitle || "..."}</h2>

      {loading && <p>⏳ Wird geladen...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
  <div className="review-content markdown-body">
    <ReactMarkdown>{topicExplanation}</ReactMarkdown>
  </div>
)}

      <button className="refresh-ai-btn" onClick={fetchExplanation}>
        🔁 Erklärung neu laden
      </button>
    </div>
  );
};

export default Review;
