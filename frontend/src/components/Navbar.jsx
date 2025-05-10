import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ showSignup = true, showLogin = true }) => {
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate('/');
    window.scrollTo(0, 0); // Scroll to top when navigating home
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-black/80 text-white">
      <div className="text-2xl font-bold cursor-pointer" onClick={handleBrandClick}>
        Resonance
      </div>
      <div className="flex gap-4">
        {showLogin && (
          <button 
            onClick={() => navigate('/login')} 
            className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
          >
            Login
          </button>
        )}
        {showSignup && (
          <button 
            onClick={() => navigate('/signup')} 
            className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
          >
            Sign Up
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
