import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaPlus, FaSpinner } from 'react-icons/fa';

const StudioManagement = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'practice',
    description: '',
    location: '',
    hourlyRate: '',
    capacity: '',
    amenities: '',
    images: []
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/studios');
      setStudios(response.data.studios || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching studios:', err);
      setError('Failed to load studios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAmenitiesChange = (e) => {
    // Convert comma-separated string to array
    setFormData({
      ...formData,
      amenities: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      images: e.target.files
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    // Validate form
    if (!formData.name || !formData.description || !formData.location || !formData.hourlyRate || !formData.capacity) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create FormData object for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('type', formData.type);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('hourlyRate', formData.hourlyRate);
      submitData.append('capacity', formData.capacity);
      
      // Handle amenities (convert comma-separated string to array)
      if (formData.amenities) {
        const amenitiesArray = formData.amenities.split(',').map(item => item.trim());
        amenitiesArray.forEach(amenity => {
          submitData.append('amenities', amenity);
        });
      }
      
      // Add images if any
      if (formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          submitData.append('images', formData.images[i]);
        }
      }
      
      await api.post('/studios', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormSuccess('Studio created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        type: 'practice',
        description: '',
        location: '',
        hourlyRate: '',
        capacity: '',
        amenities: '',
        images: []
      });
      
      // Refresh studios list
      fetchStudios();
      
      // Close form after successful submission
      setTimeout(() => {
        setShowAddForm(false);
        setFormSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error creating studio:', err);
      setFormError(err.response?.data?.message || 'Failed to create studio. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Studio Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          <FaPlus className="mr-2" />
          Add New Studio
        </button>
      </div>

      {showAddForm && (
        <div className="bg-black/50 p-6 rounded-lg mb-8 border border-white/20">
          <h3 className="text-lg font-medium mb-4">Add New Studio</h3>
          
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
                <label className="block text-sm font-medium mb-1">Name *</label>
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
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="practice">Practice Room</option>
                  <option value="studio">Recording Studio</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate (USD) *</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (people) *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleAmenitiesChange}
                  placeholder="e.g. Piano, Drums, Microphones"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">You can select multiple images (max 5)</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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
                  'Create Studio'
                )}
              </button>
            </div>
          </form>
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
      ) : studios.length === 0 ? (
        <div className="text-center py-12 bg-black/30 rounded-lg border border-white/10">
          <p className="text-gray-400">No studios found. Add your first studio!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black/30 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Rate ($/hr)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Capacity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {studios.map((studio) => (
                <tr key={studio._id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm">{studio.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {studio.type === 'practice' ? 'Practice Room' : 'Recording Studio'}
                  </td>
                  <td className="px-4 py-3 text-sm">{studio.location}</td>
                  <td className="px-4 py-3 text-sm">${studio.hourlyRate}</td>
                  <td className="px-4 py-3 text-sm">{studio.capacity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      studio.isActive 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {studio.isActive ? 'Active' : 'Inactive'}
                    </span>
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

export default StudioManagement;

