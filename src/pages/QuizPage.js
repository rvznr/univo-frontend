import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/QuizPage.css';

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const quizId = location?.state?.quizId;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(300);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isPreviouslyCompleted, setIsPreviouslyCompleted] = useState(false);

  const handleAnswerSelect = (questionId, optionKey) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const saveUserAnswer = async (questionId, selectedAnswer) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user_answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          question_id: questionId,
          selected_answer: selectedAnswer,
          quiz_id: quizId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ UserAnswer Save Error:", errorData);
      }
    } catch (err) {
      console.error("❌ Error saving user answer:", err);
    }
  };

  const buildDetailedResults = () => {
    return questions.map(q => {
      const selectedKey = selectedAnswers[q.id];
      const selectedText = selectedKey ? q.options?.[selectedKey] : null;
      const correctKey = q.correct_answer?.toLowerCase();
      const correctText = q.options?.[correctKey];
  
      const isCorrect = selectedKey?.toLowerCase() === correctKey;
  
      return {
        quizId: quizId,
        question: q.question || "(Fragetext fehlt)",
        selectedAnswer: selectedText || "",
        correctAnswer: correctText || "",
        isCorrect
      };
    });
  };
  
  const calculateResultAndSendToBackend = useCallback(async () => {
    if (quizCompleted || isPreviouslyCompleted) return;

    if (!questions.length || !quizId) {
      alert("Soru verisi veya quiz bilgisi eksik!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Token bulunamadı, tekrar giriş yapın!");
      return;
    }

    const topicId = questions[0]?.topic_id;

    try {
      await Promise.all(
        questions.map(q => {
          const selected = selectedAnswers[q.id];
          if (typeof selected !== 'undefined' && selected !== null) {
            return saveUserAnswer(q.id, selected);
          } else {
            console.warn("⚠️ Skipping question:", q.id);
            return Promise.resolve();
          }
        })
      );

      const resultResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/quizresults`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          quiz_id: quizId,
          topic_id: topicId,
          total_questions: questions.length
        })
      });

      if (!resultResponse.ok) {
        throw new Error('Quiz sonucu kaydedilemedi.');
      }

      navigate('/quizresults', { state: { total: questions.length, detailedResults: buildDetailedResults() } });
      setQuizCompleted(true);

    } catch (error) {
      console.error("Quiz sonucu gönderilemedi:", error);
      alert("Quiz sonucu gönderilirken hata oluştu.");
    }
  }, [quizCompleted, questions, selectedAnswers, quizId, navigate, isPreviouslyCompleted]);

  useEffect(() => {
    if (!quizId) return;

    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/iscompleted`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.completed) {
          setIsPreviouslyCompleted(true);
  
          const completed = JSON.parse(localStorage.getItem("completedQuizzes") || "[]");
          const storedQuiz = completed.find(q => q.quizId === quizId);
  
          navigate('/quizresults', {
            state: {
              alreadyCompleted: true,
              quizId: quizId,
              detailedResults: storedQuiz?.results || []
            }
          });
        }
      })
      .catch(err => console.error("Quiz tamamlama durumu alınamadı:", err));
  }, [quizId, navigate]);
  
  useEffect(() => {
    if (!quizId) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/questions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setQuestions(data);
      })
      .catch(() => setError("Sorular yüklenemedi, lütfen tekrar deneyin."))
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (timer > 0 && !quizCompleted && !isPreviouslyCompleted) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !quizCompleted && !isPreviouslyCompleted) {
      alert("⏰ Süre doldu! Quiz bitiriliyor.");
      calculateResultAndSendToBackend();
    }
  }, [timer, quizCompleted, calculateResultAndSendToBackend, isPreviouslyCompleted]);

  const q = questions[currentIndex];

  if (!quizId) return <div>⚠️ Quiz ID bulunamadı.</div>;
  if (loading) return <div>⏳ Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quiz-page">
      <div className="question-card">
        <h2>Question {currentIndex + 1}</h2>
        <h3>{q.question}</h3>

        <div className="options">
          {Object.entries(q.options || {}).map(([key, value]) => (
            <button
              key={key}
              className={`option-btn ${selectedAnswers[q.id] === key ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(q.id, key)}
              disabled={quizCompleted || isPreviouslyCompleted}
            >
              {key}) {value}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-nav-buttons">
        <button
          onClick={() => setCurrentIndex(i => i - 1)}
          disabled={currentIndex === 0 || quizCompleted || isPreviouslyCompleted}
        >⬅️ Back</button>

        <button
          onClick={() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex(i => i + 1);
            } else {
              calculateResultAndSendToBackend();
            }
          }}
          disabled={quizCompleted || isPreviouslyCompleted}
        >
          {currentIndex === questions.length - 1 ? "✅ Finish Quiz" : "➡️ Next Question"}
        </button>

        <button
          className="exit-btn"
          onClick={calculateResultAndSendToBackend}
          disabled={quizCompleted || isPreviouslyCompleted}
        >
          🚪 Exit
        </button>
      </div>

      <div className="timer">⏰ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</div>
    </div>
  );
}

export default QuizPage;