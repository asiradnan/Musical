import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Booking = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      <div className="flex-1 p-8 pt-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">Booking Options</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Book Studio Option */}
            <div 
              onClick={() => navigate('/book-studio')}
              className="bg-black/40 hover:bg-black/60 transition-all duration-300 rounded-lg p-8 cursor-pointer border border-gray-700 hover:border-purple-500 flex flex-col items-center justify-center h-80"
            >
              <div className="text-6xl mb-4">🎵</div>
              <h2 className="text-3xl font-bold mb-4 text-center">Book Studio</h2>
              <p className="text-center text-gray-300">
                Reserve studio time for your recording sessions, rehearsals, or production needs
              </p>
            </div>
            
            {/* Rent Instrument Option */}
            <div 
              onClick={() => navigate('/rent-instrument')}
              className="bg-black/40 hover:bg-black/60 transition-all duration-300 rounded-lg p-8 cursor-pointer border border-gray-700 hover:border-purple-500 flex flex-col items-center justify-center h-80"
            >
              <div className="text-6xl mb-4">🎸</div>
              <h2 className="text-3xl font-bold mb-4 text-center">Rent Instrument</h2>
              <p className="text-center text-gray-300">
                Browse and rent high-quality instruments for your performances or recordings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
