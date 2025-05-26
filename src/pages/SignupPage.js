import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const [schoolId, setSchoolId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('❗Passwörter stimmen nicht überein!');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          school_id: schoolId,
          name: firstName,
          surname: lastName,
          email,
          password,
          gender
        },
        { withCredentials: true }
      );

      console.log("✅ Registrierung erfolgreich!");
      navigate('/login');
    } catch (err) {
      console.error('❌ Registrierungsfehler:', err);
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Registrieren</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Matrikelnummer</label>
            <input
              type="text"
              placeholder="Matrikelnummer"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Vorname</label>
            <input
              type="text"
              placeholder="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nachname</label>
            <input
              type="text"
              placeholder="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>E-Mail-Adresse</label>
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Passwort</label>
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Passwort bestätigen</label>
            <input
              type="password"
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Geschlecht</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Auswählen</option>
              <option value="male">Männlich</option>
              <option value="female">Weiblich</option>
              <option value="other">Divers</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-btn">Registrieren</button>
        </form>

        <div className="back-button">
          <Link to="/login" className="back-link">🔙 Bereits registriert? Jetzt einloggen</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
