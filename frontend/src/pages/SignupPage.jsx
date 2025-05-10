import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Register user using userService
      // await userService.register({
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   email: formData.email,
      //   password: formData.password
      // });
      
      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in to continue.' 
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to sign up. Please try again.' });
    }
  };

  return (
    <div>
      <Navbar showSignup={false} />
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-center text-2xl font-bold mb-8 text-gray-800">Create Your Account</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`p-3 border rounded-md text-base ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && <span className="text-red-600 text-sm">{errors.firstName}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`p-3 border rounded-md text-base ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <span className="text-red-600 text-sm">{errors.lastName}</span>}
            </div>

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
              {errors.email && <span className="text-red-600 text-sm">{errors.email}</span>}
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
              {errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`p-3 border rounded-md text-base ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.confirmPassword && <span className="text-red-600 text-sm">{errors.confirmPassword}</span>}
            </div>

            {errors.submit && <div className="text-red-600 text-sm">{errors.submit}</div>}

            <button type="submit" className="bg-blue-600 text-white p-3 rounded-md text-base cursor-pointer transition-colors hover:bg-blue-700 mt-2">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
