import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      const cartData = response.data.cart;
      setCart({
        ...cartData,
        itemCount: cartData.items.reduce((count, item) => count + item.quantity, 0)
      });
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Reset cart on error
      setCart({ items: [], total: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  };


  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart/add', { productId, quantity });
      await fetchCart(); // Refresh cart data
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return false;
      
      await api.put('/cart/update', { productId, quantity });
      await fetchCart(); // Refresh cart data
      return true;
    } catch (err) {
      console.error('Error updating cart:', err);
      return false;
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart(); // Refresh cart data
      return true;
    } catch (err) {
      console.error('Error removing item from cart:', err);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [], total: 0, itemCount: 0 });
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
