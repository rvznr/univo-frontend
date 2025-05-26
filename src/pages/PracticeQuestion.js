import React, { useEffect, useState } from 'react';
import '../styles/PracticeQuestion.css';
import { useParams } from 'react-router-dom';

function PracticeQuestion() {
  const { topic } = useParams(); 
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuestion = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedAnswer(null);
    setFeedback(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/generate-question?topic=${encodeURIComponent(topic)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      const correctKey = data.correct_answer?.toLowerCase();

      setQuestionData({
        ...data,
        correctKey
      });
    } catch (err) {
      console.error("❌ Fehler beim Laden der Frage:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleAnswer = (key) => {
    if (!questionData || selectedAnswer) return;

    setSelectedAnswer(key);
    const isCorrect = key.toLowerCase() === questionData.correctKey;

    if (isCorrect) {
      setFeedback('✅ Richtig!');
    } else {
      const correctText = questionData.options[questionData.correctKey];
      setFeedback(`❌ Falsch! Die richtige Antwort ist: ${correctText}`);
    }
  };

  if (loading || !questionData) {
    return (
      <div className="practice-box loading">
        <div className="skeleton-question" />
        <ul className="skeleton-options">
          <li className="skeleton-option" />
          <li className="skeleton-option" />
          <li className="skeleton-option" />
          <li className="skeleton-option" />
        </ul>
      </div>
    );
  }

  return (
    <div className="practice-box">
      <h2>🧠 Praktische Übung</h2>
      <p><strong>{questionData.topic}</strong></p>
      <p className="question-text">{questionData.question}</p>
      <ul className="option-list">
        {Object.entries(questionData.options).map(([key, text]) => (
          <li
            key={key}
            className={`option-item ${
              selectedAnswer
                ? key.toLowerCase() === questionData.correctKey
                  ? 'correct'
                  : key === selectedAnswer
                  ? 'incorrect'
                  : 'disabled'
                : ''
            }`}
            onClick={() => handleAnswer(key)}
          >
            {key.toUpperCase()}) {text}
          </li>
        ))}
      </ul>
      {feedback && <p className="feedback-text">{feedback}</p>}
      <button className="new-question-btn" onClick={fetchQuestion}>🔁 Neue Frage</button>
    </div>
  );
}

export default PracticeQuestion;
