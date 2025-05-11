import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCheckCircle, FaHome, FaShoppingBag, FaGift } from 'react-icons/fa';

const OrderConfirmation = () => {
  const location = useLocation();
  const { orderId, orderTotal, pointsEarned } = location.state || {};
  
  // If someone navigates directly to this page without order info, redirect to home
  if (!orderId) {
    return <Navigate to="/" />;
  }

  // Format the order total properly, handling both number and string cases
  const formattedTotal = typeof orderTotal === 'number' 
    ? orderTotal.toFixed(2) 
    : typeof orderTotal === 'string' 
      ? orderTotal 
      : '0.00';

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-md p-8 rounded-lg border border-white/20 max-w-2xl w-full">
          <div className="text-center mb-8">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-white/70">Thank you for your purchase</p>
          </div>
          
          <div className="mb-8">
            <div className="bg-white/5 p-4 rounded-md mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Order Number:</span>
                <span className="text-white font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Order Total:</span>
                <span className="text-white font-medium">${formattedTotal}</span>
              </div>
              
              {/* Display points earned */}
              {pointsEarned && (
                <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-white/70 flex items-center">
                    <FaGift className="text-purple-400 mr-2" /> Rewards Earned:
                  </span>
                  <span className="text-purple-400 font-medium">+{pointsEarned} points</span>
                </div>
              )}
            </div>
            
            <p className="text-white/70 text-sm">
              A confirmation email has been sent to your email address. We'll notify you when your order ships.
            </p>
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <p className="text-white/70 text-center mb-6">
              Questions about your order? Contact our customer support team.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/" 
                className="bg-transparent border border-white/30 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-white/10 flex items-center justify-center"
              >
                <FaHome className="mr-2" /> Return to Home
              </Link>
              <Link 
                to="/products" 
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md text-center font-medium flex items-center justify-center"
              >
                <FaShoppingBag className="mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
