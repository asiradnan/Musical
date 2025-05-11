import React, { useEffect, useState } from 'react';
import useAdminStore from '../../store/adminStore';
import UserPointsModal from './UserPointsModal';
import { FaGift } from 'react-icons/fa';

const UserManagement = () => {
  const {
    users,
    isLoading,
    error,
    getAllUsers,
    deleteUser
  } = useAdminStore();
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const result = await deleteUser(selectedUser._id);
    if (result) {
      alert('User deleted successfully');
    } else {
      alert(error || 'Failed to delete user');
    }
    setShowConfirmDialog(false);
  };

  const cancelDelete = () => {
    setSelectedUser(null);
    setShowConfirmDialog(false);
  };
  const handleManagePoints = (user) => {
    setSelectedUserForPoints(user);
  };

  // Add this function to handle successful points addition
  const handlePointsSuccess = (result) => {
    setMessage(`Points added successfully. User now has ${result.currentPoints} points and is in the ${result.tier} tier.`);
    getAllUsers(); // Refresh the user list
    setSelectedUserForPoints(null);
  };

  return (
    <div className="p-5 text-white"> {/* Ensure text is white in dark mode */}
      <h1 className="text-2xl font-bold mb-5">User Management</h1>

      {isLoading ? (
        <div className="py-4">Loading users...</div>
      ) : error ? (
        <div className="text-red-400 py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Email</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Role</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Status</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Created At</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-800">
                  <td className="py-2 px-4 border-b border-gray-700">{user.name}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{user.email}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{user.role}</td>
                  <td className="py-2 px-4 border-b border-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                      {user.isActive ? 'Active' : 'Restricted'}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b border-gray-700">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => confirmDelete(user)}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleManagePoints(user)}
                      className="text-purple-400 hover:text-purple-300 mr-2"
                      title="Manage Points"
                    >
                      <FaGift />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dark-themed Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-auto text-white">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 transition"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={handleDeleteUser}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedUserForPoints && (
        <UserPointsModal
          user={selectedUserForPoints}
          onClose={() => setSelectedUserForPoints(null)}
          onSuccess={handlePointsSuccess}
        />
      )}
    </div>
  );
};

export default UserManagement;