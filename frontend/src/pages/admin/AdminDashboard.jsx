import React, { useState } from 'react';
import UserManagement from '../../components/admin/UserManagement';
import { FaUsers, FaClipboardList, FaMusic, FaShoppingBag, FaCalendarAlt, FaGift, FaGuitar } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import StudioManagement from '../../components/admin/StudioManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import BookingManagement from '../../components/admin/BookingManagement';
import RewardManagement from '../../components/admin/RewardManagement';
import ManageInstruments from '../../components/admin/ManageInstruments';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  console.log('AdminDashboard rendered');
  
  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
          
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white">
            <div className="flex mb-6 border-b border-white/20 overflow-x-auto">
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'users' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('users')}
              >
                <span className="mr-2 flex items-center"><FaUsers /></span>
                <span>User Management</span>
              </button>
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'studios' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('studios')}
              >
                <span className="mr-2 flex items-center"><FaMusic /></span>
                <span>Studio Management</span>
              </button>
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'bookings' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                <span className="mr-2 flex items-center"><FaCalendarAlt /></span>
                <span>Booking Management</span>
              </button>
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'products' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('products')}
              >
                <span className="mr-2 flex items-center"><FaShoppingBag /></span>
                <span>Product Management</span>
              </button>
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'instruments' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('instruments')}
              >
                <span className="mr-2 flex items-center"><FaGuitar /></span>
                <span>Instrument Management</span>
              </button>
              <button 
                className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                  activeTab === 'rewards' ? 'border-b-2 border-purple-400 font-medium text-purple-400' : 'text-white'
                }`}
                onClick={() => setActiveTab('rewards')}
              >
                <span className="mr-2 flex items-center"><FaGift /></span>
                <span>Reward System</span>
              </button>
            </div>
            
            <div>
              {activeTab === 'users' && (
                <div className="rounded-md">
                  <UserManagement />
                </div>
              )}
              
              {activeTab === 'studios' && (
                <div className="rounded-md">
                  <StudioManagement />
                </div>
              )}
              
              {activeTab === 'bookings' && (
                <div className="rounded-md">
                  <BookingManagement />
                </div>
              )}
              
              {activeTab === 'products' && (
                <div className="rounded-md">
                  <ProductManagement />
                </div>
              )}
              
              {activeTab === 'instruments' && (
                <div className="rounded-md">
                  <ManageInstruments />
                </div>
              )}
              
              {activeTab === 'rewards' && (
                <div className="rounded-md">
                  <RewardManagement />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
