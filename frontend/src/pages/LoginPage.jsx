import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result) {
        navigate('/');
      } else {
        setErrors({
          submit: 'Failed to login. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Invalid email or password'
      });
    }
  };
  
  return (
    <div className="app-background min-h-screen">
      <Navbar showLogin={false} />
      <div className="min-h-screen flex justify-center items-center px-4">
        <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 text-white">
          <h1 className="text-center text-3xl font-bold mb-8">Welcome Back</h1>
          
          {successMessage && (
            <div className="bg-green-800/50 text-green-200 p-3 rounded-md mb-4 text-center border border-green-500/50">
              {successMessage}
            </div>
          )}
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                  errors.email ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <span className="text-red-400 text-sm font-semibold">{errors.email}</span>}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                  errors.password ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <span className="text-red-400 text-sm font-semibold">{errors.password}</span>}
            </div>
            
            <div className="text-right">
              <Link to="/forgot-password" className="text-white/80 text-sm hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>
            
            {errors.submit && (
              <div className="text-red-400 text-sm font-semibold">{errors.submit}</div>
            )}
            
            <button 
              type="submit" 
              className="bg-white text-black font-semibold p-3 rounded-md text-base cursor-pointer transition-colors hover:bg-gray-300 mt-2"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center text-white/80">
            Don't have an account? <Link to="/signup" className="text-white hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
