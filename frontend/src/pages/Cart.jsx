import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { FaSpinner, FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const Cart = () => {
  console.log("Cart component rendered");
  const { cart, loading, updateQuantity, removeItem, refreshCart } = useCart();

  if (loading) {
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
          <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
          <div className="bg-black/70 backdrop-blur-md p-8 rounded-lg border border-white/20 text-center">
            <FaShoppingCart className="mx-auto text-5xl text-white/50 mb-4" />
            <p className="text-white/70 mb-6">Your cart is empty</p>
            <Link to="/shop" className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeItem(productId);
    }
  };

  // Process cart items to handle duplicates and null products
  const processedCartItems = [];
  const productMap = new Map();

  // First pass: Group items by product ID and prioritize ones with images
  if (cart.items && cart.items.length > 0) {
    cart.items.forEach(item => {
      if (!item || !item.product) return;
      
      const productId = item.product._id;
      if (!productId) return;
      
      const existingItem = productMap.get(productId);
      
      // If this is a new product or the current item has images while the existing one doesn't
      if (!existingItem || 
          (!existingItem.product.images && item.product.images && item.product.images.length > 0)) {
        productMap.set(productId, item);
      }
    });
    
    // Convert map values to array
    productMap.forEach(item => {
      processedCartItems.push(item);
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Cart Items */}
            <div className="bg-black/70 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
              {processedCartItems.map((item) => (
                <div key={item.product._id} className="p-4 border-b border-white/20 last:border-b-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 w-24 h-24 bg-white/5 rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
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
                    
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <Link to={`/products/${item.product._id}`} className="text-white hover:text-purple-400">
                          <h3 className="font-medium">{item.product.name || 'Unknown Product'}</h3>
                        </Link>
                        <button 
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <p className="text-white/70 text-sm">{item.product.brand || ''}</p>
                      <p className="text-purple-400 mt-1">${(item.product.price || 0).toFixed(2)}</p>
                      
                      <div className="flex items-center mt-2">
                        <button 
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="bg-white/20 text-white w-8 h-8 flex items-center justify-center rounded-l-md disabled:opacity-50"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value) || 1)}
                          className="w-12 h-8 bg-white/10 text-white text-center border-y border-white/20"
                        />
                        <button 
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          className="bg-white/20 text-white w-8 h-8 flex items-center justify-center rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right mt-4 sm:mt-0 sm:ml-4">
                      <p className="text-white font-medium">${(item.subtotal || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link to="/products" className="inline-flex items-center text-white/70 hover:text-white">
                <FaArrowLeft className="mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-lg border border-white/20 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${(cart.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-4 mb-6">
              <div className="flex justify-between text-white font-bold">
                <span>Total</span>
                <span>${(cart.total || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md text-center font-medium"
            >
              Proceed to Checkout
            </Link>
            
            <Link 
              to="/shop" 
              className="block w-full bg-transparent border border-white/30 text-white py-3 rounded-md text-center font-medium mt-4 hover:bg-white/10"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
