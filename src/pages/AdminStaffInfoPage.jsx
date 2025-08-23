// src/pages/AdminStaffInfoPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';
import { canAssignStaff, getRoleColorClass, shouldShowAssignButton, getAssignableRoles } from '../utils/permissions';

// --- 사용자 상세 정보 모달 컴포넌트 ---
const UserDetailModal = ({ user, onClose, onDeleteMembership }) => {
  const getActiveBranches = (member) => {
    if (member?.role === 'ADMIN' || member?.role === 'PRESIDENT') {
      return ['NCCU', 'NTU', 'TAIPEI'];
    }
    
    const set = new Set();
    const str = (member?.membership || '').trim();
    if (str) set.add(str);
    if (Array.isArray(member?.memberships)) {
      for (const um of member.memberships) {
        const b = (um?.branchName || '').trim();
        const status = (um?.status || '').toUpperCase();
        if (b && (status === 'ACTIVE' || status === '')) set.add(b);
      }
    }
    return Array.from(set);
  };

  const branches = getActiveBranches(user);

  return (
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
            {/* Email */}
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            </div>
            
            {/* Role */}
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>Role:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColorClass(user?.role)}`}>
                  {user?.role || 'N/A'}
                </span>
              </p>
            </div>
            
            {/* Branch */}
            <div className="p-3 bg-gray-50 rounded">
              <p><strong>Branch:</strong> {branches.join(', ') || 'N/A'}</p>
            </div>
            
            {/* Student ID */}
            {user?.studentId && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Student ID:</strong> {user.studentId}</p>
              </div>
            )}
            
            {/* Phone */}
            {user?.phone && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Phone:</strong> {user.phone}</p>
              </div>
            )}
            
            {/* Major */}
            {user?.major && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Major:</strong> {user.major}</p>
              </div>
            )}
            
            {/* Payment */}
            {user?.paymentMethod && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Payment:</strong> {user.paymentMethod === 'transfer' ? `Transfer (${user.bankLast5 || 'N/A'})` : 'Cash'} - {user.amount || 'N/A'} NTD</p>
              </div>
            )}
            
            {/* Additional Info */}
            {user?.affiliation && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Affiliation:</strong> {user.affiliation}</p>
              </div>
            )}
            
            {user?.bio && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Bio:</strong></p>
                <p className="mt-1 text-gray-700">{user.bio}</p>
              </div>
            )}
            
            {user?.interests && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Interests:</strong> {user.interests}</p>
              </div>
            )}
            
            {user?.spokenLanguages && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Spoken Languages:</strong> {user.spokenLanguages}</p>
              </div>
            )}
            
            {user?.desiredLanguages && (
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Desired Languages:</strong> {user.desiredLanguages}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <button 
            onClick={onClose} 
            className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          
          {onDeleteMembership && branches.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${user?.name || 'this user'}'s membership?`)) {
                  // 첫 번째 branch를 기준으로 삭제 (또는 사용자가 선택하도록 개선 가능)
                  onDeleteMembership(user.id, branches[0]);
                }
              }} 
              className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete Membership
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminStaffInfoPage() {
  const { user } = useUser();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ open: false, userId: null, email: '', currentRole: null });
  const [assignRole, setAssignRole] = useState('STAFF');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 사용자 상세 정보용

  // Filters / Search / Sort
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

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

  // Distinct nationalities for filter
  const nationalities = useMemo(() => {
    const set = new Set();
    for (const m of members || []) {
      if (m?.nationality && m.nationality.trim()) {
        set.add(m.nationality.trim());
      }
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

    if (nationalityFilter !== 'ALL') {
      list = list.filter(m => m.nationality === nationalityFilter);
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
    } else if (sortKey === 'joinDate') {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // 최신순 (내림차순)
      });
    } else if (sortKey === 'joinDateOldest') {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateA - dateB; // 오래된순 (오름차순)
      });
    }

    return list;
  }, [members, search, roleFilter, branchFilter, nationalityFilter, sortKey]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, branchFilter, nationalityFilter, pageSize]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

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
    if (!shouldShowAssignButton(user?.role, member.role)) return alert('You do not have permission to assign roles.');
    if (user?.id === member.id) return alert('You cannot change your own role.');
    
    const assignableRoles = getAssignableRoles(user?.role, member.role);
    
    // 할당 가능한 역할이 없으면 경고
    if (assignableRoles.length === 0) {
      return alert(`${member.name} already has the highest role you can assign or no available roles to assign.`);
    }
    
    const defaultRole = assignableRoles.includes('STAFF') ? 'STAFF' : assignableRoles[0];
    setAssignModal({ open: true, userId: member.id, email: member.email, currentRole: member.role });
    setAssignRole(defaultRole);
  };

  const submitAssign = async () => {
    try {
      // 대상 사용자의 현재 역할 확인
      const targetMember = filteredMembers.find(m => m.id === assignModal.userId);
      const currentRole = targetMember?.role;
      
      // 이미 Staff 이상의 역할을 가진 사용자는 바로 역할 변경
      const isAlreadyStaff = ['STAFF', 'LEADER', 'PRESIDENT', 'ADMIN'].includes(currentRole);
      
      let response;
      if (isAlreadyStaff) {
        // 기존 스태프/관리자의 역할 변경 (온보딩 생략)
        response = await axios.post(`/api/admin/users/role?userId=${assignModal.userId}&role=${assignRole}`);
        alert(`Role successfully changed to ${assignRole}.`);
      } else {
        // 새로운 스태프 온보딩 프로세스
        response = await axios.post('/api/admin/users/assign-staff', {
          userId: assignModal.userId,
          targetRole: assignRole,
          reason: `Assigned as ${assignRole} by admin`
        });
        
        if (response.data.success) {
          alert(response.data.message);
        } else {
          alert(response.data.message);
          return;
        }
      }
      
      setAssignModal({ open: false, userId: null, email: '', currentRole: null });
      // 화면을 새로고침하여 최신 상태 반영
      const res = await axios.get('/api/admin/users');
      setMembers(res.data);
      
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.response?.data || e.message;
      const actionType = ['STAFF', 'LEADER', 'PRESIDENT', 'ADMIN'].includes(
        filteredMembers.find(m => m.id === assignModal.userId)?.role
      ) ? 'Role change' : 'Staff assignment';
      alert(`${actionType} failed: ` + errorMessage);
    }
  };

  // ✅ 멤버십 삭제 함수
  const handleDeleteMembership = async (userId, branchName) => {
    try {
      await axios.delete(`/api/admin/users/memberships?userId=${userId}&branchName=${branchName}`);
      alert('Membership deleted successfully');
      // 목록 새로고침
      const response = await axios.get('/api/admin/users');
      setMembers(response.data);
      setSelectedUser(null); // 모달 닫기
    } catch (error) {
      console.error('Failed to delete membership:', error);
      alert('Failed to delete membership');
    }
  };



  return (
    <div className="p-4 sm:p-8">
      {/* 사용자 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onDeleteMembership={handleDeleteMembership}
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
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 border-b">
                        <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search: Name/Email"
            className="border rounded px-3 py-2"
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-3 py-2">
            {roleOptions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="border rounded px-3 py-2">
            {branches.map(b => (
              <option key={b} value={b}>{b === 'ALL' ? 'Filter: Branch' : b}</option>
            ))}
          </select>
          <select value={nationalityFilter} onChange={e => setNationalityFilter(e.target.value)} className="border rounded px-3 py-2">
            {nationalities.map(n => (
              <option key={n} value={n}>{n === 'ALL' ? 'Filter: Nationality' : n}</option>
            ))}
          </select>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="border rounded px-3 py-2">
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="role">Sort: Role</option>
            <option value="branch">Sort: Branch</option>
            <option value="joinDate">Sort: Join Date (Newest)</option>
            <option value="joinDateOldest">Sort: Join Date (Oldest)</option>
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

        {/* Results Summary */}
        <div className="px-4 py-2 text-sm text-gray-600 border-b">
          {filteredMembers.length === members.length ? (
            `Showing all ${filteredMembers.length} members`
          ) : (
            `Showing ${filteredMembers.length} of ${members.length} members`
          )}
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : isMobile ? (
          // Mobile Card View
          <div className="p-4 space-y-4">
            {paginatedMembers.map(member => (
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
                <div className="text-sm text-gray-600 mb-3 space-y-1">
                  <div><span className="font-medium">Branch:</span> {getActiveBranches(member).join(', ') || '-'}</div>
                  <div><span className="font-medium">Nationality:</span> {member.nationality || '-'}</div>
                  <div><span className="font-medium">Joined:</span> {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}</div>
                </div>
                {(() => {
                  const canShow = shouldShowAssignButton(user?.role, member.role);
                  const isNotSelf = user?.id !== member.id;
                  const assignableRoles = getAssignableRoles(user?.role, member.role);
                  const hasRoles = assignableRoles.length > 0;
                  
                  // 디버깅 로그 (개발자 도구 Console에서 확인)
                  if (member.role === 'STAFF' || member.role === 'MEMBER') {
                    console.log(`🔍 버튼 표시 체크 - ${member.name} (${member.role}):`, {
                      currentUserRole: user?.role,
                      targetRole: member.role,
                      canShow,
                      isNotSelf,
                      assignableRoles,
                      hasRoles,
                      finalShow: canShow && isNotSelf && hasRoles
                    });
                  }
                  
                  return canShow && isNotSelf && hasRoles && (
                    <button 
                      onClick={() => openAssign(member)} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Assign Role
                    </button>
                  );
                })()}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMembers.map(member => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.nationality || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(() => {
                      const canShow = shouldShowAssignButton(user?.role, member.role);
                      const isNotSelf = user?.id !== member.id;
                      const assignableRoles = getAssignableRoles(user?.role, member.role);
                      const hasRoles = assignableRoles.length > 0;
                      
                      return canShow && isNotSelf && hasRoles && (
                        <button onClick={() => openAssign(member)} className="text-blue-600 hover:underline">Assign Role</button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {filteredMembers.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
            </div>

            {/* Page Numbers */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pageNumbers = [];
                  const maxVisiblePages = isMobile ? 3 : 7;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  // First page + ellipsis
                  if (startPage > 1) {
                    pageNumbers.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pageNumbers.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                    }
                  }

                  // Visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 rounded text-sm ${
                          i === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page + ellipsis
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pageNumbers.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                    }
                    pageNumbers.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pageNumbers;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {assignModal.open && (() => {
        const targetMember = filteredMembers.find(m => m.id === assignModal.userId);
        const currentRole = targetMember?.role;
        const isAlreadyStaff = ['STAFF', 'LEADER', 'PRESIDENT', 'ADMIN'].includes(currentRole);
        const modalTitle = isAlreadyStaff ? 'Change Role' : 'Assign Staff';
        const modalDescription = isAlreadyStaff 
          ? `Change the role for ${assignModal.email}. (Current: ${currentRole})`
          : `Assign ${assignModal.email} as staff. An onboarding email will be sent.`;
        
        const availableRoles = getAssignableRoles(user?.role, currentRole);
        
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
              <p className="text-sm text-gray-600 mb-4">{modalDescription}</p>
              <label className="block text-sm mb-1">New Role</label>
              <select value={assignRole} onChange={e => setAssignRole(e.target.value)} className="w-full border rounded p-2 mb-6">
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {isAlreadyStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
                  💡 Existing staff member - role will be changed immediately. (Onboarding process skipped)
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssignModal({ open: false, userId: null, email: '', currentRole: null })} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={submitAssign} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {isAlreadyStaff ? 'Change Role' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
