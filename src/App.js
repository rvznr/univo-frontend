import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import './App.css';
import LearnHub from './pages/LearnHub';
import QuizSelection from './pages/QuizSelection';
import QuizResults from './pages/QuizResults';
import Profile from './pages/Profile';
import QuizPage from './pages/QuizPage';
import ExercisePage from './pages/ExercisePage';
import NotePage from './pages/NotePage';
import GamesPage from './pages/GamePage';
import Footer from './components/Footer'; 
import About from './pages/About';
import PracticeQuestion from './pages/PracticeQuestion';
import Review from './pages/Review';
import './i18n';


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/signup'];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}
      
      <div className="main-content">
        <Routes>
        <Route path="/practice" element={<PracticeQuestion />} />
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learnhub" element={<LearnHub />} />
          <Route path="/quizselection" element={<QuizSelection />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quizresults" element={<QuizResults />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/exercise/:moduleId" element={<ExercisePage />} />
          <Route path="/note/:noteId" element={<NotePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/about" element={<About />} />
          <Route path='/review' element={<Review/>} />
          <Route path="/practice/:topic" element={<PracticeQuestion />} />
          <Route path="/practice/:topic" element={<PracticeQuestion />} />

        </Routes>
      </div>

      {!hideNavbar && <Footer />} 
    </div>
  );
}

export default App;
