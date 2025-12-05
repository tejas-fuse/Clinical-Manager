import React, { useEffect, useState } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { fetchWards } from '../services/wards';
import { listStaffByWardIds, deleteStaff } from '../services/staff';

const normalizeWardIds = (wardEntries) => (wardEntries || []).map(entry => typeof entry === 'string' ? entry : entry?.id).filter(Boolean);

export const InChargeStaffPanel = ({ currentUser }) => {
  const [wards, setWards] = useState([]);
  const [staffInMyWards, setStaffInMyWards] = useState([]);
  const myWardIds = normalizeWardIds(currentUser?.assignedWards);

  useEffect(() => {
    const load = async () => {
      try {
        const w = await fetchWards();
        setWards(w);
        if (myWardIds.length) {
          const staff = await listStaffByWardIds(myWardIds);
          const mapped = staff.map(s => ({ ...s, name: s.full_name }));
          setStaffInMyWards(mapped);
        }
      } catch (err) {
        console.error('Failed to load staff/wards', err);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWardName = (wardId) => wards.find(w => w.id === wardId)?.name || 'Unknown Ward';

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await deleteStaff(id);
      setStaffInMyWards(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete staff');
      console.error(err);
    }
  };

  const myWardNames = myWardIds.map(getWardName).join(', ');

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">Staff assigned to your wards</p>
        {myWardNames && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900"><strong>Your Wards:</strong> {myWardNames}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {staffInMyWards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No staff assigned to your wards yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ward</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffInMyWards.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-sm">{staff.role}</td>
                    <td className="px-6 py-4 text-sm">{getWardName(staff.ward_id)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
