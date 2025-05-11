import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-gray-900 rounded-lg w-full max-w-md mx-4 z-10 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/10 p-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
