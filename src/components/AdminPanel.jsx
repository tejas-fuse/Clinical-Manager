import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Save, X, Users } from 'lucide-react';
import { USER_ROLES } from '../constants/config';

export const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'in_charge',
    assignedWards: [] // Array of ward IDs
  });

  useEffect(() => {
    loadUsers();
    loadWards();
  }, []);

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    setUsers(savedUsers);
  };

  const loadWards = () => {
    const savedWards = JSON.parse(localStorage.getItem('duty_roster_wards') || '[]');
    setWards(savedWards);
  };

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('clinical_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    if (!formData.fullName || !formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    if (users.find(u => u.username === formData.username)) {
      alert('Username already exists');
      return;
    }

    const newUser = {
      id: Date.now(),
      ...formData,
      assignedWards: formData.assignedWards || [],
      createdAt: new Date().toISOString()
    };

    saveUsers([...users, newUser]);
    setFormData({ fullName: '', username: '', password: '', role: 'in_charge', assignedWards: [] });
    setIsAddingUser(false);
  };

  const handleUpdateUser = () => {
    if (!formData.fullName || !formData.username) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...formData, assignedWards: formData.assignedWards || [], updatedAt: new Date().toISOString() }
        : u
    );

    saveUsers(updatedUsers);
    setEditingUser(null);
    setFormData({ fullName: '', username: '', password: '', role: 'in_charge', assignedWards: [] });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      saveUsers(users.filter(u => u.id !== userId));
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      password: user.password,
      role: user.role,
      assignedWards: user.assignedWards || []
    });
    setIsAddingUser(false);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setFormData({ fullName: '', username: '', password: '', role: 'in_charge', assignedWards: [] });
  };

  const toggleWardAssignment = (wardId) => {
    const currentWards = formData.assignedWards || [];
    if (currentWards.includes(wardId)) {
      setFormData({ ...formData, assignedWards: currentWards.filter(id => id !== wardId) });
    } else {
      setFormData({ ...formData, assignedWards: [...currentWards, wardId] });
    }
  };

  // Filter roles that should show in login
  const loginRoles = Object.values(USER_ROLES).filter(r => r.showInLogin);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users size={28} />
              User Management
            </h1>
            <p className="text-purple-100 mt-1">Manage all system users and their access</p>
          </div>
          <button
            onClick={() => {
              setIsAddingUser(true);
              setEditingUser(null);
              setFormData({ fullName: '', username: '', password: '', role: 'staff' });
            }}
            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            <UserPlus size={18} />
            Add New User
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAddingUser || editingUser) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {loginRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Ward Assignment */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Wards</label>
            {wards.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No wards available. Create wards in Ward Management tab.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {wards.map(ward => (
                  <label key={ward.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.assignedWards || []).includes(ward.id)}
                      onChange={() => toggleWardAssignment(ward.id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{ward.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingUser ? handleUpdateUser : handleAddUser}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save size={18} />
              {editingUser ? 'Update User' : 'Add User'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Users ({users.filter(u => u.role !== 'admin').length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Full Name</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Username</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Assigned Wards</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Created</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role !== 'admin').length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No users found. Add your first user to get started.
                  </td>
                </tr>
              ) : (
                users.filter(u => u.role !== 'admin').map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold">
                          {user.fullName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{user.username}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {USER_ROLES[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {(user.assignedWards || []).length === 0 ? (
                        <span className="text-sm text-gray-400 italic">No wards assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(user.assignedWards || []).map(wardId => {
                            const ward = wards.find(w => w.id === wardId);
                            return ward ? (
                              <span key={wardId} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                {ward.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">User Role Permissions:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li><strong>In-Charge:</strong> Can edit duties, approve requests, view analytics, and print</li>
          <li><strong>Staff:</strong> Can view In-Charge & Staff duties, submit change requests</li>
          <li><strong>Attendant:</strong> Can view Attendant & Sweeper duties, submit change requests</li>
          <li><strong>Sweeper:</strong> Can view Sweeper duties only, submit change requests</li>
        </ul>
      </div>
    </div>
  );
};
