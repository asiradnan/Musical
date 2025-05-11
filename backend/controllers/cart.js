import Cart from '../models/cart.js';
import Product from '../models/product.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price images brand stock'
    });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  console.log('addToCart function called');
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        total: 0
      });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${product.stock} items available in stock`
        });
      }
      
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].subtotal = product.price * newQuantity;
    } else {
      // Product not in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        subtotal: product.price * quantity
      });
    }
    
    // Calculate total
    cart.total = cart.items.reduce((total, item) => total + item.subtotal, 0);
    
    await cart.save();
    
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'name price images brand stock'
    });
    console.log('Cart after populating:', cart);
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or quantity'
      });
    }
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
        // Check if product is in stock
        if (product.stock < quantity) {
            return res.status(400).json({
              success: false,
              message: `Only ${product.stock} items available in stock`
            });
          }
          
          // Find user's cart
          const cart = await Cart.findOne({ user: userId });
          
          if (!cart) {
            return res.status(404).json({
              success: false,
              message: 'Cart not found'
            });
          }
          
          // Find the item in the cart
          const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
          );
          
          if (itemIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Item not found in cart'
            });
          }
          
          // Update quantity and subtotal
          cart.items[itemIndex].quantity = quantity;
          cart.items[itemIndex].subtotal = product.price * quantity;
          
          // Recalculate total
          cart.total = cart.items.reduce((total, item) => total + item.subtotal, 0);
          
          await cart.save();
          
          // Populate product details before sending response
          await cart.populate({
            path: 'items.product',
            select: 'name price images brand stock'
          });
          
          res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart
          });
        } catch (error) {
          console.error('Error updating cart:', error);
          res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
          });
        }
      };
      
      // Remove item from cart
      export const removeCartItem = async (req, res) => {
        try {
          const userId = req.user.userId;
          const { productId } = req.params;
          
          // Find user's cart
          const cart = await Cart.findOne({ user: userId });
          
          if (!cart) {
            return res.status(404).json({
              success: false,
              message: 'Cart not found'
            });
          }
          
          // Remove the item from cart
          const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
          );
          
          if (itemIndex === -1) {
            return res.status(404).json({
              success: false,
              message: 'Item not found in cart'
            });
          }
          
          cart.items.splice(itemIndex, 1);
          
          // Recalculate total
          cart.total = cart.items.reduce((total, item) => total + item.subtotal, 0);
          
          await cart.save();
          
          // Populate product details before sending response
          await cart.populate({
            path: 'items.product',
            select: 'name price images brand stock'
          });
          
          res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart
          });
        } catch (error) {
          console.error('Error removing item from cart:', error);
          res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
          });
        }
      };
      
      // Clear cart
      export const clearCart = async (req, res) => {
        try {
          const userId = req.user.userId;
          
          // Find user's cart
          const cart = await Cart.findOne({ user: userId });
          
          if (!cart) {
            return res.status(404).json({
              success: false,
              message: 'Cart not found'
            });
          }
          
          // Clear items and reset total
          cart.items = [];
          cart.total = 0;
          
          await cart.save();
          
          res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart
          });
        } catch (error) {
          console.error('Error clearing cart:', error);
          res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
          });
        }
      };
      
