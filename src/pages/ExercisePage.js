import React, { useState, useEffect } from 'react';
import '../styles/ExercisePage.css';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function ExercisePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [score, setScore] = useState(0);
  const [hasAlreadySolved, setHasAlreadySolved] = useState(false); 

  useEffect(() => {
    api.get(`/module-exercises/${moduleId}`)
      .then(res => {
        const exercises = res.data.exercises || [];
        let allQs = [];

        exercises.forEach(ex => {
          let qs = ex.questions;

          if (typeof qs === 'string') {
            try {
              qs = JSON.parse(qs);
            } catch (err) {
              console.error('❌ JSON-Parsing-Fehler:', err);
              qs = [];
            }
          }

          qs = qs.flatMap(q => {
            if (typeof q.question_text === 'string' && q.question_text.trim().startsWith('[')) {
              try {
                return JSON.parse(q.question_text);
              } catch (err) {
                console.error('❌ Inneres Parsing-Fehler:', err);
                return [];
              }
            }
            return [q];
          });

          qs = qs.map(q => {
            if (typeof q.options === 'string') {
              try {
                q.options = JSON.parse(q.options);
              } catch (e) {
                console.error('❌ Optionen-Parsing-Fehler:', e);
              }
            }
            return q;
          });

          allQs = [...allQs, ...qs];
        });

        setQuestions(allQs);
      })
      .catch(err => console.error("❌ Fehler beim Laden der Übung:", err));

    
    const token = localStorage.getItem('token');
    api.get(`/user/progress/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const found = res.data.find(p => parseInt(p.module_id) === parseInt(moduleId));
      if (found && found.xp_from_exercises > 0) {
        setHasAlreadySolved(true);
      }
    }).catch(err => console.error('❌ Fehler beim Statusabruf:', err));
  }, [moduleId]);

  const normalize = (val) => {
    if (!val) return '';
    return val.toString().trim().toLowerCase().replace(/[-,]/g, ' ').replace(/\s+/g, ' ');
  };

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleCheck = () => {
    let tempScore = 0;
    const tempFeedbacks = {};

    parsedQuestions.forEach((q, index) => {
      if (q.type === 'fill_in_the_blank') {
        const key = `${index}-fill-0`;
        const correct = normalize(answers[key]) === normalize(q.correct_answer?.answers?.[0]);
        tempScore += correct ? (q.xp_reward || 20) : 0;
        tempFeedbacks[index] = correct
          ? '✅ Richtig'
          : `❌ Falsch. Korrekt: ${q.correct_answer?.answers?.[0]}`;
      }

      if (q.type === 'multiple_choice') {
        const key = `${index}-mc`;
        const selected = answers[key];
        const correctOption = q.options?.options?.find(o => o.correct);
        const correct = normalize(selected) === normalize(correctOption?.text);
        tempScore += correct ? (q.xp_reward || 20) : 0;
        tempFeedbacks[index] = correct
          ? '✅ Richtig'
          : `❌ Falsch. Korrekt: ${correctOption?.text}`;
      }

      if (q.type === 'matching') {
        const correct = q.options?.pairs?.every((pair, i) => {
          const key = `${index}-match-${i}`;
          return normalize(answers[key]) === normalize(pair.right);
        });
        tempScore += correct ? (q.xp_reward || 20) : 0;
        tempFeedbacks[index] = correct
          ? '✅ Richtig'
          : '❌ Falsche Zuordnung';
      }

      if (q.type === 'ordering') {
        const key = `${index}-order`;
        const userOrderIndices = answers[key]?.split(',').map(s => parseInt(s.trim()) - 1);
        const originalSteps = q.options?.steps || [];
        const correctOrder = q.options?.correct_order;

        if (
          !userOrderIndices ||
          !Array.isArray(correctOrder) ||
          userOrderIndices.length !== correctOrder.length ||
          userOrderIndices.some(i => isNaN(i) || i < 0 || i >= originalSteps.length)
        ) {
          tempFeedbacks[index] = '⚠️ Ungültiges Format für die Reihenfolge.';
          return;
        }

        const correct = JSON.stringify(userOrderIndices) === JSON.stringify(correctOrder);
        tempScore += correct ? (q.xp_reward || 20) : 0;
        tempFeedbacks[index] = correct
          ? '✅ Richtig'
          : `❌ Falsch. Richtige Reihenfolge: ${correctOrder.map(i => originalSteps[i]).join(' → ')}`;
      }

      if (q.type === 'short_answer') {
        const key = `${index}-short`;
        const userAnswer = normalize(answers[key]);
        const correctAnswers = (q.correct_answer?.answer || []).map(ans => normalize(ans));

        if (!userAnswer || userAnswer.length < 2) {
          tempFeedbacks[index] = `⚠️ Bitte eine gültige Antwort eingeben.`;
        } else {
          const correct = correctAnswers.includes(userAnswer);
          tempScore += correct ? (q.xp_reward || 20) : 0;
          tempFeedbacks[index] = correct
            ? '✅ Richtig'
            : `❌ Falsch. Erwartet: ${q.correct_answer?.answer.join(' / ')}`;
        }
      }
    });

    setFeedbacks(tempFeedbacks);
    setIsCompleted(true);
    setScore(tempScore);

    if (tempScore > 0 && !hasAlreadySolved) {
      const token = localStorage.getItem('token');
      api.post('/user/xp/exercise',
        { module_id: moduleId, gained_xp: tempScore },
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(() => console.log('✅ XP aktualisiert'))
        .catch(err => console.error('❌ Fehler beim XP-Update', err));
    }
  };

  const parsedQuestions = questions.flatMap(q => {
    try {
      if (typeof q === 'string') {
        const json = JSON.parse(q);
        return Array.isArray(json) ? json : [json];
      }
      return [q];
    } catch (e) {
      console.error('❌ Parsing-Fehler:', e, q);
      return [];
    }
  });

  if (!parsedQuestions.length) {
    return <div className="exercise-page"><p className="loading-text">Übung wird geladen...</p></div>;
  }

  return (
    <div className="exercise-page">
      <h2>Modulübung</h2>

      <div className="info-box">
        ℹ️ <strong>Hinweis:</strong> Du erhältst XP <u>nur beim ersten Abschluss</u> dieser Übung für jede richtig beantwortete Frage. Du kannst die Übung erneut machen, erhältst aber keine weiteren XP.
      </div>

      {hasAlreadySolved && !isCompleted && (
        <div className="warning-box">
          ⚠️ Du hast diese Übung bereits abgeschlossen. Dies ist ein <strong>zweiter Versuch</strong>, daher wirst du <strong>keine XP</strong> erhalten.
        </div>
      )}

      {parsedQuestions.map((q, index) => (
        <div className="question-box" key={index}>
          <p><strong>{q.question_text}</strong></p>

          {q.type === 'fill_in_the_blank' && (
            <input
              type="text"
              placeholder="Lücke ausfüllen"
              onChange={(e) => handleChange(`${index}-fill-0`, e.target.value)}
            />
          )}

          {q.type === 'short_answer' && (
            <input
              type="text"
              placeholder="Antwort eingeben"
              onChange={(e) => handleChange(`${index}-short`, e.target.value)}
            />
          )}

          {q.type === 'multiple_choice' && q.options?.options?.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="radio"
                id={`mc-${index}-${i}`}
                name={`mc-${index}`}
                onChange={() => handleChange(`${index}-mc`, opt.text)}
              />
              <label htmlFor={`mc-${index}-${i}`} style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {opt.text}
              </label>
            </div>
          ))}

          {q.type === 'matching' && q.options?.pairs?.map((pair, i) => (
            <div className="match-row" key={i}>
              <label className="match-label">{pair.left}</label>
              <select
                className="match-input"
                onChange={(e) => handleChange(`${index}-match-${i}`, e.target.value)}
              >
                <option value="">Antwort auswählen</option>
                {q.options.pairs.map((opt, j) => (
                  <option key={j} value={opt.right}>{opt.right}</option>
                ))}
              </select>
            </div>
          ))}

          {q.type === 'ordering' && q.options?.steps && (
            <>
              <ul>
                {q.options.steps.map((step, i) => (
                  <li key={i}><strong>{i + 1}.</strong> {step}</li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Richtige Reihenfolge eingeben (z. B. 3,2,1)"
                onChange={(e) => handleChange(`${index}-order`, e.target.value)}
              />
            </>
          )}

          {isCompleted && feedbacks[index] && (
            <p className="feedback">{feedbacks[index]}</p>
          )}
        </div>
      ))}

      {!isCompleted ? (
        <button className="submit-btn" onClick={handleCheck}>Antworten absenden</button>
      ) : (
        <div className="xp-box">
          🎉 Antworten eingereicht! {hasAlreadySolved ? (
            <span>Dies war ein zweiter Versuch – keine XP vergeben.</span>
          ) : (
            <span>Du hast <strong>{score} XP</strong> erhalten!</span>
          )}
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>🔙 Zurück</button>
    </div>
  );
}

export default ExercisePage;
