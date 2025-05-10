import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleBrandClick = () => {
    navigate('/');
    window.scrollTo(0, 0); // Scroll to top when navigating home
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-black/80 text-white">
      <div className="text-2xl font-bold cursor-pointer" onClick={handleBrandClick}>
        Resonance
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/about')} 
          className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
        >
          About
        </button>
        {!isAuthenticated ? (
          <>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/profile')} 
              className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
            >
              {user?.name || 'Profile'}
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
