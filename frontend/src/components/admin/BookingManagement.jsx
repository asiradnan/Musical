import React, { useEffect, useState } from 'react';
import useAdminStore from '../../store/adminStore';
import { FaSearch, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';

const BookingManagement = () => {
  const { bookings, getAllBookings, cancelBooking, isLoading, error } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    getAllBookings();
    console.log(bookings);
  }, [getAllBookings]);

  // useEffect(() => {
  //   if (searchTerm.trim() === '') {
  //     setFilteredBookings([]);
  //   } else {
  //     const filtered = bookings.filter(
  //       booking => 
  //         booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         booking.studio?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //     setFilteredBookings(filtered);
  //   }
  // }, [searchTerm, bookings]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    const success = await cancelBooking(selectedBooking._id, cancelReason);
    if (success) {
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
    } else {
      toast.error(error || 'Failed to cancel booking');
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const displayBookings = searchTerm.trim() !== '' ? filteredBookings : bookings;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Cancelled</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">Completed</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Booking Management</h2>
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-white/50" />
        </div> */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {displayBookings.length === 0 ? (
            <div className="text-center py-10 text-white/70">
              {searchTerm ? "No bookings match your search" : "No bookings found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Studio</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date & Time</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {displayBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{booking._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.user?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.studio?.name}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.startTime)}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(booking.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <div className="p-4">
          <div className="flex items-center text-amber-500 mb-4">
            <FaExclamationTriangle className="mr-2" />
            <p>Are you sure you want to cancel this booking?</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cancellation Reason</label>
            <textarea
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide a reason for cancellation..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 bg-transparent border border-white/20 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;
