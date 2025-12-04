// User roles for login and permissions
export const USER_ROLES = {
  admin: { 
    id: 'admin', 
    label: 'Administrator', 
    canEdit: false, 
    canApprove: false, 
    canManageUsers: true,
    canPrint: false,
    canCreateWard: true,
    canAddStaff: true,
    showInLogin: false,
    visibleRoles: [] // Admin sees user management, not roster
  },
  in_charge: { 
    id: 'in_charge', 
    label: 'In-Charge Sister', 
    canEdit: true, 
    canApprove: true,
    canManageUsers: false,
    canPrint: true,
    canCreateWard: false,
    canAddStaff: false,
    showInLogin: true,
    visibleRoles: ['in_charge', 'staff', 'attendant', 'sweeper'] // In-Charge can see all roles
  },
  staff: { 
    id: 'staff', 
    label: 'Staff (Sis/Bro)', 
    canEdit: false, 
    canApprove: false,
    canManageUsers: false,
    canPrint: false,
    canCreateWard: false,
    canAddStaff: false,
    showInLogin: true,
    visibleRoles: ['in_charge', 'staff'] // Can see In-Charge and Staff in timetable
  },
  attendant: { 
    id: 'attendant', 
    label: 'Attendant', 
    canEdit: false, 
    canApprove: false,
    canManageUsers: false,
    canPrint: false,
    canCreateWard: false,
    canAddStaff: false,
    showInLogin: true,
    visibleRoles: ['attendant', 'sweeper'] // Can see Attendant and Sweeper in timetable
  },
  sweeper: { 
    id: 'sweeper', 
    label: 'Sweeper', 
    canEdit: false, 
    canApprove: false,
    canManageUsers: false,
    canPrint: false,
    canCreateWard: false,
    canAddStaff: false,
    showInLogin: true,
    visibleRoles: ['sweeper'] // Can only see Sweeper in timetable
  }
};

// Staff roles for duty assignments (these are the actual job roles)
export const STAFF_ROLES = {
  IN_CHARGE: { id: 'in_charge', label: 'In-Charge Sister', color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  STAFF: { id: 'staff', label: 'Staff (Sis/Bro)', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  ATTENDANT: { id: 'attendant', label: 'Attendant', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  SWEEPER: { id: 'sweeper', label: 'Sweeper', color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  LEAVE_RELIEVER: { id: 'reliever', label: 'Leave Reliever', color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-500' },
};

// Keep ROLES for backward compatibility
export const ROLES = STAFF_ROLES;

export const SHIFTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 2:00 PM', icon: 'Sun', color: 'text-amber-500' },
  { id: 'evening', label: 'Evening', time: '2:00 PM - 8:00 PM', icon: 'Sunset', color: 'text-orange-500' },
  { id: 'night', label: 'Night', time: '8:00 PM - 8:00 AM', icon: 'Moon', color: 'text-indigo-500' },
  { id: 'leave', label: 'On Leave', time: 'Full Day', icon: 'Coffee', color: 'text-red-500' },
];

// Simplified Indian Holiday List
export const HOLIDAYS = {
  '01-26': 'Republic Day',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas',
  '01-14': 'Makar Sankranti',
  '03-08': 'Maha Shivratri',
  '03-25': 'Holi',
  '04-09': 'Gudi Padwa',
  '04-14': 'Ambedkar Jayanti',
  '05-01': 'Maharashtra Day / Labor Day',
  '08-19': 'Raksha Bandhan',
  '09-07': 'Ganesh Chaturthi',
  '10-12': 'Dussehra',
  '11-01': 'Diwali',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};
