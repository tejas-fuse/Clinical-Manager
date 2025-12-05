import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertCircle,
  Building2,
  UserPlus,
  Plus,
  MessageSquare,
  Calendar,
  User,
  LogOut
} from 'lucide-react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { StaffBadge } from './components/StaffBadge';
import { WardModal } from './components/WardModal';
import { StaffModal } from './components/StaffModal';
import { LoginModal } from './components/LoginModal';
import { ChangeRequestModal, RequestsModal } from './components/RequestModals';
import { ProfileView } from './components/ProfileView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminPanel } from './components/AdminPanel';
import { AdminWardManagement } from './components/AdminWardManagement';
import { InChargeStaffPanel } from './components/InChargeStaffPanel';
import { ROLES, SHIFTS, USER_ROLES, REQUEST_STATUS } from './constants/config';
import { getStartOfWeek, formatDateKey, getHolidayName } from './utils/helpers';
import { fetchWards, createWard, deleteWard } from './services/wards';
import { listStaffByWard, createStaff, deleteStaff } from './services/staff';
import { listAssignmentsByWard, addAssignment, removeAssignment as removeAssignmentApi } from './services/assignments';
import { listRequestsByWard, createChangeRequest, updateRequestStatus } from './services/changeRequests';

// Icon mapping for shifts
const SHIFT_ICONS = {
  Sun,
  Sunset,
  Moon,
  Coffee
};

