import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Users as UsersIcon, Loader2 } from 'lucide-react';
import { fetchWards, createWard, deleteWard } from '../services/wards';

export const AdminWardManagement = () => {
  const [wards, setWards] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAddingWard, setIsAddingWard] = useState(false);
  const [newWardName, setNewWardName] = useState('');
  const [selectedWard, setSelectedWard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWards();
    loadUsers();
  }, []);

  const loadWards = async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await fetchWards();
      setWards(data);
    } catch (err) {
      setError('Failed to load wards. Please retry.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    // Filter out admin users
    setUsers(savedUsers.filter(u => u.role !== 'admin'));
  };

  const handleAddWard = async () => {
    if (!newWardName.trim()) {
      alert('Please enter a ward name');
      return;
    }

    if (wards.find(w => w.name.toLowerCase() === newWardName.toLowerCase())) {
      alert('Ward with this name already exists');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const created = await createWard(newWardName.trim());
      setWards(prev => [...prev, created]);
      setNewWardName('');
      setIsAddingWard(false);
    } catch (err) {
      setError('Failed to create ward. Please retry.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWard = async (wardId) => {
    if (window.confirm('Are you sure you want to delete this ward? This action cannot be undone.')) {
      try {
        setError('');
        setIsLoading(true);
        await deleteWard(wardId);

        const updatedWards = wards.filter(w => w.id !== wardId);
        setWards(updatedWards);
        
        // Remove ward from all users' assignments (still stored locally for now)
        const updatedUsers = users.map(u => ({
          ...u,
          assignedWards: (u.assignedWards || []).filter(wId => wId !== wardId)
        }));
        localStorage.setItem('clinical_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setSelectedWard(null);
      } catch (err) {
        setError('Failed to delete ward. Please retry.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getWardUsers = (wardId) => {
    return users.filter(u => (u.assignedWards || []).includes(wardId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 size={28} />
              Ward Management
            </h1>
            <p className="text-blue-100 mt-1">Create and manage hospital wards</p>
          </div>
          <div className="flex items-center gap-3">
            {isLoading && <Loader2 size={20} className="animate-spin" />}
            <button
              onClick={() => setIsAddingWard(true)}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              disabled={isLoading}
            >
              <Plus size={18} />
              Create Ward
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Ward Form */}
      {isAddingWard && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Ward</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter ward name (e.g., ICU, Cardiology, General Ward)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newWardName}
              onChange={(e) => setNewWardName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWard()}
            />
            <button
              onClick={handleAddWard}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
              disabled={isLoading}
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAddingWard(false);
                setNewWardName('');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wards.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No wards created yet</p>
            <p className="text-gray-400">Click "Create Ward" to get started</p>
          </div>
        ) : (
          wards.map(ward => {
            const wardUsers = getWardUsers(ward.id);
            return (
              <div
                key={ward.id}
                onClick={() => setSelectedWard(ward.id === selectedWard ? null : ward.id)}
                className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedWard === ward.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{ward.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWard(ward.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    title="Delete ward"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UsersIcon size={16} />
                  <span className="font-medium">{wardUsers.length} user(s) assigned</span>
                </div>

                {selectedWard === ward.id && wardUsers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Assigned Users</p>
                    {wardUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedWard === ward.id && wardUsers.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-400 italic">No users assigned to this ward yet</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  Created: {new Date(ward.createdAt || ward.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About Ward Management:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Create Ward:</strong> Add new hospital wards/departments</li>
          <li>• <strong>View Users:</strong> Click on a ward to see assigned users</li>
          <li>• <strong>Delete Ward:</strong> Remove wards (will automatically remove from user assignments)</li>
          <li>• <strong>Assign Users:</strong> Go to User Management to assign users to wards</li>
        </ul>
      </div>
    </div>
  );
};
