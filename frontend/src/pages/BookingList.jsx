import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationSuccess, setCancellationSuccess] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/user');
      setBookings(response.data.bookings);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your bookings. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancellationModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setCancellingId(selectedBooking._id);
      const response = await api.put(`/bookings/${selectedBooking._id}/cancel`);
      
      // Update the booking status in the list
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      setCancellationSuccess({
        message: 'Booking cancelled successfully',
        fee: response.data.cancellationFee > 0 
          ? `A cancellation fee of $${response.data.cancellationFee.toFixed(2)} has been applied.` 
          : null
      });
      
      setShowCancellationModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-6">
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-white/70 py-4">
        You don't have any bookings yet. <a href="/book-studio" className="text-purple-400 hover:text-purple-300">Browse studios</a> to make a booking.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cancellationSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-white p-4 rounded-md mb-4">
          <p>{cancellationSuccess.message}</p>
          {cancellationSuccess.fee && <p className="mt-2 text-sm">{cancellationSuccess.fee}</p>}
        </div>
      )}
      
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-white/10 p-4 rounded-lg border border-white/20">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-xl font-medium">{booking.studio.name}</h3>
              <p className="text-sm text-white/70">{booking.studio.location}</p>
              <div className="mt-2">
                <p className="text-white">
                  <span className="text-white/70">Date:</span> {new Date(booking.date).toLocaleDateString()}
                </p>
                <p className="text-white">
                  <span className="text-white/70">Time:</span> {booking.startTime} - {booking.endTime}
                </p>
                <p className="text-white">
                  <span className="text-white/70">Status:</span> 
                  <span className={`ml-1 ${
                    booking.status === 'confirmed' ? 'text-green-400' : 
                    booking.status === 'pending' ? 'text-yellow-400' : 
                    booking.status === 'cancelled' ? 'text-red-400' : ''
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </p>
                <p className="text-white">
                  <span className="text-white/70">Total:</span> ${booking.totalAmount}
                </p>
                {booking.notes && (
                  <p className="text-white mt-2">
                    <span className="text-white/70">Notes:</span> {booking.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-start">
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => handleCancelClick(booking)}
                  disabled={cancellingId === booking._id}
                  className={`${
                    cancellingId === booking._id 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-red-600/70 hover:bg-red-700'
                  } text-white px-3 py-1 rounded-md text-sm`}
                >
                  {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Cancellation Confirmation Modal */}
      {showCancellationModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
            <p className="mb-4">Are you sure you want to cancel your booking at {selectedBooking.studio.name}?</p>
            
            <p className="mb-2">Booking Details:</p>
            <ul className="mb-4 text-sm">
              <li>Date: {new Date(selectedBooking.date).toLocaleDateString()}</li>
              <li>Time: {selectedBooking.startTime} - {selectedBooking.endTime}</li>
            </ul>
            
            {/* Cancellation Policy Warning */}
            <div className="bg-yellow-900/30 border border-yellow-500 p-3 rounded-md mb-4 text-sm">
              <p className="font-bold">Cancellation Policy:</p>
              <p>Cancellations can be made within 24 hours of booking.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancellationModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancellingId === selectedBooking._id}
                className={`px-4 py-2 ${
                  cancellingId === selectedBooking._id 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                } rounded-md text-white`}
              >
                {cancellingId === selectedBooking._id ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
