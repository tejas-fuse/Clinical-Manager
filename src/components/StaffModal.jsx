import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { ROLES, SHIFTS } from '../constants/config';

export const StaffModal = ({ 
  isOpen, 
  onClose, 
  selectedCell,
  staffList,
  currentWardName,
  assignments,
  newStaffName,
  setNewStaffName,
  newStaffRole,
  setNewStaffRole,
  onAddStaff,
  onAssignStaff,
  onRemoveStaff
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col m-4">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-gray-800">
                {selectedCell ? 'Assign Staff' : 'Manage Staff List'}
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

          {/* Add New Staff Form */}
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

          {/* Staff List */}
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Available Staff ({currentWardName})</label>
          <div className="space-y-2">
            {staffList.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">No staff added to this ward yet.</p>
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
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveStaff(staff.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete staff member permanently"
                      >
                        <Trash2 size={14} />
                      </button>
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
