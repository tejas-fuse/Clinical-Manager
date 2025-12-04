import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp, Award, Clock, Edit2, Save, X, Camera } from 'lucide-react';
import { SHIFTS } from '../constants/config';

export const ProfileView = ({ currentUser, allAssignments, currentWardId, staffList }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: currentUser?.fullName || '',
    username: currentUser?.username || '',
    password: currentUser?.password || '',
    profilePhoto: currentUser?.profilePhoto || ''
  });
  const [photoPreview, setPhotoPreview] = useState(currentUser?.profilePhoto || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setEditError('Photo size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setEditError('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setEditFormData({ ...editFormData, profilePhoto: reader.result });
        setEditError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setEditError('');
    setEditSuccess('');
    if (!editFormData.fullName || !editFormData.username) {
      setEditError('Name and username are required');
      return;
    }
    const allUsers = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    if (editFormData.username !== currentUser.username) {
      if (allUsers.find(u => u.username === editFormData.username)) {
        setEditError('Username already exists');
        return;
      }
    }
    const updatedUsers = allUsers.map(u => 
      u.id === currentUser.id 
        ? {...u, fullName: editFormData.fullName, username: editFormData.username, password: editFormData.password, profilePhoto: editFormData.profilePhoto, updatedAt: new Date().toISOString()}
        : u
    );
    localStorage.setItem('clinical_users', JSON.stringify(updatedUsers));
    const updatedCurrentUser = {...currentUser, fullName: editFormData.fullName, username: editFormData.username, password: editFormData.password, profilePhoto: editFormData.profilePhoto};
    localStorage.setItem('clinical_current_user', JSON.stringify(updatedCurrentUser));
    setEditSuccess('Profile updated successfully!');
    setTimeout(() => {
      setIsEditing(false);
      setEditSuccess('');
      window.location.reload();
    }, 1500);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditFormData({fullName: currentUser?.fullName || '', username: currentUser?.username || '', password: currentUser?.password || '', profilePhoto: currentUser?.profilePhoto || ''});
    setPhotoPreview(currentUser?.profilePhoto || '');
    setEditError('');
    setEditSuccess('');
  };

  const userStats = useMemo(() => {
    if (!currentUser || !currentWardId) return null;
    const assignments = allAssignments[currentWardId] || {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const userStaff = staffList.find(s => s.name.toLowerCase() === currentUser.fullName.toLowerCase());
    if (!userStaff) return null;
    const stats = {thisMonth: { total: 0, byShift: {}, byWeek: [{}, {}, {}, {}, {}] }, lastMonth: { total: 0, byShift: {} }, allTime: { total: 0, byShift: {} }};
    SHIFTS.forEach(shift => {
      if (shift.id !== 'leave') {
        stats.thisMonth.byShift[shift.id] = 0;
        stats.lastMonth.byShift[shift.id] = 0;
        stats.allTime.byShift[shift.id] = 0;
        stats.thisMonth.byWeek.forEach(week => week[shift.id] = 0);
      }
    });
    Object.entries(assignments).forEach(([dateKey, dayAssignments]) => {
      const date = new Date(dateKey);
      const month = date.getMonth();
      const year = date.getFullYear();
      Object.entries(dayAssignments).forEach(([shiftId, staffIds]) => {
        if (shiftId === 'leave' || !staffIds.includes(userStaff.id)) return;
        stats.allTime.total++;
        stats.allTime.byShift[shiftId] = (stats.allTime.byShift[shiftId] || 0) + 1;
        if (year === currentYear && month === currentMonth) {
          stats.thisMonth.total++;
          stats.thisMonth.byShift[shiftId]++;
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 5) {
            stats.thisMonth.byWeek[weekOfMonth][shiftId]++;
          }
        }
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (year === lastMonthYear && month === lastMonth) {
          stats.lastMonth.total++;
          stats.lastMonth.byShift[shiftId]++;
        }
      });
    });
    return stats;
  }, [currentUser, allAssignments, currentWardId, staffList]);

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {photoPreview ? (
              <img src={photoPreview} alt={currentUser.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{currentUser.fullName}</h1>
              <p className="text-blue-100">{currentUser.role.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors" title="Edit profile">
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {!userStats ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900">
            <strong>Note:</strong> You don't have any duty assignments yet or your name doesn't match a staff record in the system. Contact your administrator to add you to the duty roster.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.thisMonth.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Month</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.lastMonth.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Duties</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.allTime.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              {currentMonthName} - Weekly Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Week</th>
                    {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                      <th key={shift.id} className="text-center p-3 text-sm font-semibold text-gray-700">{shift.label}</th>
                    ))}
                    <th className="text-center p-3 text-sm font-semibold text-gray-700 bg-blue-50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.thisMonth.byWeek.map((week, index) => {
                    const weekTotal = Object.values(week).reduce((sum, val) => sum + val, 0);
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium text-gray-700">Week {index + 1}</td>
                        {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                          <td key={shift.id} className="text-center p-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                              {week[shift.id] || 0}
                            </span>
                          </td>
                        ))}
                        <td className="text-center p-3 bg-blue-50">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                            {weekTotal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">This Month by Shift</h2>
              <div className="space-y-3">
                {SHIFTS.filter(s => s.id !== 'leave').map(shift => {
                  const count = userStats.thisMonth.byShift[shift.id] || 0;
                  const percentage = userStats.thisMonth.total > 0 ? Math.round((count / userStats.thisMonth.total) * 100) : 0;
                  return (
                    <div key={shift.id}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${shift.color}`}>{shift.label}</span>
                        <span className="text-sm font-bold text-gray-700">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${shift.color.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Last Month by Shift</h2>
              <div className="space-y-3">
                {SHIFTS.filter(s => s.id !== 'leave').map(shift => {
                  const count = userStats.lastMonth.byShift[shift.id] || 0;
                  const percentage = userStats.lastMonth.total > 0 ? Math.round((count / userStats.lastMonth.total) * 100) : 0;
                  return (
                    <div key={shift.id}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm font-medium ${shift.color}`}>{shift.label}</span>
                        <span className="text-sm font-bold text-gray-700">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${shift.color.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {editError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{editError}</div>}
            {editSuccess && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">{editSuccess}</div>}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-blue-300" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
                      <Camera size={48} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">Click camera icon to upload photo (max 2MB)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={editFormData.fullName} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={editFormData.username} onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Ward assignment and role cannot be changed. Contact your administrator if you need to update these.
                </p>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1">
                  <Save size={18} />
                  Save Changes
                </button>
                <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex-1">
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
