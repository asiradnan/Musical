import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart } = useCart();
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

  // Check if user is an artist or admin
  const isArtist = user?.role === 'artist';
  const isAdmin = user?.role === 'admin';

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
        <button
          onClick={() => navigate('/booking')}
          className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
        >
          Book Now
        </button>
        <button
          onClick={() => navigate('/products')}
          className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
        >
          Purchase
        </button>
        <button
        onClick={() => navigate('/users/rentals')}
        className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
        >
        Rentals
        </button>
        {/* Only show Collaboration Hub button if user is authenticated and is an artist */}
        {isAuthenticated && isArtist && (
          <button
            onClick={() => navigate('/collaboration')}
            className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
          >
            Collaboration Hub
          </button>
        )}
        
        {/* Show Admin Dashboard link for admin users */}
        {isAuthenticated && isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-transparent border-none text-white text-base cursor-pointer px-4 py-2 transition-opacity hover:opacity-80"
          >
            Admin Dashboard
          </button>
        )}

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
      <Link to="/cart" className="relative">
        <FaShoppingCart className="text-xl" />
        {cart.itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cart.itemCount}
          </span>
        )}
      </Link>
    </nav>
  );
};

export default Navbar;
