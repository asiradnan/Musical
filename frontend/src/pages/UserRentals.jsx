import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UserRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRentals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/r/rentals/user');
        
        // Ensure rentals is always an array
        const rentalsData = response.data.rentals || [];
        console.log(response.data);
        setRentals(Array.isArray(rentalsData) ? rentalsData : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load your rentals. Please try again later.');
        setLoading(false);
        console.error('Error fetching rentals:', err);
      }
    };

    fetchUserRentals();
  }, []);

  const handleCancelRental = async (rentalId) => {
    try {
      await api.put(`/r/rentals/${rentalId}/cancel`);
      // Update the rental status in the UI
      setRentals(rentals.map(rental => 
        rental._id === rentalId 
          ? { ...rental, status: 'cancelled' } 
          : rental
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel rental. Please try again.');
      console.error('Error cancelling rental:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'cancelled':
        return 'bg-red-600';
      case 'completed':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'refunded':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
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
        <h1 className="text-4xl font-bold text-center mb-12">My Instrument Rentals</h1>
        
        {error && (
          <div className="bg-red-800 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {rentals.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-6xl mb-6">🎸</div>
            <h2 className="text-2xl font-bold mb-4">No Rentals Found</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              You haven't rented any instruments yet. Start by exploring our available instruments.
            </p>
            <button
              onClick={() => navigate('/rent-instrument')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Rent an Instrument
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rentals.map((rental) => (
              <div key={rental._id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{rental.instrument.name}</h2>
                      <p className="text-gray-400">{rental.instrument.type} • {rental.instrument.brand}</p>
                    </div>
                    <div className="flex space-x-3 mt-3 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(rental.status)}`}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusBadgeClass(rental.paymentStatus)}`}>
                        {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p>{formatDate(rental.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">End Date</p>
                      <p>{formatDate(rental.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p>{rental.totalDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-purple-400 font-semibold">${rental.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {rental.notes && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">Notes</p>
                      <p className="bg-gray-700 p-3 rounded-md mt-1">{rental.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-4">
                    {rental.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelRental(rental._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Cancel Rental
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/rent-instrument')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Rent Another Instrument
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRentals;
