import React, { useMemo, useState } from 'react';
import { Users, BarChart3, Filter } from 'lucide-react';
import { SHIFTS, USER_ROLES } from '../constants/config';

export const AnalyticsView = ({ currentUser, allAssignments, currentWardId, staffList, currentWardName }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate statistics for all staff
  const allStaffStats = useMemo(() => {
    if (!currentWardId || !staffList.length) return [];

    const assignments = allAssignments[currentWardId] || {};
    const [year, month] = selectedMonth.split('-').map(Number);

    const statsMap = {};

    // Initialize stats for each staff member
    staffList.forEach(staff => {
      statsMap[staff.id] = {
        staff,
        total: 0,
        byShift: {},
        byWeek: [{}, {}, {}, {}, {}]
      };

      SHIFTS.forEach(shift => {
        if (shift.id !== 'leave') {
          statsMap[staff.id].byShift[shift.id] = 0;
          statsMap[staff.id].byWeek.forEach(week => week[shift.id] = 0);
        }
      });
    });

    // Count assignments
    Object.entries(assignments).forEach(([dateKey, dayAssignments]) => {
      const date = new Date(dateKey);
      const assignmentMonth = date.getMonth() + 1;
      const assignmentYear = date.getFullYear();

      if (assignmentYear !== year || assignmentMonth !== month) return;

      Object.entries(dayAssignments).forEach(([shiftId, staffIds]) => {
        if (shiftId === 'leave') return;

        staffIds.forEach(staffId => {
          if (!statsMap[staffId]) return;

          statsMap[staffId].total++;
          statsMap[staffId].byShift[shiftId]++;

          // Calculate week of month
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 5) {
            statsMap[staffId].byWeek[weekOfMonth][shiftId]++;
          }
        });
      });
    });

    return Object.values(statsMap).sort((a, b) => b.total - a.total);
  }, [currentWardId, allAssignments, staffList, selectedMonth]);

  const canViewAnalytics = USER_ROLES[currentUser?.role]?.canApprove;

  if (!canViewAnalytics) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">You don't have permission to view staff analytics.</p>
          <p className="text-red-600 text-sm mt-2">This feature is only available for In-Charge and Admin users.</p>
        </div>
      </div>
    );
  }

  const selectedDate = new Date(selectedMonth + '-01');
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={28} />
              Staff Analytics - {currentWardName}
            </h1>
            <p className="text-gray-500 mt-1">Overview of all staff duty assignments</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staffList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Duties</p>
              <p className="text-2xl font-bold text-gray-900">
                {allStaffStats.reduce((sum, s) => sum + s.total, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg per Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {staffList.length > 0 
                  ? Math.round(allStaffStats.reduce((sum, s) => sum + s.total, 0) / staffList.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Most Active</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {allStaffStats[0]?.staff.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{monthName} - Staff Duty Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Staff Name</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Role</th>
                {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                  <th key={shift.id} className="text-center p-3 text-sm font-semibold text-gray-700">
                    {shift.label}
                  </th>
                ))}
                <th className="text-center p-3 text-sm font-semibold text-gray-700 bg-blue-50">Total</th>
              </tr>
            </thead>
            <tbody>
              {allStaffStats.map((staffStat) => {
                const roleLabel = Object.values(USER_ROLES).find(r => r.id === staffStat.staff.role)?.label || 
                                 staffStat.staff.role;
                return (
                  <tr key={staffStat.staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {staffStat.staff.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{staffStat.staff.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{roleLabel}</td>
                    {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                      <td key={shift.id} className="text-center p-3">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                          {staffStat.byShift[shift.id] || 0}
                        </span>
                      </td>
                    ))}
                    <td className="text-center p-3 bg-blue-50">
                      <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-blue-600 text-white font-bold text-sm">
                        {staffStat.total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Staff Weekly Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Weekly Breakdown by Staff</h2>
        {allStaffStats.map((staffStat) => (
          <div key={staffStat.staff.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
              <span>{staffStat.staff.name}</span>
              <span className="text-sm text-gray-500">Total: {staffStat.total} duties</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 text-xs font-semibold text-gray-600">Week</th>
                    {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                      <th key={shift.id} className="text-center p-2 text-xs font-semibold text-gray-600">
                        {shift.label}
                      </th>
                    ))}
                    <th className="text-center p-2 text-xs font-semibold text-gray-600 bg-blue-50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {staffStat.byWeek.map((week, index) => {
                    const weekTotal = Object.values(week).reduce((sum, val) => sum + val, 0);
                    return (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="p-2 text-xs text-gray-600">Week {index + 1}</td>
                        {SHIFTS.filter(s => s.id !== 'leave').map(shift => (
                          <td key={shift.id} className="text-center p-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-700 font-medium text-xs">
                              {week[shift.id] || 0}
                            </span>
                          </td>
                        ))}
                        <td className="text-center p-2 bg-blue-50">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs">
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
        ))}
      </div>
    </div>
  );
};
