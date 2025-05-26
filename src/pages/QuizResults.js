import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/QuizResults.css';
import ReactMarkdown from 'react-markdown';

function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const [explanations, setExplanations] = useState({});
  const [quizData, setQuizData] = useState(null);
  const [resultsReady, setResultsReady] = useState(false);

  useEffect(() => {
    const state = location.state;
    const completed = JSON.parse(localStorage.getItem("completedQuizzes") || "[]");

    async function fetchFromBackend(quizId) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.results?.length) {
          setQuizData({
            quizId,
            detailedResults: data.results,
            total: data.results.length,
            alreadyCompleted: true
          });
          setResultsReady(true);
        }
      } catch (err) {
        console.error("❌ Backend result fetch error", err);
      }
    }

    if (state?.detailedResults?.length) {
      const quizId = state.detailedResults[0]?.quizId || state.quizId;
      const xp = Math.min(
        state.detailedResults.filter((item) => item.isCorrect).length * 15,
        30
      );

      const alreadyExists = completed.some((q) => q.quizId === quizId);
      if (quizId && !alreadyExists) {
        completed.push({ quizId, xp, results: state.detailedResults });
        localStorage.setItem("completedQuizzes", JSON.stringify(completed));
      }

      setQuizData({
        ...state,
        total: state.detailedResults.length,
        alreadyCompleted: state.alreadyCompleted || false
      });
      setResultsReady(true);
    } else if (state?.quizId) {
      const storedQuiz = completed.find((q) => q.quizId === state.quizId);
      if (storedQuiz?.results?.length) {
        setQuizData({
          total: storedQuiz.results.length,
          detailedResults: storedQuiz.results,
          alreadyCompleted: true
        });
        setResultsReady(true);
      } else {
        fetchFromBackend(state.quizId);
      }
    } else {
      console.warn("📛 QuizResults fallback başarısız: state veya quizId yok.");
    }
  }, [location.state]);

  useEffect(() => {
    if (resultsReady && quizData?.detailedResults?.length) {
      const updated = {};
      for (const item of quizData.detailedResults) {
        if (item.explanation) {
          updated[item.question] = item.explanation;
        }
      }
      setExplanations(updated);
    }
  }, [resultsReady, quizData?.detailedResults]);

  if (!resultsReady || !quizData) {
    return <div className="quiz-result">⚠️ Ergebnisdaten nicht gefunden.</div>;
  }

  const { total, detailedResults, alreadyCompleted } = quizData;
  const score = detailedResults.filter((item) => item.isCorrect).length;
  const xp = Math.min(score * 15, 30);
  const isSuccess = score >= total / 2;

  return (
    <div className="quiz-result">
      {alreadyCompleted && (
        <div className="info-box">
          📌 Du hast dieses Quiz bereits absolviert. Hier sind deine gespeicherten Ergebnisse:
        </div>
      )}

      <h2>{isSuccess ? '🏆 Gute Arbeit!' : '✨ Weiter so!'}</h2>
      <p>✅ Richtige Antworten: <strong>{score} / {total}</strong></p>
      <div className="xp-earned-box">
        <span className="xp-icon">⭐</span> Verdientes XP: {xp}
      </div>

      <div className="result-details">
        <h3>📋 Deine Antworten:</h3>
        <table className="result-table">
          <thead>
            <tr>
              <th>Frage</th>
              <th>Deine Antwort</th>
              <th>Richtige Antwort</th>
              <th>Bewertung</th>
            </tr>
          </thead>
          <tbody>
            {detailedResults.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr className={item.isCorrect ? 'correct-row' : 'wrong-row'}>
                  <td>{item.question}</td>
                  <td>{item.selectedAnswer || <span style={{ color: '#999' }}>Keine Antwort</span>}</td>
                  <td>{item.correctAnswer || <span style={{ color: '#999' }}>Keine richtige Antwort</span>}</td>
                  <td>{item.isCorrect ? "✅" : "❌"}</td>
                </tr>
                {explanations[item.question] && (
                  <tr className="explanation-row">
                    <td colSpan="4" className="explanation-cell">
                      🧠 Erklärung:
                      <ReactMarkdown>{explanations[item.question]}</ReactMarkdown>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="result-buttons">
        <button onClick={() => navigate('/quizselection')}>🔁 Quiz Seite</button>
        <button onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
      </div>
    </div>
  );
}

export default QuizResults;
