// src/pages/AdminStaffInfoPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';
import { canAssignStaff, getRoleColorClass } from '../utils/permissions';

// --- 사용자 상세 정보 모달 컴포넌트 ---
const UserDetailModal = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{user?.name || 'Unknown User'}</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-gray-50 rounded">
            <p><strong>이메일:</strong> {user?.email || 'N/A'}</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded">
            <p><strong>역할:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(user?.role)}`}>
                {user?.role || 'N/A'}
              </span>
            </p>
          </div>
          
          {user?.affiliation && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>소속:</strong> {user.affiliation}</p>
            </div>
          )}
          
          {user?.bio && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>자기소개:</strong></p>
              <p className="mt-1 text-gray-700">{user.bio}</p>
            </div>
          )}
          
          {user?.interests && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>관심사:</strong> {user.interests}</p>
            </div>
          )}
          
          {user?.spokenLanguages && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>구사 언어:</strong> {user.spokenLanguages}</p>
            </div>
          )}
          
          {user?.desiredLanguages && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>배우고 싶은 언어:</strong> {user.desiredLanguages}</p>
            </div>
          )}
          
          {user?.membership && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>멤버십:</strong> {user.membership}</p>
            </div>
          )}
          
          {user?.memberships && user.memberships.length > 0 && (
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>활성 멤버십:</strong></p>
              <ul className="mt-1 space-y-1">
                {user.memberships.map((membership, index) => (
                  <li key={index} className="text-xs bg-white px-2 py-1 rounded">
                    {membership.branchName} - {membership.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={onClose} 
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
);

export default function AdminStaffInfoPage() {
  const { user } = useUser();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, userId: null, email: '' });
  const [assignRole, setAssignRole] = useState('STAFF');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 상세 정보용

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

  const canAssignStaffPermission = useMemo(() => {
    return canAssignStaff(user?.role);
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
    // Admin과 President는 모든 지부에 접근 권한이 있음
    if (m?.role === 'ADMIN' || m?.role === 'PRESIDENT') {
      return ['NCCU', 'NTU', 'TAIPEI']; // 모든 지부 반환
    }
    
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
    if (!canAssignStaffPermission) return alert('권한이 없습니다.');
    setAssignModal({ open: true, userId: member.id, email: member.email });
    setAssignRole('STAFF');
  };

  const submitAssign = async () => {
    try {
      // 새로운 스태프 온보딩 프로세스 사용
      const response = await axios.post('/api/admin/users/assign-staff', {
        userId: assignModal.userId,
        targetRole: assignRole,
        reason: `Assigned as ${assignRole} by admin`
      });
      
      if (response.data.success) {
        alert(response.data.message);
        setAssignModal({ open: false, userId: null, email: '' });
        // 화면을 새로고침하여 최신 상태 반영
        const res = await axios.get('/api/admin/users');
        setMembers(res.data);
      } else {
        alert(response.data.message);
      }
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.response?.data || e.message;
      alert('스태프 임명에 실패했습니다: ' + errorMessage);
    }
  };



  return (
    <div className="p-4 sm:p-8">
      {/* 사용자 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
      
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
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => setSelectedUser(member)}
                  >
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600">{member.name}</h3>
                    <p className="text-sm text-gray-600 hover:text-blue-500">{member.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(member.role)}`}>
                    {member.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Branch:</span> {getActiveBranches(member).join(', ') || '-'}
                </div>
                {canAssignStaffPermission && (
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
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-blue-600 font-medium"
                    onClick={() => setSelectedUser(member)}
                  >
                    {member.name}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedUser(member)}
                  >
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getActiveBranches(member).join(', ') || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {canAssignStaffPermission && (
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
