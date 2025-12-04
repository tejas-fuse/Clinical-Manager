import React from 'react';
import { Calendar, User, BarChart3, Users } from 'lucide-react';

export const Navigation = ({ activeTab, onTabChange, currentUser, userRoles }) => {
  const tabs = [];

  // Admin sees user management AND ward management
  if (currentUser && userRoles[currentUser.role]?.canManageUsers) {
    tabs.push({ id: 'admin', label: 'User Management', icon: Users });
    tabs.push({ id: 'admin-wards', label: 'Ward Management', icon: Calendar });
    
    return (
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Other users see roster, profile, and analytics (if in-charge)
  tabs.push({ id: 'roster', label: 'Duty Roster', icon: Calendar });
  tabs.push({ id: 'profile', label: 'My Profile', icon: User });

  // Add analytics tab for in-charge only
  if (currentUser && userRoles[currentUser.role]?.canApprove) {
    tabs.push({ id: 'analytics', label: 'Staff Analytics', icon: BarChart3 });
  }

  return (
    <div className="bg-white border-b border-gray-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
