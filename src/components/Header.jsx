import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  UserPlus, 
  Trash2, 
  Calendar as CalendarIcon,
  Building2,
  Plus
} from 'lucide-react';

export const Header = ({ 
  wards, 
  currentWardId, 
  setCurrentWardId, 
  weekDates, 
  onPrevWeek, 
  onNextWeek, 
  onPrint, 
  onManageStaff, 
  onOpenWardModal,
  onDeleteWard 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20 print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-4">
          
          {/* Top Row: Title & Ward Selector */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                  <CalendarIcon className="text-blue-600" size={24} />
                  <h1 className="text-xl font-bold text-gray-900">Clinical Manager</h1>
              </div>

              {/* Ward Selector */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                  <Building2 size={18} className="text-slate-500 ml-2" />
                  {wards.length > 0 ? (
                      <>
                          <select 
                              value={currentWardId} 
                              onChange={(e) => setCurrentWardId(e.target.value)}
                              className="bg-transparent border-none font-semibold text-slate-700 focus:ring-0 text-sm min-w-[150px] cursor-pointer"
                          >
                              {wards.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                          </select>
                          <button 
                              onClick={onDeleteWard}
                              className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                              title="Delete Current Ward"
                          >
                              <Trash2 size={16} />
                          </button>
                      </>
                  ) : (
                      <span className="text-sm font-medium text-slate-500 px-3">No Wards Created</span>
                  )}
                  <button 
                      onClick={onOpenWardModal} 
                      className="p-1.5 bg-white rounded-md shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Add New Ward"
                  >
                      <Plus size={16} />
                  </button>
              </div>
          </div>

          {/* Bottom Row: Controls */}
          {wards.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  {/* Date Controls */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button onClick={onPrevWeek} className="p-2 hover:bg-white rounded-md shadow-sm transition-all">
                      <ChevronLeft size={20} />
                      </button>
                      <div className="px-4 font-medium min-w-[200px] text-center">
                      {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {' '}
                      {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <button onClick={onNextWeek} className="p-2 hover:bg-white rounded-md shadow-sm transition-all">
                      <ChevronRight size={20} />
                      </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={onManageStaff}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                          <UserPlus size={18} />
                          Manage Staff
                      </button>
                      <button 
                          onClick={onPrint}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
                      >
                          <Printer size={18} />
                          Print
                      </button>
                  </div>
              </div>
          )}
      </div>
    </header>
  );
};
