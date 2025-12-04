import React from 'react';
import { Trash2 } from 'lucide-react';
import { ROLES } from '../constants/config';

export const StaffBadge = ({ staff, onDelete }) => {
  const roleConfig = Object.values(ROLES).find(r => r.id === staff.role) || ROLES.STAFF;
  
  return (
    <div className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md text-xs font-medium border ${roleConfig.color} mb-1 shadow-sm`}>
      <span className="truncate">{staff.name}</span>
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="hover:text-red-600 focus:outline-none print:hidden"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};
