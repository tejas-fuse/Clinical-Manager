import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertCircle,
  Building2,
  UserPlus,
  Plus
} from 'lucide-react';
import { Header } from './components/Header';
import { StaffBadge } from './components/StaffBadge';
import { WardModal } from './components/WardModal';
import { StaffModal } from './components/StaffModal';
import { ROLES, SHIFTS } from './constants/config';
import { getStartOfWeek, formatDateKey, getHolidayName } from './utils/helpers';

// Icon mapping for shifts
const SHIFT_ICONS = {
  Sun,
  Sunset,
  Moon,
  Coffee
};

export default function DutyRosterApp() {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Wards State - NOW DEFAULTS TO EMPTY ARRAY
  const [wards, setWards] = useState(() => {
    const saved = localStorage.getItem('duty_roster_wards');
    return saved ? JSON.parse(saved) : []; 
  });
  
  const [currentWardId, setCurrentWardId] = useState(() => {
     return wards.length > 0 ? wards[0].id : '';
  });

  // Ensure currentWardId is valid if wards exist but ID is empty
  useEffect(() => {
    if (wards.length > 0 && !wards.find(w => w.id === currentWardId)) {
      setCurrentWardId(wards[0].id);
    }
  }, [wards, currentWardId]);

  // Staff State (Keyed by Ward ID)
  const [allStaff, setAllStaff] = useState(() => {
    const saved = localStorage.getItem('duty_roster_all_staff');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Assignment State (Keyed by Ward ID)
  const [allAssignments, setAllAssignments] = useState(() => {
    const saved = localStorage.getItem('duty_roster_all_assignments');
    return saved ? JSON.parse(saved) : {};
  });

  // Derived State for Current View
  const staffList = allStaff[currentWardId] || [];
  const assignments = allAssignments[currentWardId] || {};
  const currentWardName = wards.find(w => w.id === currentWardId)?.name || '';

  // Modals
  const [selectedCell, setSelectedCell] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  
  // Form Inputs
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [newWardNameInput, setNewWardNameInput] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('duty_roster_wards', JSON.stringify(wards));
  }, [wards]);

  useEffect(() => {
    localStorage.setItem('duty_roster_all_staff', JSON.stringify(allStaff));
  }, [allStaff]);

  useEffect(() => {
    localStorage.setItem('duty_roster_all_assignments', JSON.stringify(allAssignments));
  }, [allAssignments]);

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

  const saveNewWard = () => {
      if (newWardNameInput && newWardNameInput.trim()) {
          const newId = newWardNameInput.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
          const newWard = { id: newId, name: newWardNameInput.trim() };
          
          setWards([...wards, newWard]);
          setAllStaff(prev => ({ ...prev, [newId]: [] })); 
          setAllAssignments(prev => ({ ...prev, [newId]: {} }));
          setCurrentWardId(newId);
          
          setIsWardModalOpen(false);
      }
  };

  const handleDeleteWard = () => {
    if (!currentWardId) return;
    const wardName = wards.find(w => w.id === currentWardId)?.name;
    
    if(window.confirm(`Are you sure you want to delete "${wardName}" and all its data? This cannot be undone.`)) {
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
    }
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    const newStaff = {
      id: Date.now(),
      name: newStaffName,
      role: newStaffRole
    };
    
    setAllStaff(prev => ({
        ...prev,
        [currentWardId]: [...(prev[currentWardId] || []), newStaff]
    }));
    setNewStaffName('');
  };

  const handleRemoveStaffGlobal = (id) => {
    if(window.confirm("Remove this staff member permanently?")) {
        setAllStaff(prev => ({
            ...prev,
            [currentWardId]: prev[currentWardId].filter(s => s.id !== id)
        }));
    }
  };

  const openAssignmentModal = (dateKey, shiftId) => {
    setSelectedCell({ dateKey, shiftId });
    setIsStaffModalOpen(true);
  };

  const assignStaff = (staffId) => {
    if (!selectedCell) return;
    const { dateKey, shiftId } = selectedCell;

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
  };

  const removeAssignment = (dateKey, shiftId, staffId) => {
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
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseStaffModal = () => {
    setIsStaffModalOpen(false);
    setSelectedCell(null);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* Header */}
      <Header 
        wards={wards}
        currentWardId={currentWardId}
        setCurrentWardId={setCurrentWardId}
        weekDates={weekDates}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onPrint={handlePrint}
        onManageStaff={() => setIsStaffModalOpen(true)}
        onOpenWardModal={openWardModal}
        onDeleteWard={handleDeleteWard}
      />

      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        
        {wards.length === 0 ? (
            // EMPTY STATE
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
                                        {assignedIds.map(id => {
                                        const staff = staffList.find(s => s.id === id);
                                        if (!staff) return null;
                                        return (
                                            <StaffBadge 
                                            key={id} 
                                            staff={staff} 
                                            onDelete={() => removeAssignment(dateKey, shift.id, id)} 
                                            />
                                        );
                                        })}
                                        
                                        {/* Empty State Placeholder (Screen only) */}
                                        {assignedIds.length === 0 && (
                                            <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 print:hidden cursor-pointer">
                                                <span className="text-xs text-gray-400 flex items-center gap-1 bg-white px-2 py-1 rounded border border-dashed border-gray-300">
                                                    <UserPlus size={12}/> Assign
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

      {/* CREATE WARD MODAL */}
      <WardModal 
        isOpen={isWardModalOpen}
        onClose={() => setIsWardModalOpen(false)}
        newWardName={newWardNameInput}
        setNewWardName={setNewWardNameInput}
        onSave={saveNewWard}
      />

      {/* STAFF MANAGEMENT MODAL */}
      {currentWardId && (
        <StaffModal 
          isOpen={isStaffModalOpen}
          onClose={handleCloseStaffModal}
          selectedCell={selectedCell}
          staffList={staffList}
          currentWardName={currentWardName}
          assignments={assignments}
          newStaffName={newStaffName}
          setNewStaffName={setNewStaffName}
          newStaffRole={newStaffRole}
          setNewStaffRole={setNewStaffRole}
          onAddStaff={handleAddStaff}
          onAssignStaff={assignStaff}
          onRemoveStaff={handleRemoveStaffGlobal}
        />
      )}

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