export default function DutyRosterApp() {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        setIsLoginModalOpen(false);
      } catch (e) {
        console.error('Failed to restore user session', e);
      }
    }
  }, []);

  // --- Navigation State ---
  const [activeTab, setActiveTab] = useState('roster');

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const [wards, setWards] = useState([]);

  // Normalize assigned ward IDs (handles legacy data storing objects instead of IDs)
  const assignedWardIds = useMemo(() => {
    if (!currentUser?.assignedWards) return [];
    return currentUser.assignedWards
      .map(entry => typeof entry === 'string' ? entry : entry?.id)
      .filter(Boolean);
  }, [currentUser]);
  
  // Wards visible to the current user
  const filteredWards = useMemo(() => {
    if (!currentUser) return [];
    const isAdmin = !!USER_ROLES[currentUser.role]?.canManageUsers;
    if (isAdmin) return wards;
    return wards.filter(w => assignedWardIds.includes(w.id));
  }, [wards, currentUser, assignedWardIds]);
  
  const [currentWardId, setCurrentWardId] = useState(() => {
     return filteredWards.length > 0 ? filteredWards[0].id : '';
  });

  // Ensure currentWardId is valid within filtered wards
  useEffect(() => {
    if (filteredWards.length > 0 && !filteredWards.find(w => w.id === currentWardId)) {
      setCurrentWardId(filteredWards[0].id);
    }
  }, [filteredWards, currentWardId]);

  // Staff State (Keyed by Ward ID)
  const [allStaff, setAllStaff] = useState({});
  
  // Assignment State (Keyed by Ward ID)
  const [allAssignments, setAllAssignments] = useState({});

  // Derived State for Current View
  const staffList = useMemo(() => allStaff[currentWardId] || [], [allStaff, currentWardId]);
  const assignments = allAssignments[currentWardId] || {};
  const currentWardName = filteredWards.find(w => w.id === currentWardId)?.name || '';

  // Get all users assigned to current ward (for In-Charge to assign duties)
  const wardUsers = useMemo(() => {
    if (!currentWardId) return [];
    const allUsers = JSON.parse(localStorage.getItem('clinical_users') || '[]');
    const normalizeWardIds = (wardEntries) => {
      return (wardEntries || [])
        .map(entry => typeof entry === 'string' ? entry : entry?.id)
        .filter(Boolean);
    };
    
    return allUsers
      .filter(user => user.role !== 'admin')
      .filter(user => {
        const userWards = normalizeWardIds(user.assignedWards);
        return userWards.includes(currentWardId);
      });
  }, [currentWardId]);

  // Filter staff based on user role permissions
  const visibleStaffList = useMemo(() => {
    const userRole = USER_ROLES[currentUser?.role];
    if (!userRole || !userRole.visibleRoles) return staffList;
    
    // In-charge can see all, but we still apply filter for other roles
    return staffList.filter(staff => userRole.visibleRoles.includes(staff.role));
  }, [staffList, currentUser]);

  // Modals
  const [selectedCell, setSelectedCell] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [requestCell, setRequestCell] = useState(null);
  
  // Form Inputs
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [newWardNameInput, setNewWardNameInput] = useState('');

  // Change Requests State
  const [changeRequests, setChangeRequests] = useState([]);

  const pendingRequestsCount = changeRequests.filter(r => r.status === REQUEST_STATUS.PENDING).length;

  // --- Effects ---
  // Load wards from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWards();
        setWards(data);
        if (data.length && !currentWardId) {
          setCurrentWardId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load wards', err);
      }
    };
    load();
  }, [currentWardId]);

  // Load staff when ward changes
  useEffect(() => {
    if (!currentWardId) return;
    const loadStaff = async () => {
      try {
        const staff = await listStaffByWard(currentWardId);
        const mapped = staff.map(s => ({ ...s, name: s.full_name }));
        setAllStaff(prev => ({ ...prev, [currentWardId]: mapped }));
      } catch (err) {
        console.error('Failed to load staff', err);
      }
    };
    loadStaff();
  }, [currentWardId]);

  // Load assignments when ward changes
  useEffect(() => {
    if (!currentWardId) return;
    const loadAssignments = async () => {
      try {
        const items = await listAssignmentsByWard(currentWardId);
        const mapped = items.reduce((acc, a) => {
          const day = acc[a.date_key] || {};
          const shiftArr = day[a.shift_id] || [];
          return {
            ...acc,
            [a.date_key]: {
              ...day,
              [a.shift_id]: shiftArr.includes(a.staff_id) ? shiftArr : [...shiftArr, a.staff_id]
            }
          };
        }, {});
        setAllAssignments(prev => ({ ...prev, [currentWardId]: mapped }));
      } catch (err) {
        console.error('Failed to load assignments', err);
      }
    };
    loadAssignments();
  }, [currentWardId]);

  // Load change requests when ward changes
  useEffect(() => {
    if (!currentWardId) return;
    const loadRequests = async () => {
      try {
        const items = await listRequestsByWard(currentWardId);
        const mapped = (items || []).map(r => ({
          id: r.id,
          userName: r.payload?.userName || 'User',
          reason: r.payload?.reason || '',
          dateKey: r.date_key,
          shiftLabel: r.shift_label,
          status: r.status,
          createdAt: r.created_at
        }));
        setChangeRequests(mapped);
      } catch (err) {
        console.error('Failed to load change requests', err);
      }
    };
    loadRequests();
  }, [currentWardId]);

  // --- Date Logic ---
  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [startOfWeek]);

  // --- Handlers ---

  const handleLogin = (user) => {
    // user is already in app shape from users_app table
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setActiveTab(USER_ROLES[user?.role]?.canManageUsers ? 'admin' : 'roster');
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    setActiveTab('roster');
    localStorage.removeItem('currentUser');
  };

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const openWardModal = () => {
    setNewWardNameInput('');
    setIsWardModalOpen(true);
  };

  const saveNewWard = async () => {
    if (newWardNameInput && newWardNameInput.trim()) {
      try {
        const newWard = await createWard(newWardNameInput.trim());
        setWards(prev => [...prev, newWard]);
        setAllStaff(prev => ({ ...prev, [newWard.id]: [] }));
        setAllAssignments(prev => ({ ...prev, [newWard.id]: {} }));
        setCurrentWardId(newWard.id);
        setIsWardModalOpen(false);
      } catch (err) {
        alert('Failed to create ward. Please retry.');
        console.error(err);
      }
    }
  };

  const handleDeleteWard = async () => {
    if (!currentWardId) return;
    const wardName = wards.find(w => w.id === currentWardId)?.name;
    
    if(window.confirm(`Are you sure you want to delete "${wardName}" and all its data? This cannot be undone.`)) {
      try {
        await deleteWard(currentWardId);
        const newWards = wards.filter(w => w.id !== currentWardId);
        setWards(newWards);
        
        // Clean up data
        const newStaff = { ...allStaff };
        delete newStaff[currentWardId];
        setAllStaff(newStaff);

        const newAssignments = { ...allAssignments };
        delete newAssignments[currentWardId];
        setAllAssignments(newAssignments);

        // Update selection
        if (newWards.length > 0) {
            setCurrentWardId(newWards[0].id);
        } else {
            setCurrentWardId('');
        }
      } catch (err) {
        alert('Failed to delete ward. Please retry.');
        console.error(err);
      }
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) return;
    try {
      const created = await createStaff(currentWardId, newStaffName.trim(), newStaffRole);
      setAllStaff(prev => ({
        ...prev,
        [currentWardId]: [...(prev[currentWardId] || []), { id: created.id, name: created.full_name, role: created.role }]
      }));
      setNewStaffName('');
    } catch (err) {
      alert('Failed to add staff.');
      console.error(err);
    }
  };

  const handleRemoveStaffGlobal = async (id) => {
    if(window.confirm("Remove this staff member permanently?")) {
      try {
        await deleteStaff(id);
        setAllStaff(prev => ({
          ...prev,
          [currentWardId]: (prev[currentWardId] || []).filter(s => s.id !== id)
        }));
      } catch (err) {
        alert('Failed to remove staff.');
        console.error(err);
      }
    }
  };

  const openAssignmentModal = (dateKey, shiftId) => {
    const userRole = USER_ROLES[currentUser?.role];
    
    if (userRole?.canEdit) {
      // In-charge can edit directly
      setSelectedCell({ dateKey, shiftId });
      setIsStaffModalOpen(true);
    } else {
      // Staff can only request changes
      const shift = SHIFTS.find(s => s.id === shiftId);
      setRequestCell({ dateKey, shiftId, shiftLabel: shift?.label });
      setIsChangeRequestModalOpen(true);
    }
  };

  const assignStaff = async (staffId) => {
    if (!selectedCell) return;
    const { dateKey, shiftId } = selectedCell;
    try {
      await addAssignment({ wardId: currentWardId, staffId, dateKey, shiftId });
      setAllAssignments(prevAll => {
        const wardAssignments = prevAll[currentWardId] || {};
        const dayData = wardAssignments[dateKey] || {};
        const shiftData = dayData[shiftId] || [];
        if (shiftData.includes(staffId)) return prevAll;
        return {
          ...prevAll,
          [currentWardId]: {
              ...wardAssignments,
              [dateKey]: {
                  ...dayData,
                  [shiftId]: [...shiftData, staffId]
              }
          }
        };
      });
    } catch (err) {
      alert('Failed to assign staff.');
      console.error(err);
    }
  };

  const removeAssignment = async (dateKey, shiftId, staffId) => {
    try {
      await removeAssignmentApi({ wardId: currentWardId, staffId, dateKey, shiftId });
      setAllAssignments(prevAll => {
          const wardAssignments = prevAll[currentWardId] || {};
          const dayData = wardAssignments[dateKey] || {};
          const shiftData = dayData[shiftId] || [];

          return {
              ...prevAll,
              [currentWardId]: {
                  ...wardAssignments,
                  [dateKey]: {
                      ...dayData,
                      [shiftId]: shiftData.filter(id => id !== staffId)
                  }
              }
          };
      });
    } catch (err) {
      alert('Failed to remove assignment.');
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseStaffModal = () => {
    setIsStaffModalOpen(false);
    setSelectedCell(null);
  };

  const handleSubmitChangeRequest = async (request) => {
    try {
      const payload = {
        ward_id: currentWardId,
        staff_id: null,
        requested_by: currentUser?.id || null,
        type: 'change',
        payload: { reason: request.reason, userName: request.userName },
        status: REQUEST_STATUS.PENDING,
        date_key: request.dateKey,
        shift_label: request.shiftLabel
      };
      const created = await createChangeRequest(payload);
      const mapped = {
        id: created.id,
        userName: created.payload?.userName || request.userName,
        reason: created.payload?.reason || request.reason,
        dateKey: created.date_key,
        shiftLabel: created.shift_label,
        status: created.status,
        createdAt: created.created_at
      };
      setChangeRequests(prev => [mapped, ...prev]);
    } catch (err) {
      alert('Failed to submit request.');
      console.error(err);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const request = changeRequests.find(r => r.id === requestId);
    if (!request) return;

    // Find the staff member in the current ward
    const wardStaff = allStaff[currentWardId] || [];
    const staff = wardStaff.find(s => s.name?.toLowerCase() === request.userName?.toLowerCase());

    try {
      if (staff) {
        await addAssignment({
          wardId: currentWardId,
          staffId: staff.id,
          dateKey: request.dateKey,
          shiftId: getShiftIdFromLabel(request.shiftLabel)
        });
        setAllAssignments(prevAll => {
          const wardAssignments = prevAll[currentWardId] || {};
          const dayData = wardAssignments[request.dateKey] || {};
          const shiftData = dayData[getShiftIdFromLabel(request.shiftLabel)] || [];
          if (shiftData.includes(staff.id)) return prevAll;
          return {
            ...prevAll,
            [currentWardId]: {
              ...wardAssignments,
              [request.dateKey]: {
                ...dayData,
                [getShiftIdFromLabel(request.shiftLabel)]: [...shiftData, staff.id]
              }
            }
          };
        });
      }

      await updateRequestStatus(requestId, REQUEST_STATUS.APPROVED);
      setChangeRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: REQUEST_STATUS.APPROVED } : r)
      );
    } catch (err) {
      alert('Failed to approve request.');
      console.error(err);
    }
  };

  // Helper function to get shift ID from shift label
  const getShiftIdFromLabel = (label) => {
    const shift = SHIFTS.find(s => s.label === label);
    return shift ? shift.id : 'morning';
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await updateRequestStatus(requestId, REQUEST_STATUS.REJECTED);
      setChangeRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: REQUEST_STATUS.REJECTED } : r)
      );
    } catch (err) {
      alert('Failed to reject request.');
      console.error(err);
    }
  };

  // --- Render ---

  if (!currentUser) {
    return (
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => {}}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* Header - Hide for admin */}
      {!USER_ROLES[currentUser?.role]?.canManageUsers && (
        <Header 
          wards={filteredWards}
          currentWardId={currentWardId}
          setCurrentWardId={setCurrentWardId}
          weekDates={weekDates}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onPrint={handlePrint}
          onManageStaff={() => setIsStaffModalOpen(true)}
          onOpenWardModal={openWardModal}
          onDeleteWard={handleDeleteWard}
          currentUser={currentUser}
          onLogout={handleLogout}
          onViewRequests={() => setIsRequestsModalOpen(true)}
          pendingRequestsCount={pendingRequestsCount}
        />
      )}

      {/* Simple header for admin */}
      {USER_ROLES[currentUser?.role]?.canManageUsers && (
        <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={24} className="text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Clinical Manager - Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-100 p-2 rounded-lg">
                <User size={18} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">{currentUser.fullName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Navigation Tabs */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        currentUser={currentUser}
        userRoles={USER_ROLES}
      />

      {/* Main Content Area */}
      {activeTab === 'admin' && USER_ROLES[currentUser?.role]?.canManageUsers && (
        <>
          {console.log('Rendering AdminPanel')}
          <AdminPanel />
        </>
      )}

      {activeTab === 'admin-wards' && USER_ROLES[currentUser?.role]?.canManageUsers && (
        <AdminWardManagement />
      )}

      {activeTab === 'roster' && (
        <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        
        {filteredWards.length === 0 ? (
            // EMPTY STATE
          USER_ROLES[currentUser?.role]?.canCreateWard ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Building2 size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Clinical Manager</h3>
                <p className="text-gray-500 max-w-sm text-center mb-6">You haven't created any wards yet. Add a ward (e.g., ICU, General, Emergency) to start managing schedules.</p>
                <button 
                    onClick={openWardModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Create First Ward
                </button>
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Building2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Wards Assigned Yet</h3>
              <p className="text-gray-500 max-w-sm text-center">An administrator needs to assign wards to your account before you can manage schedules here.</p>
            </div>
            )
        ) : (
            // MAIN ROSTER
            <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-2 print:border-black">
                
                {/* Print Header */}
                <div className="hidden print:block p-4 text-center border-b border-black">
                    <h1 className="text-2xl font-bold uppercase">Weekly Duty Schedule - {currentWardName}</h1>
                    <p className="mt-1">
                    Date: {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} To {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                        <tr>
                        <th className="p-4 text-left w-32 bg-gray-50 border-b border-r border-gray-200 print:bg-gray-100 print:border-black">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-black">Schedule / Date</span>
                        </th>
                        {weekDates.map(date => {
                            const dateKey = formatDateKey(date);
                            const holidayName = getHolidayName(date);
                            const isSunday = date.getDay() === 0;
                            const displayHoliday = holidayName || (isSunday ? 'Sunday' : null);
                            const isToday = formatDateKey(new Date()) === dateKey;
                            
                            return (
                            <th key={dateKey} className={`p-3 min-w-[140px] border-b border-r border-gray-200 text-left print:border-black ${displayHoliday ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <div className={`flex flex-col ${isToday ? 'text-blue-700' : 'text-gray-700'} print:text-black`}>
                                <span className="text-xs font-bold uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="text-xl font-light">{date.getDate()}</span>
                                {displayHoliday && (
                                    <span className="text-[10px] font-bold text-red-600 mt-1 inline-flex items-center gap-1">
                                    <AlertCircle size={10} /> {displayHoliday}
                                    </span>
                                )}
                                </div>
                            </th>
                            );
                        })}
                        </tr>
                    </thead>
                    <tbody>
                        {SHIFTS.map(shift => {
                          const ShiftIcon = SHIFT_ICONS[shift.icon];
                          
                          return (
                            <tr key={shift.id} className={shift.id === 'leave' ? 'bg-slate-50 border-t-2 border-gray-100 print:border-t-2 print:border-black' : ''}>
                                {/* Y-Axis Label */}
                                <td className="p-3 border-r border-b border-gray-200 bg-white sticky left-0 z-10 print:border-black print:bg-transparent">
                                <div className="flex flex-col gap-1">
                                    <span className={`font-semibold flex items-center gap-2 ${shift.color} print:text-black`}>
                                    <ShiftIcon size={16} /> {shift.label}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono print:text-gray-600">{shift.time}</span>
                                </div>
                                </td>

                                {/* Cells */}
                                {weekDates.map(date => {
                                const dateKey = formatDateKey(date);
                                const assignedIds = assignments[dateKey]?.[shift.id] || [];
                                // Filter to show only visible staff
                                const visibleAssignedIds = assignedIds.filter(id => {
                                  const staff = staffList.find(s => s.id === id);
                                  if (!staff) return false;
                                  const userRole = USER_ROLES[currentUser?.role];
                                  return !userRole?.visibleRoles || userRole.visibleRoles.includes(staff.role);
                                });
                                const holidayName = getHolidayName(date);
                                const isSunday = date.getDay() === 0;
                                const isHolidayOrSunday = holidayName || isSunday;

                                return (
                                    <td 
                                    key={`${dateKey}-${shift.id}`} 
                                    className={`
                                        border-r border-b border-gray-200 p-2 align-top transition-colors print:border-black
                                        ${isHolidayOrSunday && shift.id !== 'leave' ? 'bg-red-50/30' : 'hover:bg-blue-50/30'}
                                        ${shift.id === 'leave' ? 'h-24' : 'h-32'}
                                    `}
                                    onClick={() => openAssignmentModal(dateKey, shift.id)}
                                    >
                                    <div className="flex flex-col gap-1 h-full">
                                        {visibleAssignedIds.map(id => {
                                        const staff = staffList.find(s => s.id === id);
                                        if (!staff) return null;
                                        const canEdit = USER_ROLES[currentUser?.role]?.canEdit;
                                        return (
                                            <StaffBadge 
                                            key={id} 
                                            staff={staff} 
                                            onDelete={canEdit ? () => removeAssignment(dateKey, shift.id, id) : null}
                                            canDelete={canEdit}
                                            />
                                        );
                                        })}
                                        
                                        {/* Empty State Placeholder (Screen only) */}
                                        {visibleAssignedIds.length === 0 && (
                                            <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 print:hidden cursor-pointer">
                                                <span className="text-xs text-gray-400 flex items-center gap-1 bg-white px-2 py-1 rounded border border-dashed border-gray-300">
                                                    {USER_ROLES[currentUser?.role]?.canEdit ? (
                                                        <>
                                                            <UserPlus size={12}/> Assign
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageSquare size={12}/> Request Change
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    </td>
                                );
                                })}
                            </tr>
                          );
                        })}
                    </tbody>
                    </table>
                </div>
                
                {/* Print Footer */}
                <div className="hidden print:flex justify-between mt-8 pt-8 border-t border-black px-8">
                    <div className="text-center">
                        <p className="font-bold">Prepared By</p>
                        <div className="h-12"></div>
                        <p className="border-t border-black w-32 mx-auto"></p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold">Approved By</p>
                        <div className="h-12"></div>
                        <p className="border-t border-black w-32 mx-auto"></p>
                    </div>
                </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm print:mt-4">
                <span className="font-semibold text-gray-600 print:text-black">Legend:</span>
                {Object.values(ROLES).map(role => (
                    <div key={role.id} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${role.dot} print:border print:border-black print:bg-white`}></span>
                    <span className="text-gray-700 print:text-black">{role.label}</span>
                    </div>
                ))}
                </div>
            </>
        )}
        </main>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfileView 
          currentUser={currentUser}
          allAssignments={allAssignments}
          currentWardId={currentWardId}
          staffList={staffList}
        />
      )}

      {/* Staff Management Tab (for In-Charge only) */}
      {activeTab === 'staff-management' && USER_ROLES[currentUser?.role]?.canApprove && (
        <InChargeStaffPanel 
          currentUser={currentUser}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && USER_ROLES[currentUser?.role]?.canApprove && (
        <AnalyticsView 
          currentUser={currentUser}
          allAssignments={allAssignments}
          currentWardId={currentWardId}
          staffList={staffList}
          currentWardName={currentWardName}
        />
      )}

      {/* CREATE WARD MODAL */}
      <WardModal 
        isOpen={isWardModalOpen}
        onClose={() => setIsWardModalOpen(false)}
        newWardName={newWardNameInput}
        setNewWardName={setNewWardNameInput}
        onSave={saveNewWard}
      />

      {/* STAFF MANAGEMENT MODAL */}
      {currentWardId && USER_ROLES[currentUser?.role]?.canEdit && (
        <StaffModal 
          isOpen={isStaffModalOpen}
          onClose={handleCloseStaffModal}
          selectedCell={selectedCell}
          staffList={visibleStaffList}
          wardUsers={wardUsers}
          currentWardName={currentWardName}
          currentWardId={currentWardId}
          assignments={assignments}
          newStaffName={newStaffName}
          setNewStaffName={setNewStaffName}
          newStaffRole={newStaffRole}
          setNewStaffRole={setNewStaffRole}
          onAddStaff={handleAddStaff}
          onAssignStaff={assignStaff}
          onRemoveStaff={handleRemoveStaffGlobal}
          isInCharge={currentUser?.role === 'in_charge'}
          allStaff={allStaff}
          setAllStaff={setAllStaff}
        />
      )}

      {/* CHANGE REQUEST MODAL (for staff without edit permissions) */}
      {requestCell && (
        <ChangeRequestModal 
          isOpen={isChangeRequestModalOpen}
          onClose={() => {
            setIsChangeRequestModalOpen(false);
            setRequestCell(null);
          }}
          dateKey={requestCell.dateKey}
          shiftLabel={requestCell.shiftLabel}
          currentUser={currentUser}
          onSubmitRequest={handleSubmitChangeRequest}
        />
      )}

      {/* REQUESTS MANAGEMENT MODAL (for in-charge) */}
      <RequestsModal 
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        requests={changeRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        canApprove={USER_ROLES[currentUser?.role]?.canApprove}
      />

      {/* CSS For Print Optimization */}
      <style>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          /* Ensure backgrounds print (for holidays/colors) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
