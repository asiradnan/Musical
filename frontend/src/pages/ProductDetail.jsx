import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  // Add state for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data.product);
        setError(null);
        
        // Fetch related products
        if (response.data.product.category) {
          const relatedResponse = await api.get(`/products`, {
            params: {
              category: response.data.product.category,
              limit: 4,
              exclude: productId
            }
          });
          setRelatedProducts(relatedResponse.data.products);
        }
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = async () => {
    try {
      await api.post('/cart/add', { productId, quantity });
      toast.success('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const buyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }
    
    // Add to cart and redirect to checkout
    addToCart().then(() => {
      navigate('/checkout');
    });
  };

  // Add function to fetch comments
  const fetchComments = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to view comments');
      return;
    }
    
    try {
      setLoadingComments(true);
      const response = await api.get(`/products/${productId}/comments`);
      setComments(response.data.comments);
      setShowComments(true);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  // Add function to handle comment submission
  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add a comment');
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await api.post(`/products/${productId}/comments`, {
        content: newComment
      });
      
      // Add the new comment to the comments array
      setComments([...comments, response.data.comment]);
      
      // Clear the comment input
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    } else {
      setShowComments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
        <Navbar />
        <div className="container mx-auto p-8">
          <div className="bg-red-500/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
            {error || 'Product not found'}
          </div>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('/piano-background.jpg')" }}>
      <Navbar />
      <div className="container mx-auto p-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
        >
          <span className="mr-1">←</span> Back to Products
        </button>

        <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              {product.images && product.images.length > 0 ? (
                <div>
                  <div className="rounded-lg overflow-hidden h-80 mb-4">
                    <img
                      src={`http://127.0.0.1:5000${product.images[activeImage]}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                            activeImage === index ? 'border-blue-500' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={`http://127.0.0.1:5000${image}`}
                            alt={`${product.name} - view ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-800 h-80 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="bg-blue-900 text-white text-xs px-2 py-1 rounded-full mr-2">
                  {product.category}
                </span>
                <span className="text-gray-400">{product.brand}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-400">${product.price.toFixed(2)}</span>
                {product.discount > 0 && (
                  <span className="ml-2 text-lg text-gray-400 line-through">
                    ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">{product.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Availability</p>
                    <p className={`font-bold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </p>
                  </div>
                  {product.color && (
                    <div>
                      <p className="text-gray-400 text-sm">Color</p>
                      <p className="font-bold">{product.color}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {product.stock > 0 && (
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={decrementQuantity}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-l-md"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock}
                      className="w-16 text-center bg-gray-700 border-0 text-white py-2"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-r-md"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addToCart}
                  disabled={product.stock <= 0}
                  className={`py-3 px-4 rounded-md font-medium flex-1 ${
                    product.stock <= 0
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  Add to Cart
                </button>
                
                <button
                  onClick={buyNow}
                  disabled={product.stock <= 0}
                  className={`py-3 px-4 rounded-md font-medium flex-1 ${
                    product.stock <= 0
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                >
                  Buy Now
                </button>
              </div>
              
              {!isAuthenticated && (
                <p className="mt-2 text-sm text-gray-400 text-center">
                  You'll need to log in to complete your purchase.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30">
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="border-b border-gray-700 pb-2">
                  <p className="text-gray-400 text-sm">{key}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comments Section */}
        <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          
          <button 
            onClick={toggleComments}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            {showComments ? 'Hide Reviews' : 'Show Reviews'}
          </button>
          
          {showComments && (
            <div className="space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-white/10 p-3 rounded-lg">
                                        <p>{comment.content}</p>
                    <div className="flex justify-between items-center mt-2 text-sm text-white/60">
                      <span>{comment.author.name}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60">No reviews yet. Be the first to review this product!</p>
              )}
              
              {/* Add comment form */}
              {isAuthenticated && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Add Your Review</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your review..."
                      className="flex-grow p-2 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-blue-900/40 rounded-lg">
                  <p className="text-center">
                    Please <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline">log in</button> to leave a review.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct._id} className="bg-black/50 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 transition-transform hover:scale-105">
                  <a href={`/products/${relatedProduct._id}`}>
                    <img 
                      src={`http://127.0.0.1:5000${relatedProduct.images[0]}`} 
                      alt={relatedProduct.name} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg">{relatedProduct.name}</h3>
                      <p className="text-white/70 text-sm">{relatedProduct.brand}</p>
                      <p className="text-blue-400 font-bold mt-2">${relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="bg-black bg-opacity-50 text-center p-4">
        <p>© 2025 Resonance. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default ProductDetail;
