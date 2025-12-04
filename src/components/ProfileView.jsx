import React, { useMemo } from 'react';
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';
import { SHIFTS } from '../constants/config';
import { formatDateKey } from '../utils/helpers';

export const ProfileView = ({ currentUser, allAssignments, currentWardId, staffList }) => {
  // Calculate duty statistics for current user
  const userStats = useMemo(() => {
    if (!currentUser || !currentWardId) return null;

    const assignments = allAssignments[currentWardId] || {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Find the staff member record for current user
    const userStaff = staffList.find(s => 
      s.name.toLowerCase() === currentUser.fullName.toLowerCase()
    );

    if (!userStaff) return null;

    const stats = {
      thisMonth: { total: 0, byShift: {}, byWeek: [{}, {}, {}, {}, {}] },
      lastMonth: { total: 0, byShift: {} },
      allTime: { total: 0, byShift: {} }
    };

    // Initialize shift counters
    SHIFTS.forEach(shift => {
      if (shift.id !== 'leave') {
        stats.thisMonth.byShift[shift.id] = 0;
        stats.lastMonth.byShift[shift.id] = 0;
        stats.allTime.byShift[shift.id] = 0;
        stats.thisMonth.byWeek.forEach(week => week[shift.id] = 0);
      }
    });

    // Count assignments
    Object.entries(assignments).forEach(([dateKey, dayAssignments]) => {
      const date = new Date(dateKey);
      const month = date.getMonth();
      const year = date.getFullYear();

      Object.entries(dayAssignments).forEach(([shiftId, staffIds]) => {
        if (shiftId === 'leave' || !staffIds.includes(userStaff.id)) return;

        // All time
        stats.allTime.total++;
        stats.allTime.byShift[shiftId] = (stats.allTime.byShift[shiftId] || 0) + 1;

        // This month
        if (year === currentYear && month === currentMonth) {
          stats.thisMonth.total++;
          stats.thisMonth.byShift[shiftId]++;

          // Calculate week of month (0-4)
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
          if (weekOfMonth < 5) {
            stats.thisMonth.byWeek[weekOfMonth][shiftId]++;
          }
        }

        // Last month
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

  if (!userStats) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            No staff profile found. Please ensure your name matches a staff member in the system.
          </p>
        </div>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthName = lastMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{currentUser.fullName}</h1>
            <p className="text-blue-100">{currentUser.role.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* This Month - Weekly Breakdown */}
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
                  <th key={shift.id} className="text-center p-3 text-sm font-semibold text-gray-700">
                    {shift.label}
                  </th>
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

      {/* Shift Distribution - This Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">This Month by Shift</h2>
          <div className="space-y-3">
            {SHIFTS.filter(s => s.id !== 'leave').map(shift => {
              const count = userStats.thisMonth.byShift[shift.id] || 0;
              const percentage = userStats.thisMonth.total > 0 
                ? Math.round((count / userStats.thisMonth.total) * 100) 
                : 0;
              return (
                <div key={shift.id}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${shift.color}`}>{shift.label}</span>
                    <span className="text-sm font-bold text-gray-700">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${shift.color.replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
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
              const percentage = userStats.lastMonth.total > 0 
                ? Math.round((count / userStats.lastMonth.total) * 100) 
                : 0;
              return (
                <div key={shift.id}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${shift.color}`}>{shift.label}</span>
                    <span className="text-sm font-bold text-gray-700">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${shift.color.replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
