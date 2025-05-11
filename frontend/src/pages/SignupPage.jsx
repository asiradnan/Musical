import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'standard' // Default role
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

    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) newErrors.role = 'Role selection is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Create a user object with the required fields
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      const result = await register(userData);
      
      if (result) {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please check your email to verify your account.'
          }
        });
      } else {
        setErrors({
          submit: 'Failed to sign up. Please try again.'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        submit:
          error.response?.data?.message ||
          'Failed to sign up. Please try again.'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showSignup={false} />
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 text-white">
          <h1 className="text-center text-3xl font-bold mb-8">Create Your Account</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {['firstName', 'lastName', 'email'].map((field) => (
              <div key={field} className="flex flex-col gap-2">
                <label htmlFor={field} className="font-medium capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                    errors[field] ? 'border-red-500' : 'border-white/30'
                  }`}
                  placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                />
                {errors[field] && (
                  <span className="text-red-400 text-sm font-semibold">{errors[field]}</span>
                )}
              </div>
            ))}

            {['password', 'confirmPassword'].map((field) => (
              <div key={field} className="flex flex-col gap-2">
                <label htmlFor={field} className="font-medium capitalize">
                  {field === 'confirmPassword' ? 'Confirm Password' : 'Password'}
                </label>
                <input
                  type="password"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                    errors[field] ? 'border-red-500' : 'border-white/30'
                  }`}
                  placeholder={`Enter ${field === 'confirmPassword' ? 'again' : ''}`}
                />
                {errors[field] && (
                  <span className="text-red-400 text-sm font-semibold">{errors[field]}</span>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="font-medium">
                Account Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="standard"
                    checked={formData.role === 'standard'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-white"
                  />
                  <span>Standard User</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={formData.role === 'artist'}
                    onChange={handleChange}
                    className="w-4 h-4 accent-white"
                  />
                  <span>Artist</span>
                </label>
              </div>
              {errors.role && (
                <span className="text-red-400 text-sm font-semibold">{errors.role}</span>
              )}
            </div>

            {errors.submit && (
              <div className="text-red-400 text-sm font-semibold">{errors.submit}</div>
            )}

            <button
              type="submit"
              className="bg-white text-black font-semibold p-3 rounded-md text-base cursor-pointer transition-colors hover:bg-gray-300 mt-2"
            >
              Sign Up
            </button>
            
            <div className="mt-4 text-center text-white/80">
              Already have an account? <Link to="/login" className="text-white hover:underline">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
