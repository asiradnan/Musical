import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
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
    setFormData({ ...formData, [name]: value });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // try {
      //   // Login user
      //   await userService.login(formData.email, formData.password);
        
      //   // Redirect to dashboard
      //   navigate('/dashboard');
      // } catch (error) {
      //   console.error('Login error:', error);
      //   setErrors({ general: error.response?.data?.message || 'Invalid email or password' });
      // }
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-8 text-gray-800">Welcome Back</h1>
        
        {successMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 text-center">
            {successMessage}
          </div>
        )}
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errors.general && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 text-center">{errors.general}</div>}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`p-3 border rounded-md text-base ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`p-3 border rounded-md text-base ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
          </div>
          
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-gray-600 text-sm hover:underline">Forgot Password?</Link>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white p-3 rounded-md text-base cursor-pointer transition-colors hover:bg-blue-700 mt-2">Login</button>
        </form>
        
        <div className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
