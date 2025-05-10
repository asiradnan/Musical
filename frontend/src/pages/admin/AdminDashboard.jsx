import React, { useState } from 'react';
import UserManagement from '../../components/admin/UserManagement';
import { FaUsers, FaClipboardList } from 'react-icons/fa';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  console.log('AdminDashboard rendered');
  
  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        
        <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white">
          <div className="flex mb-6 border-b border-white/20">
            <button 
              className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                activeTab === 'users' ? 'border-b-2 border-emerald-500 font-medium text-emerald-400' : 'text-white'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <span className="mr-2 flex items-center"><FaUsers /></span>
              <span>User Management</span>
            </button>
            <button 
              className={`flex items-center px-4 py-3 text-base transition-colors hover:bg-white/10 ${
                activeTab === 'reports' ? 'border-b-2 border-emerald-500 font-medium text-emerald-400' : 'text-white'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="mr-2 flex items-center"><FaClipboardList /></span>
              <span>Reports</span>
            </button>
          </div>
          
          <div>
            {activeTab === 'users' && (
              <div className="rounded-md">
                <UserManagement />
                
              </div>
            )}
            
            {activeTab === 'reports' && (
              <div className="rounded-md">
                <h2 className="text-xl font-medium mb-4">Reports Management</h2>
                <p className="text-white/80">Review and handle reported content and user complaints.</p>
                
                <div className="mt-6 flex space-x-4">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md">
                    View All Reports
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md border border-white/30">
                    Filter Reports
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
