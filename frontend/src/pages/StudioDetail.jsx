import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { format, addDays } from 'date-fns';
import useAuthStore from '../store/authStore';

const StudioDetail = () => {
    const { studioId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated , user} = useAuthStore();

    const [studio, setStudio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('date') || format(new Date(), 'yyyy-MM-dd');
    });
    const [availability, setAvailability] = useState([]);
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchStudioDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/studios/${studioId}`);
                setStudio(response.data.studio);
                setError(null);
            } catch (err) {
                setError('Failed to fetch studio details. Please try again later.');
                console.error('Error fetching studio details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudioDetails();
    }, [studioId]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!studioId || !selectedDate) return;

            try {
                const response = await api.get(`/studios/${studioId}/availability`, {
                    params: { date: selectedDate }
                });
                setAvailability(response.data.availability);
                // Reset selected times when date changes
                setSelectedStartTime(null);
                setSelectedEndTime(null);
            } catch (err) {
                console.error('Error fetching availability:', err);
                setAvailability([]);
            }
        };

        fetchAvailability();
    }, [studioId, selectedDate]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleStartTimeSelect = (time) => {
        setSelectedStartTime(time);
        setSelectedEndTime(null);
    };

    const handleEndTimeSelect = (time) => {
        setSelectedEndTime(time);
    };

    const isTimeSelectable = (time, isEndTime = false) => {
        if (isEndTime) {
            // For end time: must be after start time and available
            if (!selectedStartTime) return false;

            const startHour = parseInt(selectedStartTime.split(':')[0]);
            const currentHour = parseInt(time.split(':')[0]);

            return currentHour > startHour;
        } else {
            // For start time: must be available and have at least one available hour after it
            const currentHour = parseInt(time.split(':')[0]);
            const currentTimeSlot = availability.find(slot => slot.time === time);

            if (!currentTimeSlot || !currentTimeSlot.available) return false;

            // Check if there's at least one available hour after this one
            return availability.some(slot => {
                const slotHour = parseInt(slot.time.split(':')[0]);
                return slotHour > currentHour && slot.available;
            });
        }
    };

    const calculateTotalPrice = () => {
        if (!selectedStartTime || !selectedEndTime || !studio) return 0;

        const startHour = parseInt(selectedStartTime.split(':')[0]);
        const endHour = parseInt(selectedEndTime.split(':')[0]);
        const hours = endHour - startHour;

        return hours * studio.hourlyRate;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname + location.search } });
            return;
        }

        if (!selectedStartTime || !selectedEndTime) {
            setBookingError('Please select both start and end times.');
            return;
        }

        try {
            setIsSubmitting(true);
            setBookingError(null);
            if (isAuthenticated && user) {
                console.log(user._id)
                    await api.post('/rewards/points', {
                      userId: user._id,
                      amount: calculateTotalPrice(),
                      activity: 'booking',
                      description: 'Points earned from booking',
                      referenceId: null
                    });
                  }
            const response = await api.post('/bookings', {
                studioId,
                date: selectedDate,
                startTime: selectedStartTime,
                endTime: selectedEndTime,
                notes: bookingNotes
            });

            setBookingSuccess(true);
            setBookingNotes('');
            setSelectedStartTime(null);
            setSelectedEndTime(null);

            // Scroll to top to show success message
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Error creating booking:', err);
            setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white py-16 px-4 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/book-studio')}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Back to Studios
                    </button>
                </div>
            </div>
        );
    }

    if (!studio) {
        return (
            <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Studio not found</h2>
                    <button
                        onClick={() => navigate('/book-studio')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Back to Studios
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {bookingSuccess && (
                    <div className="bg-green-900/30 border border-green-500 text-white p-4 rounded-md mb-8">
                        <h3 className="text-xl font-bold mb-2">Booking Successful!</h3>
                        <p>Your booking has been confirmed. You can view your bookings in your profile.</p>
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => navigate('/profile', { state: { activeTab: 'bookings' } })}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => setBookingSuccess(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                                Book Another Time
                            </button>
                        </div>
                    </div>
                )}


                <div className="flex flex-col md:flex-row gap-8">
                    {/* Studio Details */}
                    <div className="w-full md:w-1/2">
                        <button
                            onClick={() => navigate('/book-studio')}
                            className="flex items-center text-purple-400 hover:text-purple-300 mb-4"
                        >
                            <span className="mr-1">←</span> Back to Studios
                        </button>

                        <h1 className="text-3xl font-bold mb-2">{studio.name}</h1>

                        <div className="flex items-center mb-4">
                            <span className="bg-purple-900 text-white text-xs px-2 py-1 rounded-full mr-2">
                                {studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}
                            </span>
                            <span className="text-gray-400">{studio.location}</span>
                        </div>

                        <div className="mb-6">
                            {studio.images && studio.images.length > 0 ? (
                                <div className="rounded-lg overflow-hidden h-64">
                                    <img
                                        src={`http://127.0.0.1:5000${studio.images[0]}`}
                                        alt={studio.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-lg bg-gray-800 h-64 flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Description</h2>
                            <p className="text-gray-300">{studio.description}</p>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Amenities</h2>
                            {studio.amenities && studio.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {studio.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-800 text-sm px-3 py-1 rounded-full"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No amenities listed</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-2">Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Hourly Rate</p>
                                    <p className="text-xl font-bold text-purple-400">${studio.hourlyRate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Capacity</p>
                                    <p className="text-xl font-bold">{studio.capacity} people</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="w-full md:w-1/2 bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Book This {studio.type === 'practice' ? 'Practice Room' : 'Studio'}</h2>

                        {bookingError && (
                            <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md mb-4">
                                {bookingError}
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit}>
                            <div className="mb-4">
                                <label htmlFor="date" className="block text-sm font-medium mb-2">
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Select Start Time
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availability
                                        .filter(slot => slot.time.endsWith(':00')) // Only show full hours
                                        .map((slot) => {
                                            const isSelectable = isTimeSelectable(slot.time);
                                            return (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    onClick={() => isSelectable && handleStartTimeSelect(slot.time)}
                                                    className={`py-2 px-1 rounded-md text-center ${selectedStartTime === slot.time
                                                            ? 'bg-purple-600 text-white'
                                                            : isSelectable
                                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    disabled={!isSelectable}
                                                >
                                                    {slot.time}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>

                            {selectedStartTime && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Select End Time
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {availability
                                            .filter(slot => slot.time.endsWith(':00')) // Only show full hours
                                            .map((slot) => {
                                                const isSelectable = isTimeSelectable(slot.time, true);
                                                return (
                                                    <button
                                                        key={`end-${slot.time}`}
                                                        type="button"
                                                        onClick={() => isSelectable && handleEndTimeSelect(slot.time)}
                                                        className={`py-2 px-1 rounded-md text-center ${selectedEndTime === slot.time
                                                                ? 'bg-purple-600 text-white'
                                                                : isSelectable
                                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        disabled={!isSelectable}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {selectedStartTime && selectedEndTime && (
                                <div className="mb-6 p-4 bg-gray-700 rounded-md">
                                    <h3 className="text-lg font-bold mb-2">Booking Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-gray-400 text-sm">Date</p>
                                            <p className="font-medium">{selectedDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Time</p>
                                            <p className="font-medium">{selectedStartTime} - {selectedEndTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Duration</p>
                                            <p className="font-medium">
                                                {parseInt(selectedEndTime) - parseInt(selectedStartTime)} hours
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">Total Price</p>
                                            <p className="font-bold text-purple-400">${calculateTotalPrice()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={bookingNotes}
                                    onChange={(e) => setBookingNotes(e.target.value)}
                                    placeholder="Any special requirements or information for your booking..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedStartTime || !selectedEndTime || isSubmitting}
                                className={`w-full py-3 px-4 rounded-md font-medium ${!selectedStartTime || !selectedEndTime || isSubmitting
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                    } text-white transition-colors`}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                            </button>

                            {!isAuthenticated && (
                                <p className="mt-2 text-sm text-gray-400 text-center">
                                    You'll need to log in to complete your booking.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioDetail;

