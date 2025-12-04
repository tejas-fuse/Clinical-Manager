import React from 'react';
import { X } from 'lucide-react';

export const WardModal = ({ isOpen, onClose, newWardName, setNewWardName, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm m-4 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Create New Ward</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ward Name</label>
                    <input 
                        type="text"
                        placeholder="e.g. ICU, General, Emergency"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newWardName}
                        onChange={(e) => setNewWardName(e.target.value)}
                        autoFocus
                    />
                </div>
                <button 
                    onClick={onSave}
                    disabled={!newWardName.trim()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create Ward
                </button>
            </div>
        </div>
    </div>
  );
};
