import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaSearch, FaEdit, FaTrash, FaCalendarAlt, FaPlus, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';

const ManageInstruments = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'string',
    description: '',
    brand: '',
    condition: 'good',
    dailyRate: '',
    images: []
  });
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchInstruments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInstruments([]);
    } else {
      const filtered = instruments.filter(
        instrument => 
          instrument.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instrument.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instrument.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstruments(filtered);
    }
  }, [searchTerm, instruments]);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/r/instruments');
      setInstruments(response.data.instruments);
      setLoading(false);
    } catch (err) {
      setError('Failed to load instruments. Please try again later.');
      setLoading(false);
      console.error('Error fetching instruments:', err);
      toast.error('Failed to load instruments');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append images
      if (formData.images) {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append('images', formData.images[i]);
        }
      }
      
      if (selectedInstrument) {
        // Update existing instrument
        await api.put(`/r/instruments/${selectedInstrument._id}`, formDataToSend);
        toast.success('Instrument updated successfully');
      } else {
        // Create new instrument
        await api.post('/r/instruments', formDataToSend);
        toast.success('Instrument added successfully');
      }
      
      // Reset form and fetch updated list
      setFormData({
        name: '',
        type: 'string',
        description: '',
        brand: '',
        condition: 'good',
        dailyRate: '',
        images: []
      });
      setSelectedInstrument(null);
      setShowAddForm(false);
      fetchInstruments();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save instrument. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to save instrument');
      console.error('Error saving instrument:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instrument) => {
    setSelectedInstrument(instrument);
    setFormData({
      name: instrument.name,
      type: instrument.type,
      description: instrument.description,
      brand: instrument.brand,
      condition: instrument.condition,
      dailyRate: instrument.dailyRate,
      images: []
    });
    setShowAddForm(true);
  };

  const openDeleteModal = (instrument) => {
    setSelectedInstrument(instrument);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedInstrument) return;
    
    try {
      setLoading(true);
      await api.delete(`/r/instruments/${selectedInstrument._id}`);
      toast.success('Instrument deleted successfully');
      setShowDeleteModal(false);
      setSelectedInstrument(null);
      fetchInstruments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete instrument. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to delete instrument');
      console.error('Error deleting instrument:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRentals = (instrumentId) => {
    navigate(`/admin/instruments/${instrumentId}/rentals`);
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? 
      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Available</span> :
      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Unavailable</span>;
  };

  const displayInstruments = searchTerm.trim() !== '' ? (filteredInstruments || []) : (instruments || []);
  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Instrument Management</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search instruments..."
                className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-white/50" />
            </div>
            <button
              onClick={() => {
                setSelectedInstrument(null);
                setFormData({
                  name: '',
                  type: 'string',
                  description: '',
                  brand: '',
                  condition: 'good',
                  dailyRate: '',
                  images: []
                });
                setShowAddForm(!showAddForm);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {showAddForm ? <><FaTimes className="mr-2" /> Cancel</> : <><FaPlus className="mr-2" /> Add Instrument</>}
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-800/30 border border-red-700 p-4 rounded-lg mb-6 text-red-200">
            <p>{error}</p>
          </div>
        )}
        
        {showAddForm && (
          <div className="bg-black/30 border border-white/10 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400">
              {selectedInstrument ? 'Edit Instrument' : 'Add New Instrument'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Instrument Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="string">String</option>
                    <option value="wind">Wind</option>
                    <option value="percussion">Percussion</option>
                    <option value="electronic">Electronic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-2 text-sm">Daily Rate ($)</label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
                  required
                ></textarea>
              </div>
              
              {/* <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Images</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-white/50 text-xs mt-1">
                  {selectedInstrument ? 'Upload new images to add to existing ones' : 'You can select multiple images'}
                </p>
              </div> */}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (selectedInstrument ? 'Update Instrument' : 'Add Instrument')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {loading && !showAddForm ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {displayInstruments.length === 0 ? (
              <div className="bg-black/30 border border-white/10 p-8 rounded-lg text-center">
                <div className="text-6xl mb-6">🎸</div>
                <h2 className="text-xl font-bold mb-4">No Instruments Available</h2>
                <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                  {searchTerm ? "No instruments match your search" : "There are currently no instruments in the system. Add your first instrument using the button above."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Daily Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {displayInstruments.map((instrument) => (
                      <tr key={instrument._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{instrument.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{instrument.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{instrument.brand}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{instrument.condition}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${instrument.dailyRate}/day</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(instrument.isAvailable)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(instrument)}
                              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                              title="Edit instrument"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openDeleteModal(instrument)}
                              className="text-red-400 hover:text-red-300 transition-colors flex items-center"
                              title="Delete instrument"
                            >
                              <FaTrash />
                            </button>
                            {/* <button
                              onClick={() => handleViewRentals(instrument._id)}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center"
                              title="View rentals"
                            >
                              <FaCalendarAlt />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Instrument"
      >
        <div className="p-4">
          <div className="flex items-center text-amber-500 mb-4">
            <FaExclamationTriangle className="mr-2" />
            <p>Are you sure you want to delete this instrument?</p>
          </div>
          
          {selectedInstrument && (
            <div className="mb-4 p-3 bg-black/30 rounded-lg">
              <p><span className="text-white/50">Name:</span> {selectedInstrument.name}</p>
              <p><span className="text-white/50">Brand:</span> {selectedInstrument.brand}</p>
              <p><span className="text-white/50">Type:</span> {selectedInstrument.type}</p>
            </div>
          )}
          
          <p className="text-white/70 text-sm mb-4">
            This action cannot be undone. All rental records will remain in the system, but the instrument will no longer be available.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-transparent border border-white/20 rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageInstruments;
