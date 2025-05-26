import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/QuizModules.css';  

const QuizModules = () => {
  const [quizModules, setQuizModules] = useState([]); 
  const navigate = useNavigate();

 
  useEffect(() => {
    fetch('http://localhost:5000/api/quiz/2', {  
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('Gelen quiz modülleri:', data);
      setQuizModules(data); 
    })
    .catch(err => {
      console.error('Veri çekme hatası:', err);
    });
  }, []);  

  
  const goToQuiz = (quizId) => {
    navigate('/quizpage', {
      state: { quizId }
    });
  };

  return (
    <div className="quiz-modules">
      <h1>Quiz Modülleri</h1>
      <div className="quiz-list">
        {quizModules.length === 0 ? (
          <p>Henüz hiçbir quiz modülü mevcut değil.</p>
        ) : (
          quizModules.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.question}</h3>
              <button className="start-btn" onClick={() => goToQuiz(quiz.id)}>
                Quize Başla
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizModules;
