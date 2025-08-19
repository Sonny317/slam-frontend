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
  const [isMobile, setIsMobile] = useState(false);

  // Filters / Search / Sort
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('name');

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200); // iPad Pro까지 카드 뷰 사용
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Helper: derive active branches for a member from both string field and memberships collection
  const getActiveBranches = (m) => {
    const set = new Set();
    const str = (m?.membership || '').trim();
    if (str) set.add(str);
    if (Array.isArray(m?.memberships)) {
      for (const um of m.memberships) {
        const b = (um?.branchName || '').trim();
        const status = (um?.status || '').toUpperCase();
        if (b && (status === 'ACTIVE' || status === '')) set.add(b);
      }
    }
    return Array.from(set);
  };

  // Distinct branches for filter
  const branches = useMemo(() => {
    const set = new Set();
    for (const m of members || []) {
      for (const b of getActiveBranches(m)) set.add(b);
    }
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [members]);

  // Role options
  const roleOptions = ['ALL', 'ADMIN', 'PRESIDENT', 'LEADER', 'STAFF', 'MEMBER'];

  // Derived list
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...members];

    if (q) {
      list = list.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'ALL') {
      list = list.filter(m => (m.role || '').toUpperCase() === roleFilter);
    }

    if (branchFilter !== 'ALL') {
      list = list.filter(m => getActiveBranches(m).includes(branchFilter));
    }

    const by = (v) => (v == null ? '' : String(v));
    if (sortKey === 'name') {
      list.sort((a, b) => by(a.name).localeCompare(by(b.name)));
    } else if (sortKey === 'email') {
      list.sort((a, b) => by(a.email).localeCompare(by(b.email)));
    } else if (sortKey === 'role') {
      list.sort((a, b) => by(a.role).localeCompare(by(b.role)));
    } else if (sortKey === 'branch') {
      const firstBranch = (m) => getActiveBranches(m)[0] || '';
      list.sort((a, b) => by(firstBranch(a)).localeCompare(by(firstBranch(b))));
    }

    return list;
  }, [members, search, roleFilter, branchFilter, sortKey]);

  const roleCounts = useMemo(() => {
    const counts = { ADMIN: 0, PRESIDENT: 0, LEADER: 0, STAFF: 0, MEMBER: 0 };
    for (const m of members) {
      const r = (m.role || '').toUpperCase();
      if (counts[r] != null) counts[r] += 1;
    }
    return counts;
  }, [members]);

  const branchCounts = useMemo(() => {
    const counts = {};
    for (const m of members) {
      const bs = getActiveBranches(m);
      for (const b of bs) counts[b] = (counts[b] || 0) + 1;
    }
    return counts;
  }, [members]);

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Branch'];
    const rows = filteredMembers.map(m => [
      m.name || '',
      m.email || '',
      m.role || '',
      getActiveBranches(m).join(', ')
    ]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PRESIDENT': return 'bg-purple-100 text-purple-800';
      case 'LEADER': return 'bg-blue-100 text-blue-800';
      case 'STAFF': return 'bg-green-100 text-green-800';
      case 'MEMBER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Staff Info</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-gray-600">
            전체: <span className="font-semibold">{members.length}</span>
            <span className="mx-1">/</span>
            표시: <span className="font-semibold">{filteredMembers.length}</span>
          </div>
          <button onClick={exportCsv} className="px-3 py-2 bg-emerald-600 text-white rounded text-sm">Export CSV</button>
        </div>
      </div>

      {/* Branch Tabs */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {branches.map(b => (
            <button
              key={b}
              onClick={() => setBranchFilter(b)}
              className={
                (branchFilter === b
                  ? 'bg-blue-600 text-white '
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ')
                + 'px-3 py-2 rounded-full text-sm whitespace-nowrap'
              }
              title={b === 'ALL' ? '전체' : b}
            >
              {b === 'ALL' ? 'ALL' : b}
              <span className={
                (branchFilter === b ? 'bg-white text-blue-700 ' : 'bg-white/80 text-gray-700 ')
                + 'ml-2 px-2 py-0.5 rounded-full text-xs'}>
                {b === 'ALL' ? members.length : (branchCounts[b] || 0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Controls */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-b">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색: 이름/이메일"
            className="border rounded px-3 py-2"
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-3 py-2">
            {roleOptions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="border rounded px-3 py-2">
            <option value="name">정렬: Name</option>
            <option value="email">정렬: Email</option>
            <option value="role">정렬: Role</option>
            <option value="branch">정렬: Branch</option>
          </select>
        </div>

        {/* Role summary */}
        <div className="px-4 py-3 text-sm text-gray-600 flex flex-wrap gap-4">
          <span>ADMIN: <b>{roleCounts.ADMIN}</b></span>
          <span>PRESIDENT: <b>{roleCounts.PRESIDENT}</b></span>
          <span>LEADER: <b>{roleCounts.LEADER}</b></span>
          <span>STAFF: <b>{roleCounts.STAFF}</b></span>
          <span>MEMBER: <b>{roleCounts.MEMBER}</b></span>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : isMobile ? (
          // Mobile Card View
          <div className="p-4 space-y-4">
            {filteredMembers.map(member => (
              <div key={member.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Branch:</span> {getActiveBranches(member).join(', ') || '-'}
                </div>
                {canAssignStaff && (
                  <button 
                    onClick={() => openAssign(member)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Assign as Staff
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
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
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getActiveBranches(member).join(', ') || '-'}</td>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
