import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: '',
        featured: false
    });
    const [images, setImages] = useState([]);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Hardcoded arrays for categories and brands instead of fetching from API
    const categories = ['guitars', 'drums', 'keyboards', 'bass', 'amplifiers', 'accessories', 'recording', 'other'];
    const brands = [
        'Fender', 'Gibson', 'Ibanez', 'Yamaha', 'Roland', 'Korg', 'Pearl', 'Tama',
        'Zildjian', 'Shure', 'Audio-Technica', 'Behringer', 'Marshall', 'Boss',
        'Ernie Ball', 'D\'Addario', 'Epiphone', 'PRS', 'Taylor', 'Martin'
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/products');
            setProducts(response.data.products || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            brand: '',
            stock: '',
            featured: false
        });
        setImages([]);
        setCurrentProduct(null);
        setFormError(null);
        setFormSuccess(null);
    };

    const openModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                brand: product.brand,
                stock: product.stock,
                featured: product.featured || false
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        // Validate form
        if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.brand || !formData.stock) {
            setFormError('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            // Append form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Append images
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    formDataToSend.append('images', images[i]);
                }
            }

            let response;

            if (currentProduct) {
                // Update existing product
                response = await api.put(`/products/${currentProduct._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Update products list
                setProducts(products.map(p =>
                    p._id === currentProduct._id ? response.data.product : p
                ));

                setFormSuccess('Product updated successfully!');
            } else {
                // Create new product
                response = await api.post('/products', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Add new product to list
                setProducts([...products, response.data.product]);

                setFormSuccess('Product created successfully!');
            }

            // Close modal after successful submission
            setTimeout(() => {
                setShowModal(false);
                resetForm();
            }, 2000);

        } catch (err) {
            console.error('Error saving product:', err);
            setFormError(err.response?.data?.message || 'Failed to save product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
                toast.success('Product deleted successfully');
            } catch (err) {
                console.error('Error deleting product:', err);
                toast.error('Failed to delete product');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Product Management</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    <FaPlus className="mr-2" />
                    Add New Product
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">
                            {currentProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        {formError && (
                            <div className="bg-red-900/30 border border-red-500 text-white p-3 rounded-md mb-4">
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="bg-green-900/30 border border-green-500 text-white p-3 rounded-md mb-4">
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (USD) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0.01"
                                        step="0.01"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Brand *</label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand} value={brand}>
                                                {brand}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-emerald-600 rounded"
                                    />
                                    <label htmlFor="featured" className="ml-2 text-sm">
                                        Featured Product
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Product Images</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    accept="image/*"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {currentProduct ? "Upload new images to add to existing ones (max 5 total)" : "Upload up to 5 product images"}
                                </p>
                            </div>

                            {currentProduct && currentProduct.images && currentProduct.images.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Current Images
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {currentProduct.images.map((img, index) => (
                                            <div key={index} className="w-20 h-20 relative">
                                                <img
                                                    src={img}
                                                    alt={`Product ${index}`}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        currentProduct ? 'Update Product' : 'Create Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                </div>
            ) : error ? (
                <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md">
                    {error}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-black/30 rounded-lg border border-white/10">
                    <p className="text-gray-400">No products found. Add your first product!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-black/30 rounded-lg overflow-hidden">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Brand</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Stock</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Featured</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-800/50">
                                    <td className="px-4 py-3 text-sm">{product.name}</td>
                                    <td className="px-4 py-3 text-sm">{product.category}</td>
                                    <td className="px-4 py-3 text-sm">{product.brand}</td>
                                    <td className="px-4 py-3 text-sm">${product.price}</td>
                                    <td className="px-4 py-3 text-sm">{product.stock}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.featured
                                                ? 'bg-green-900/50 text-green-400'
                                                : 'bg-gray-700/50 text-gray-400'
                                            }`}>
                                            {product.featured ? 'Featured' : 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => openModal(product)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                title="Edit product"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete product"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;

