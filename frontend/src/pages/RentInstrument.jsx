import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
const RentInstrument = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [notes, setNotes] = useState('');
  const [rentalSuccess, setRentalSuccess] = useState(false);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/r/instruments');
        
        // Ensure instruments is always an array
        const instrumentsData = response.data.instruments || response.data;
        console.log(instrumentsData)
        // Check if instrumentsData is an array, if not, convert or use empty array
        setInstruments(Array.isArray(instrumentsData) ? instrumentsData : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load instruments. Please try again later.');
        setLoading(false);
        console.error('Error fetching instruments:', err);
      }
    };
    
    

    fetchInstruments();
  }, []);

  const handleInstrumentSelect = (instrument) => {
    setSelectedInstrument(instrument);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setRentalDates({
      ...rentalDates,
      [name]: value
    });
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInstrument) {
      setError('Please select an instrument');
      return;
    }
    
    if (!rentalDates.startDate || !rentalDates.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    try {
      const response = await api.post('/r/rentals', {
        instrumentId: selectedInstrument._id,
        startDate: rentalDates.startDate,
        endDate: rentalDates.endDate,
        notes
      });
      
      setRentalSuccess(true);
      setError(null);
      
      // Reset form
      setSelectedInstrument(null);
      setRentalDates({ startDate: '', endDate: '' });
      setNotes('');
      
      // Redirect to user rentals after 2 seconds
      setTimeout(() => {
        navigate('/user/rentals');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rental. Please try again.');
      console.error('Error creating rental:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Rent an Instrument</h1>
        
        {rentalSuccess ? (
          <div className="bg-green-800 p-8 rounded-lg text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Rental Successful!</h2>
            <p className="text-gray-300 mb-8">
              Your instrument rental has been confirmed. Redirecting to your rentals...
            </p>
          </div>
        ) : instruments.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-6xl mb-6">🎸</div>
            <h2 className="text-2xl font-bold mb-4">No Instruments Available</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              There are currently no instruments available for rent. Please check back later.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Back to Booking Options
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Instrument Selection */}
            <div className="md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-semibold mb-4">Select an Instrument</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.map((instrument) => (
                  <div 
                    key={instrument._id}
                    className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all ${
                      selectedInstrument?._id === instrument._id 
                        ? 'ring-2 ring-purple-500 transform scale-105' 
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleInstrumentSelect(instrument)}
                  >
                    {instrument.images && instrument.images.length > 0 ? (
                      <img 
                        src={`http://127.0.0.1:5000${instrument.images[0]}`}
                        alt={instrument.name} 
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-md mb-4">
                        <span className="text-4xl">🎸</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold">{instrument.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{instrument.type} • {instrument.brand}</p>
                    <p className="text-gray-300 mb-3 text-sm line-clamp-2">{instrument.description}</p>
                    <p className="text-purple-400 font-semibold">${instrument.dailyRate}/day</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rental Form */}
            {selectedInstrument && (
              <div className="md:col-span-2 lg:col-span-3 mt-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">Rental Details</h2>
                  
                  {error && (
                    <div className="bg-red-800 p-4 rounded-lg mb-6">
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={rentalDates.startDate}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={rentalDates.endDate}
                          onChange={handleDateChange}
                          min={rentalDates.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2">Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={notes}
                        onChange={handleNotesChange}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                        placeholder="Any special requests or notes for your rental..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => navigate('/booking')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors"
                      >
                        Back to Booking Options
                      </button>
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
                      >
                        Confirm Rental
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentInstrument;
