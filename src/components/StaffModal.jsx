import React from 'react';
import { X, Trash2, UserPlus } from 'lucide-react';
import { ROLES, SHIFTS, USER_ROLES } from '../constants/config';

export const StaffModal = ({ 
  isOpen, 
  onClose, 
  selectedCell,
  staffList,
  wardUsers = [],
  currentWardName,
  currentWardId,
  assignments,
  newStaffName,
  setNewStaffName,
  newStaffRole,
  setNewStaffRole,
  onAddStaff,
  onAssignStaff,
  onRemoveStaff,
  isInCharge = false,
  allStaff = {},
  setAllStaff = () => {}
}) => {
  if (!isOpen) return null;

  // For In-Charge: Add a ward user to the staff list for duty assignment
  const handleAddUserToStaffList = (user) => {
    // Check if already exists in staff list
    const currentStaffList = allStaff[currentWardId] || [];
    if (currentStaffList.find(s => s.id === user.id)) {
      alert('This user is already added to the staff list');
      return;
    }

    const newStaffMember = {
      id: user.id,
      name: user.fullName,
      role: user.role
    };

    setAllStaff(prev => ({
      ...prev,
      [currentWardId]: [...(prev[currentWardId] || []), newStaffMember]
    }));
  };

  // Available users that are not yet in the staff list (for In-Charge)
  const availableUsers = wardUsers.filter(user => {
    return !staffList.find(staff => staff.id === user.id);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col m-4">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-gray-800">
                {selectedCell ? 'Assign Staff' : 'Manage Staff Duties'}
            </h2>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{currentWardName}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          
          {/* Context Info if selecting for a slot */}
          {selectedCell && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              Assigning for <span className="font-bold">{SHIFTS.find(s => s.id === selectedCell.shiftId)?.label}</span> on <span className="font-bold">{selectedCell.dateKey}</span>
            </div>
          )}

          {/* Add New Staff Form - Only show for Admin (non In-Charge) */}
          {!isInCharge && (
            <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Add New Worker to {currentWardName}</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter Name"
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
                <div className="flex gap-2">
                  <select 
                    className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                  >
                    {Object.values(ROLES).map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <button 
                    onClick={onAddStaff}
                    disabled={!newStaffName}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info for In-Charge */}
          {isInCharge && (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-1">Add Users to Staff List</p>
                <p>Select users assigned to your ward by the admin to add them to the duty roster.</p>
              </div>

              {/* Available Users to Add */}
              {availableUsers.length > 0 && (
                <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Available Users ({availableUsers.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{USER_ROLES[user.role]?.label}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddUserToStaffList(user)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableUsers.length === 0 && staffList.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                  ✓ All assigned users have been added to the staff list
                </div>
              )}

              {wardUsers.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  No users have been assigned to this ward by the admin yet.
                </div>
              )}
            </>
          )}

          {/* Staff List */}
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Assigned Staff ({currentWardName})</label>
          <div className="space-y-2">
            {staffList.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">No staff assigned to this ward yet.</p>
            ) : (
              staffList.map(staff => {
                 const isAssigned = selectedCell && assignments[selectedCell.dateKey]?.[selectedCell.shiftId]?.includes(staff.id);
                 
                 return (
                  <div 
                    key={staff.id} 
                    onClick={() => selectedCell && !isAssigned && onAssignStaff(staff.id)}
                    className={`
                      flex items-center justify-between p-2 rounded-lg border transition-all
                      ${selectedCell 
                        ? isAssigned 
                          ? 'bg-green-50 border-green-200 cursor-default opacity-60' 
                          : 'hover:bg-blue-50 cursor-pointer border-gray-200 hover:border-blue-300' 
                        : 'border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${Object.values(ROLES).find(r => r.id === staff.role)?.dot}`}>
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{staff.name}</p>
                        <p className="text-xs text-gray-500">{Object.values(ROLES).find(r => r.id === staff.role)?.label}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCell && isAssigned && (
                        <span className="text-green-600 text-xs font-bold px-2">Assigned</span>
                      )}
                      {!isInCharge && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveStaff(staff.id); }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete staff member permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
