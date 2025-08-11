// src/pages/AdminStaffInfoPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function AdminStaffInfoPage() {
  const { user } = useUser();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, userId: null, email: '' });
  const [assignRole, setAssignRole] = useState('STAFF');

  const canAssignStaff = useMemo(() => {
    // ADMIN은 모두 가능, PRESIDENT도 STAFF로 지정 가능
    return user?.role === 'ADMIN' || user?.role === 'PRESIDENT';
  }, [user?.role]);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/users');
        setMembers(res.data);
      } catch (e) {
        console.error('Failed to fetch members', e);
        alert('멤버 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const openAssign = (member) => {
    if (!canAssignStaff) return alert('권한이 없습니다.');
    setAssignModal({ open: true, userId: member.id, email: member.email });
    setAssignRole('STAFF');
  };

  const submitAssign = async () => {
    try {
      await axios.post(`/api/admin/users/role?userId=${assignModal.userId}&role=${assignRole}`);
      alert('역할이 업데이트되었습니다.');
      setMembers(prev => prev.map(m => m.id === assignModal.userId ? { ...m, role: assignRole } : m));
      setAssignModal({ open: false, userId: null, email: '' });
    } catch (e) {
      alert(e.response?.data || e.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Staff Info</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.membership || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {canAssignStaff && (
                      <button onClick={() => openAssign(member)} className="text-blue-600 hover:underline">Assign as Staff</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {assignModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Staff</h2>
            <p className="text-sm text-gray-600 mb-4">{assignModal.email}의 역할을 설정합니다.</p>
            <label className="block text-sm mb-1">Role</label>
            <select value={assignRole} onChange={e => setAssignRole(e.target.value)} className="w-full border rounded p-2 mb-6">
              <option value="STAFF">STAFF</option>
              {user?.role === 'ADMIN' && <option value="PRESIDENT">PRESIDENT</option>}
              {user?.role === 'ADMIN' && <option value="LEADER">LEADER</option>}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAssignModal({ open: false, userId: null, email: '' })} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={submitAssign} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
