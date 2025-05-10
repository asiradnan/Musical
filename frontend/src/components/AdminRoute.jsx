import { Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const hasShownToast = useRef(false);
  
  console.log('AdminRoute rendered');
  console.log('user role:', user?.role);
  
  useEffect(() => {
    // Only show toast once and only when authentication is complete
    if (!isLoading && isAuthenticated && user?.role !== 'admin' && !hasShownToast.current) {
      toast.error('You do not have permission to access this page');
      hasShownToast.current = true;
    }
  }, [isLoading, isAuthenticated, user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('isLoading:', isLoading);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    console.log('User role:', user?.role);
    return <Navigate to="/profile" />;
  }

  return children;
};

export default AdminRoute;
