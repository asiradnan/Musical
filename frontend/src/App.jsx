import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import Dashboard from './pages/Dashboard';
// import './app.css';
// import Profile from './pages/ArtistProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/artist-profile" element={<Profile />} /> */}
      </Routes>
    </Router>
  );
}

export default App;