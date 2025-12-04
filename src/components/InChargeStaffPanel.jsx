import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, Users } from 'lucide-react';
import { USER_ROLES } from '../constants/config';

export const InChargeStaffPanel = ({ currentUser }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [staffInMyWards, setStaffInMyWards] = useState([]);
  const [isEditingStaff, setIsEditingStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    securityQuestion: 'What is your preferred role?',
    securityAnswer: ''
  });

  const MANAGEABLE_ROLES = ['staff', 'attendant', 'sweeper'];
  const SECURITY_QUESTIONS = [
    'What is your preferred role?',
    'What is your favorite ward/department?',
    'What is your employee ID?',
    'What is your joining year at this hospital?',
    'What is the name of the ward you work in most frequently?',
    'What is your shift preference?',
    'What is the color of your hospital ID card?',
    'In which year did you complete your healthcare qualification?'
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  // Reload staff whenever a user is updated
  useEffect(() => {
    if (wards.length > 0 && allUsers.length > 0) {
      filterStaffInMyWards();
    }
  }, [allUsers, wards, currentUser]);

  const loadAllData = () => {
    const savedUsers = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    const savedWards = JSON.parse(localStorage.getItem('duty_roster_wards') || '[]');
    setAllUsers(savedUsers);
    setWards(savedWards);
  };

  const filterStaffInMyWards = () => {
    // Get all staff assigned to current user's wards
    const myWardIds = currentUser?.assignedWards || [];
    
    const staffList = allUsers.filter(user => {
      // Must be manageable roles
      if (!MANAGEABLE_ROLES.includes(user.role)) {
        return false;
      }
      
      // Must be assigned to at least one of my wards
      const userWards = user.assignedWards || [];
      return userWards.some(wardId => myWardIds.includes(wardId));
    });

    setStaffInMyWards(staffList);
  };

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('clinical_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
  };

  const handleEditStaff = (staff) => {
    setIsEditingStaff(staff);
    setEditFormData({
      fullName: staff.fullName,
      username: staff.username,
      password: staff.password,
      securityQuestion: staff.securityQuestion || 'What is your preferred role?',
      securityAnswer: staff.securityAnswer || ''
    });
  };

  const handleUpdateStaff = () => {
    if (!editFormData.fullName || !editFormData.username) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if username is being changed to an existing one
    if (editFormData.username !== isEditingStaff.username) {
      if (allUsers.find(u => u.username === editFormData.username)) {
        alert('Username already exists');
        return;
      }
    }

    const updatedUsers = allUsers.map(u => 
      u.id === isEditingStaff.id 
        ? { 
            ...u, 
            ...editFormData,
            updatedAt: new Date().toISOString() 
          }
        : u
    );

    saveUsers(updatedUsers);
    setIsEditingStaff(null);
    setEditFormData({
      fullName: '',
      username: '',
      password: '',
      securityQuestion: 'What is your preferred role?',
      securityAnswer: ''
    });
  };

  const handleDeleteStaff = (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    const updatedUsers = allUsers.filter(u => u.id !== staffId);
    saveUsers(updatedUsers);
  };

  const cancelEdit = () => {
    setIsEditingStaff(null);
    setEditFormData({
      fullName: '',
      username: '',
      password: '',
      securityQuestion: 'What is your preferred role?',
      securityAnswer: ''
    });
  };

  const getWardName = (wardId) => {
    const ward = wards.find(w => w.id === wardId);
    return ward ? ward.name : 'Unknown Ward';
  };

  const myWardIds = currentUser?.assignedWards || [];
  const myWardNames = myWardIds.map(getWardName).join(', ');

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">
          Manage staff (Staff, Attendants, Sweepers) assigned to your wards
        </p>
        {myWardNames && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Your Wards:</strong> {myWardNames}
            </p>
          </div>
        )}
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {staffInMyWards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No staff assigned to your wards yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assigned Wards</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffInMyWards.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{staff.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        staff.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        staff.role === 'attendant' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-1 flex-wrap">
                        {(staff.assignedWards || []).map(wardId => (
                          <span key={wardId} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            {getWardName(wardId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit staff"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete staff"
                        >
                          <Trash2 size={18} />
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

      {/* Edit Modal */}
      {isEditingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Staff Member</h2>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
              </div>

              {/* Security Question Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Security Question (for password recovery)</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.securityQuestion}
                    onChange={(e) => setEditFormData({ ...editFormData, securityQuestion: e.target.value })}
                  >
                    {SECURITY_QUESTIONS.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Answer</label>
                  <input
                    type="text"
                    placeholder="Answer to the security question"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.securityAnswer}
                    onChange={(e) => setEditFormData({ ...editFormData, securityAnswer: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">This answer is case-insensitive for password recovery</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleUpdateStaff}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  Update Staff
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
          </div>
        </div>
      )}
    </div>
  );
};
