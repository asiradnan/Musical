import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { FaSpinner, FaArrowLeft, FaCreditCard, FaLock, FaGift } from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const Checkout = () => {
  const { cart, loading, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [rewardInfo, setRewardInfo] = useState(null);
  const [useRewards, setUseRewards] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);

  useEffect(() => {
    // Fetch user rewards if authenticated
    const fetchRewards = async () => {
      if (isAuthenticated && user) {
        try {
          setRewardLoading(true);
          console.log(user)
          const response = await api.get(`/rewards/user/${user._id}`);
          setRewardInfo(response.data);
          setRewardLoading(false);
        } catch (error) {
          console.error('Error fetching rewards:', error);
          setRewardLoading(false);
        }
      }
    };

    fetchRewards();
  }, [isAuthenticated, user]);

  if (loading || rewardLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl text-purple-500" />
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
          <div className="bg-black/70 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
            <p className="text-white/70 mb-6">Your cart is empty. Please add items before checkout.</p>
            <Link to="/shop" className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Shipping info validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    // Payment info validation
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
      newErrors.cardNumber = 'Card number must be 16 digits';
    
    if (!formData.cardName) newErrors.cardName = 'Name on card is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) 
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv)) 
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDiscount = () => {
    if (!useRewards || !rewardInfo) return 0;
    
    const discountPercent = rewardInfo.discount || 0;
    return (cart.total * (discountPercent / 100)).toFixed(2);
  };

  const calculateFinalTotal = () => {
    const subtotal = cart.total || 0;
    const discount = useRewards && rewardInfo ? parseFloat(calculateDiscount()) : 0;
    const shipping = 5.99;
    const tax = subtotal * 0.07;
    
    return (subtotal - discount + shipping + tax).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Add points for purchase if authenticated
      if (isAuthenticated && user) {
        const pointsToAdd = Math.floor(cart.total);
        await api.post('/rewards/points', {
          userId: user._id,
          amount: pointsToAdd,
          activity: 'purchase',
          description: 'Points earned from purchase',
          referenceId: null
        });
      }
      
      // Simulate payment processing
      setTimeout(() => {
        // Simulate successful order
        setIsProcessing(false);
        
        // Clear cart after successful order
        refreshCart();
        
        // Redirect to order confirmation
        navigate('/order-confirmation', { 
          state: { 
            orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            orderTotal: calculateFinalTotal(),
            pointsEarned: Math.floor(cart.total)
          } 
        });
      }, 2000);
    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Shipping Information */}
              <div className="bg-black/70 backdrop-blur-md p-6 rounded-lg border border-white/20 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/70 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.firstName ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.lastName ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.address ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.city ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.state ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.zipCode ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="bg-black/70 backdrop-blur-md p-6 rounded-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Payment Information</h2>
                  <div className="flex items-center text-white/70">
                    <FaLock className="mr-2" />
                    <span className="text-sm">Secure Payment</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full bg-white/10 border ${errors.cardNumber ? 'border-red-500' : 'border-white/20'} rounded-md p-2 pl-10 text-white`}
                      maxLength="19"
                    />
                    <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  </div>
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-white/70 mb-1">Name on Card</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.cardName ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                  />
                  {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className={`w-full bg-white/10 border ${errors.expiryDate ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                      maxLength="5"
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className={`w-full bg-white/10 border ${errors.cvv ? 'border-red-500' : 'border-white/20'} rounded-md p-2 text-white`}
                      maxLength="4"
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <Link to="/cart" className="inline-flex items-center text-white/70 hover:text-white">
                  <FaArrowLeft className="mr-2" /> Back to Cart
                </Link>
                
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-md font-medium flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-lg border border-white/20 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.items && cart.items.map(item => (
                item && item.product && (
                  <div key={item.product._id} className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden mr-3">
                        <img 
                          src={item.product.images && item.product.images.length > 0 
                            ? `http://127.0.0.1:5000${item.product.images[0]}`
                            : '/placeholder-image.jpg'} 
                          alt={item.product.name || 'Product'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-white text-sm">{item.product.name}</p>
                        <p className="text-white/50 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-white">${(item.subtotal || 0).toFixed(2)}</p>
                  </div>
                )
              ))}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${(cart.total || 0).toFixed(2)}</span>
              </div>
              
              {/* Rewards Discount Section */}
              {isAuthenticated && rewardInfo && (
                <div className="pt-2 pb-3 border-t border-white/10">
                  <div className="flex items-center mb-2">
                    <FaGift className="text-purple-400 mr-2" />
                    <span className="text-white font-medium">Rewards</span>
                  </div>
                  
                  <div className="bg-purple-900/30 rounded-md p-3 mb-2">
                    <div className="flex justify-between text-white mb-1">
                      <span>Current Tier:</span>
                      <span className="font-medium">{rewardInfo.tier}</span>
                    </div>
                    <div className="flex justify-between text-white mb-1">
                      <span>Points:</span>
                      <span>{rewardInfo.points}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Available Discount:</span>
                      <span>{rewardInfo.discount}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useRewards"
                      checked={useRewards}
                      onChange={() => setUseRewards(!useRewards)}
                      className="mr-2"
                    />
                    <label htmlFor="useRewards" className="text-white/70 text-sm">
                      Apply rewards discount ({rewardInfo.discount}% off)
                    </label>
                  </div>
                  
                  {useRewards && (
                    <div className="flex justify-between text-purple-400 mt-2">
                      <span>Discount</span>
                      <span>-${calculateDiscount()}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax (7%)</span>
                <span>${((cart.total || 0) * 0.07).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 mb-6">
              <div className="flex justify-between text-white font-bold">
                <span>Total</span>
                <span>${calculateFinalTotal()}</span>
              </div>
              
              {isAuthenticated && (
                <p className="text-green-400 text-sm mt-2">
                  You'll earn {Math.floor(cart.total)} points with this purchase!
                </p>
              )}
            </div>
            
            <div className="bg-white/5 p-4 rounded-md mb-4">
              <p className="text-white/70 text-sm">
                This is a demo checkout. No actual payment will be processed.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <img src="/visa-icon.png" alt="Visa" className="h-6" onError={(e) => {e.target.style.display = 'none'}} />
              <img src="/mastercard-icon.png" alt="Mastercard" className="h-6" onError={(e) => {e.target.style.display = 'none'}} />
              <img src="/amex-icon.png" alt="American Express" className="h-6" onError={(e) => {e.target.style.display = 'none'}} />
              <img src="/paypal-icon.png" alt="PayPal" className="h-6" onError={(e) => {e.target.style.display = 'none'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

