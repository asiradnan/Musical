import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRentals = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/rentals/user');
        setRentals(response.data.rentals);
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
      await axios.put(`/api/rentals/${rentalId}/cancel`);
      
      // Update the rental status in the UI
      setRentals(rentals.map(rental => 
        rental._id === rentalId 
          ? { ...rental, status: 'cancelled' } 
          : rental
      ));
    } catch (err) {
      setError('Failed to cancel rental. Please try again.');
      console.error('Error cancelling rental:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        return 'bg-blue-600';
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
          <div className="bg-red-800 p-4 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        )}
        
        {rentals.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h2 className="text-2xl font-bold mb-4">No Rentals Found</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              You haven't rented any instruments yet. Start by browsing our collection and finding the perfect instrument for your needs.
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
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h2 className="text-2xl font-semibold">{rental.instrument.name}</h2>
                      <p className="text-gray-400">{rental.instrument.type} • {rental.instrument.brand}</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(rental.status)}`}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusBadgeClass(rental.paymentStatus)}`}>
                        {rental.paymentStatus.charAt(0).toUpperCase() + rental.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Rental Period</p>
                      <p className="text-white">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Cost</p>
                      <p className="text-white">${rental.totalAmount.toFixed(2)} ({rental.totalDays} days @ ${rental.instrument.dailyRate}/day)</p>
                    </div>
                  </div>
                  
                  {rental.notes && (
                    <div className="mt-4">
                      <p className="text-gray-400">Notes</p>
                      <p className="text-white">{rental.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    {(rental.status === 'confirmed' || rental.status === 'pending') && (
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
