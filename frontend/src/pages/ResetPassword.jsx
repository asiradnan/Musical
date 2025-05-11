import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function ResetPassword() {
  console.log('ResetPassword component rendered');
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const onSubmit = async (data) => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      toast.error('Reset token is missing');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      toast.success('Password has been reset successfully');
      navigate('/login', { state: { message: 'Your password has been reset successfully. You can now log in with your new password.' } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={false} />
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-black/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 text-white">
          <h1 className="text-center text-3xl font-bold mb-8">Reset Password</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-medium">
                New Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                  errors.password ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Enter new password"
              />
              {errors.password && (
                <span className="text-red-400 text-sm font-semibold">{errors.password.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === watch('password') || 'Passwords do not match'
                })}
                className={`p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/30'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <span className="text-red-400 text-sm font-semibold">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black font-semibold p-3 rounded-md text-base cursor-pointer transition-colors hover:bg-gray-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div className="text-center mt-4">
              <Link 
                to="/login" 
                className="text-white/80 hover:text-white transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
