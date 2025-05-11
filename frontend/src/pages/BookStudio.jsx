import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

const BookStudio = () => {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studioType, setStudioType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        const response = await api.get('/studios', {
          params: studioType !== 'all' ? { type: studioType } : {}
        });
        // Make sure to check if response.data.studios exists
        setStudios(response.data.studios || []);
        console.log('Fetched studios:', response.data.studios);
        setError(null);
      } catch (err) {
        setError('Failed to fetch studios. Please try again later.');
        console.error('Error fetching studios:', err);
        // Set studios to empty array on error
        setStudios([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStudios();
  }, [studioType]);
  
  const handleStudioSelect = (studioId) => {
    navigate(`/book-studio/${studioId}?date=${selectedDate}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      <div className="flex-1 p-8 pt-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Book a Studio</h1>
          
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 p-6 rounded-lg">
            <div className="w-full md:w-auto">
              <label htmlFor="studioType" className="block text-sm font-medium mb-2">
                Studio Type
              </label>
              <select
                id="studioType"
                value={studioType}
                onChange={(e) => setStudioType(e.target.value)}
                className="w-full md:w-auto bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="practice">Practice Room</option>
                <option value="studio">Recording Studio</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Booking Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full md:w-auto bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md">
              {error}
            </div>
          ) : studios.length === 0 ? (
            <div className="text-center py-12 bg-black/40 rounded-lg">
              <p className="text-xl text-gray-400">No studios available for the selected criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studios.map((studio) => (
                <div 
                  key={studio._id}
                  className="bg-black/60 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    {studio.images && studio.images.length > 0 ? (
                      <img 
                        src={`http://127.0.0.1:5000${studio.images[0]}`} 
                        alt={studio.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No image available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold">{studio.name}</h2>
                      <span className="bg-purple-900 text-white text-xs px-2 py-1 rounded-full">
                        {studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{studio.location}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {studio.amenities && studio.amenities.length > 0 ? (
                          studio.amenities.map((amenity, index) => (
                            <span 
                              key={index}
                              className="bg-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No amenities listed</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-bold text-purple-400">
                        ${studio.hourlyRate}/hour
                      </p>
                      <button
                        onClick={() => handleStudioSelect(studio._id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookStudio;
