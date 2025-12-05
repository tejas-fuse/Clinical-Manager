import React, { useState } from 'react';
import { X, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { REQUEST_STATUS } from '../constants/config';

export const ChangeRequestModal = ({ 
  isOpen, 
  onClose, 
  dateKey, 
  shiftLabel,
  currentUser,
  onSubmitRequest 
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmitRequest({
      userId: currentUser.id,
      userName: currentUser.fullName,
      dateKey,
      shiftLabel,
      reason: reason.trim()
    });
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Request Duty Change</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Date:</span> {dateKey}<br />
            <span className="font-semibold">Shift:</span> {shiftLabel}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Change Request
            </label>
            <textarea
              placeholder="Please explain why you need this duty change..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RequestsModal = ({ isOpen, onClose, requests, onApprove, onReject, canApprove }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Duty Change Requests</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock size={48} className="mx-auto mb-2 opacity-50" />
              <p>No change requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{request.userName}</p>
                      <p className="text-sm text-gray-500">
                        {request.dateKey} • {request.shiftLabel}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      request.status === REQUEST_STATUS.PENDING 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === REQUEST_STATUS.APPROVED
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">
                    Requested on {new Date(request.createdAt).toLocaleString()}
                  </p>

                  {canApprove && request.status === REQUEST_STATUS.PENDING && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
