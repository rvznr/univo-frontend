import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/QuizSelection.css';
import { useTranslation } from 'react-i18next';

function QuizSelection() {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [completedServerQuizzes, setCompletedServerQuizzes] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/quiz/quizzes`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const quizList = await res.json();
        setQuizzes(quizList);

        const token = localStorage.getItem('token');
        const completedRes = await fetch(`${API_URL}/api/quizresults`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const completedData = await completedRes.json();

        const completedMap = {};
        completedData.forEach(q => {
          completedMap[q.quiz_id] = q;
        });
        setCompletedServerQuizzes(completedMap);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const startQuiz = (quizId) => {
    if (completedServerQuizzes[quizId]) {
      navigate('/quizresults', { state: { quizId } });
    } else {
      navigate('/quiz', { state: { quizId } });
    }
  };

  return (
    <div className="quiz-selection">
      <h1>{t('quiz_selection_title')}</h1>
      <p className="quiz-info" dangerouslySetInnerHTML={{ __html: t('quiz_selection_description') }} />

      {loading ? (
        <p>{t('quiz_loading')}</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz, index) => {
            const isCompleted = !!completedServerQuizzes[quiz.quiz_id];
            const xp = isCompleted ? completedServerQuizzes[quiz.quiz_id]?.xp : null;

            return (
              <div className="quiz-card" key={quiz.quiz_id}>
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                </div>

                <ul className="topic-list">
                  <li>{index < 3 ? `${t('quiz_module', { number: index + 1 })}` : t('quiz_mixed_topics')}</li>
                </ul>

                {isCompleted ? (
                  <>
                    <div className="xp-info">{t('xp_earned', { xp })}</div>
                    <button
                      className="results-btn"
                      onClick={() => navigate('/quizresults', { state: { quizId: quiz.quiz_id } })}
                    >
                      {t('quiz_results')}
                    </button>
                  </>
                ) : (
                  <button
                    className="start-btn"
                    onClick={() => startQuiz(quiz.quiz_id)}
                  >
                    {t('quiz_start')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuizSelection;
