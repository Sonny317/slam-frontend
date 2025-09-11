// src/pages/AdminMemberManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';

// --- 가짜 데이터 (나중에 이 모든 데이터를 백엔드 API로부터 받아옵니다) ---
const loggedInStaff = { name: 'Alice', role: 'PRESIDENT', branch: 'NCCU' }; // 'PRESIDENT', 'All'로 바꿔서 테스트해보세요.

// 초기 트랜잭션(수입/지출 통합)
const initialTransactionsByBranch = {
  NCCU: [
    { id: 1, type: 'expense', date: '2025-07-25', item: 'BBQ Party Supplies', amount: 3500, submittedBy: 'Alice', status: 'Pending' },
    { id: 4, type: 'revenue', date: '2025-07-20', item: 'Membership Fee', amount: 12000, submittedBy: 'System' },
  ],
  TAIPEI: [
    { id: 2, type: 'expense', date: '2025-07-26', item: 'Venue Rental Deposit', amount: 2000, submittedBy: 'Peter', status: 'Reimbursed' },
    { id: 5, type: 'revenue', date: '2025-07-22', item: 'Event Ticket', amount: 4500, submittedBy: 'System' },
  ],
  NTU: [
    { id: 3, type: 'expense', date: '2025-07-27', item: 'Scavenger Hunt Prizes', amount: 1500, submittedBy: 'Diana', status: 'Pending' },
  ],
};
// --------------------------------------------------------------------

// --- 상세 정보 팝업(Modal) 컴포넌트 ---
const DetailModal = ({ user, onClose, onDeleteMembership }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{user?.name || user?.userName || 'Unknown User'}</h2>
            <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {user?.email || user?.userEmail || 'N/A'}</p>
                <p><strong>Branch:</strong> {user?.branch || user?.membership || user?.selectedBranch || 'N/A'}</p>
                {user?.studentId && <p><strong>Student ID:</strong> {user.studentId}</p>}
                {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                {user?.major && <p><strong>Major:</strong> {user.major}</p>}
                {user?.professionalStatus && <p><strong>Status:</strong> {user.professionalStatus}</p>}
                {user?.country && <p><strong>Country:</strong> {user.country}</p>}
                {user?.paymentMethod && <p><strong>Payment:</strong> {user.paymentMethod === 'transfer' ? `Transfer (${user.bankLast5})` : 'Cash'} - {user.amount || membershipFeeNTD} NTD</p>}
                {!user?.paymentMethod && user?.membership && <p><strong>Payment:</strong> Cash - {membershipFeeNTD} NTD</p>}
            </div>
            <div className="mt-6 space-y-2">
                <button onClick={onClose} className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
                {onDeleteMembership && (
                    <button 
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user?.name || user?.userName || 'this user'}'s membership?`)) {
                                onDeleteMembership(user.id, user?.branch || user?.selectedBranch);
                            }
                        }} 
                        className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete Membership
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default function AdminMemberManagementPage() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [branchFilter, setBranchFilter] = useState(loggedInStaff.branch === 'All' ? 'NCCU' : loggedInStaff.branch);
  const [selectedUser, setSelectedUser] = useState(null); // 모달에 보여줄 사용자 정보
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // All Members 탭 필터링 상태 추가
  const [memberSearch, setMemberSearch] = useState('');
  const [memberNationalityFilter, setMemberNationalityFilter] = useState('ALL');
  const [memberSortKey, setMemberSortKey] = useState('name');
  const [memberCurrentPage, setMemberCurrentPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(20);
  
  // 회계 트랜잭션 상태 (지부별)
  const [transactionsByBranch, setTransactionsByBranch] = useState(initialTransactionsByBranch);
  // 신규 트랜잭션 입력값 상태
  const [newTx, setNewTx] = useState({ type: 'expense', date: '', item: '', amount: '', eventTitle: '', receiptDataUrl: '', receiptUrl: '' });
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState('');
  const [viewReceiptUrl, setViewReceiptUrl] = useState('');

  const availableBranches = loggedInStaff.role === 'PRESIDENT' ? ['NCCU', 'NTU', 'TAIPEI'] : [loggedInStaff.branch];

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200); // iPad Pro까지 카드 뷰 사용
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ 실제 API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'approvals') {
          const response = await axios.get('/api/admin/membership-applications');
          setApplications(response.data);
        } else if (activeTab === 'all_members') {
          console.log('Fetching members for branch:', branchFilter);
          const response = await axios.get(`/api/admin/users/branch?branchName=${branchFilter}&sort=name`);
          console.log('Members API response:', response.data);
          
          // 최근 승인된 멤버 정보가 있다면 해당 멤버 정보를 보강
          const recentlyApproved = localStorage.getItem('recentlyApprovedMember');
          if (recentlyApproved) {
            try {
              const approvedInfo = JSON.parse(recentlyApproved);
              const enhancedMembers = response.data.map(member => {
                if (member.email === approvedInfo.email) {
                  return {
                    ...member,
                    studentId: approvedInfo.studentId,
                    major: approvedInfo.major,
                    country: approvedInfo.country,
                    paymentMethod: approvedInfo.paymentMethod,
                    amount: approvedInfo.amount,
                    bankLast5: approvedInfo.bankLast5,
                    phone: approvedInfo.phone,
                    professionalStatus: approvedInfo.professionalStatus
                  };
                }
                return member;
              });
              setMembers(enhancedMembers);
              // 정보 사용 후 삭제
              localStorage.removeItem('recentlyApprovedMember');
            } catch (parseError) {
              console.error('Failed to parse recently approved member:', parseError);
              setMembers(response.data);
            }
          } else {
            setMembers(response.data);
          }
        } else if (activeTab === 'accounting') {
          // Load persisted finance transactions
          const res = await axios.get(`/api/admin/finance?branch=${branchFilter}`);
          const list = Array.isArray(res.data) ? res.data : [];
          setTransactionsByBranch(prev => ({ ...prev, [branchFilter]: list }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, branchFilter]);

  const filteredApplications = applications.filter(app => 
    app.selectedBranch === branchFilter && app.status === 'payment_pending'
  );
  
  // All Members 탭용 필터링 로직
  const baseMembers = Array.isArray(members) ? members : [];
  
  // 국적 목록 추출 (필터링용)
  const memberNationalities = useMemo(() => {
    const set = new Set();
    for (const member of baseMembers) {
      if (member?.country && member.country.trim()) {
        set.add(member.country.trim());
      }
    }
    return ['ALL', ...Array.from(set).sort()];
  }, [baseMembers]);
  
  // 멤버 필터링 및 정렬
  const filteredMembers = useMemo(() => {
    const searchQuery = memberSearch.trim().toLowerCase();
    let list = [...baseMembers];
    
    // 검색 필터
    if (searchQuery) {
      list = list.filter(member =>
        (member.name || '').toLowerCase().includes(searchQuery) ||
        (member.email || '').toLowerCase().includes(searchQuery) ||
        (member.studentId || '').toLowerCase().includes(searchQuery)
      );
    }
    
    // 국적 필터
    if (memberNationalityFilter !== 'ALL') {
      list = list.filter(member => member.country === memberNationalityFilter);
    }
    
    // 정렬
    const sortBy = (value) => (value == null ? '' : String(value));
    if (memberSortKey === 'name') {
      list.sort((a, b) => sortBy(a.name).localeCompare(sortBy(b.name)));
    } else if (memberSortKey === 'email') {
      list.sort((a, b) => sortBy(a.email).localeCompare(sortBy(b.email)));
    } else if (memberSortKey === 'joinedCount') {
      list.sort((a, b) => (b.joinedCount || 0) - (a.joinedCount || 0));
    } else if (memberSortKey === 'country') {
      list.sort((a, b) => sortBy(a.country).localeCompare(sortBy(b.country)));
    }
    
    return list;
  }, [baseMembers, memberSearch, memberNationalityFilter, memberSortKey]);
  
  // 페이지네이션
  const memberTotalPages = Math.ceil(filteredMembers.length / memberPageSize);
  const memberStartIndex = (memberCurrentPage - 1) * memberPageSize;
  const memberEndIndex = memberStartIndex + memberPageSize;
  const paginatedMembers = filteredMembers.slice(memberStartIndex, memberEndIndex);
  
  // 국적별 통계 계산
  const nationalityStats = useMemo(() => {
    const stats = { local: 0, international: 0, total: filteredMembers.length };
    const taiwanKeywords = ['taiwan', 'tw', '대만', '타이완', 'republic of china'];
    
    filteredMembers.forEach(member => {
      const country = (member.country || '').toLowerCase();
      const isLocal = taiwanKeywords.some(keyword => country.includes(keyword));
      if (isLocal) {
        stats.local++;
      } else {
        stats.international++;
      }
    });
    
    return stats;
  }, [filteredMembers]);
  const filteredTransactions = transactionsByBranch[branchFilter] || [];

  const totalRevenue = filteredTransactions
    .filter(tx => tx.type === 'revenue')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const totalExpenses = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // 통합 트랜잭션: 최신 날짜순 정렬
  const combinedTransactions = [...filteredTransactions].sort((a, b) => {
    const toTime = (d) => {
      const t = new Date(d).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return toTime(b.date) - toTime(a.date);
  });

  // ✅ 멤버십 삭제 함수
  const handleDeleteMembership = async (userId, branchName) => {
    try {
      await axios.delete(`/api/admin/users/memberships?userId=${userId}&branchName=${branchName}`);
      alert('Membership deleted successfully');
      // 목록 새로고침
      const response = await axios.get(`/api/admin/users/branch?branchName=${branchFilter}`);
      setMembers(response.data);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete membership:', error);
      alert('Failed to delete membership');
    }
  };

  // ✅ 모든 멤버십 초기화 함수 (테스트용)
  const handleResetAllMemberships = async () => {
    if (!window.confirm('Are you sure you want to reset ALL user memberships? This will clear all membership data.')) {
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/reset-memberships');
      alert(response.data);
      // 목록 새로고침
      if (activeTab === 'all_members') {
        const membersResponse = await axios.get(`/api/admin/users/branch?branchName=${branchFilter}`);
        setMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('Failed to reset memberships:', error);
      alert('Failed to reset memberships');
    }
  };

  // 회계: 지출 상태 업데이트 (지급 완료 처리 등)
  const handleMarkExpensePaid = async (expenseId) => {
    try {
      const list = transactionsByBranch[branchFilter] || [];
      const tx = list.find(t => t.id === expenseId && t.type === 'expense');
      if (!tx) return;
      await axios.put(`/api/admin/finance/${expenseId}`, { status: 'Reimbursed' });
      // refresh
      const res = await axios.get(`/api/admin/finance?branch=${branchFilter}`);
      setTransactionsByBranch(prev => ({ ...prev, [branchFilter]: Array.isArray(res.data) ? res.data : [] }));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  // 회계: 새 트랜잭션 추가 (수입/지출 선택)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const { type, date, item, amount } = newTx;
    const trimmedItem = String(item || '').trim();
    const parsedAmount = Number(amount);
    if (!date || !trimmedItem || Number.isNaN(parsedAmount)) {
      console.warn('Add transaction blocked: invalid input', { date, item, amount });
      alert('날짜/항목/금액을 모두 입력하세요. 금액은 숫자여야 합니다.');
      return;
    }

    try {
      await axios.post('/api/admin/finance', {
        branchName: branchFilter,
        type,
        date,
        item: trimmedItem,
        amount: parsedAmount,
        eventTitle: newTx.eventTitle || '',
        receiptUrl: newTx.receiptUrl || '',
        submittedBy: loggedInStaff.name,
      });
      // refresh
      const res = await axios.get(`/api/admin/finance?branch=${branchFilter}`);
      setTransactionsByBranch(prev => ({ ...prev, [branchFilter]: Array.isArray(res.data) ? res.data : [] }));
      setNewTx({ type: 'expense', date: '', item: '', amount: '', eventTitle: '', receiptDataUrl: '', receiptUrl: '' });
      setReceiptPreviewUrl('');
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    }
  };

  const membershipFeeNTD = 900; // 멤버십 회비 기준 금액

  // ✅ CSV 내보내기 함수
  const handleExportCSV = (members, branch) => {
    const headers = [
      'Name',
      'Email', 
      'Student ID',
      'Major',
      'Country',
      'Phone',
      'Payment Method',
      'Payment Amount',
      'Branch',
      'Events Joined',
      'Professional Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...members.map(member => [
        `"${member.name || ''}"`,
        `"${member.email || ''}"`,
        `"${member.studentId || ''}"`,
        `"${member.major || ''}"`,
        `"${member.country || ''}"`,
        `"${member.phone || ''}"`,
        `"${member.paymentMethod ? (member.paymentMethod === 'transfer' ? `Transfer (${member.bankLast5})` : 'Cash') : 'N/A'}"`,
        `"${member.amount || membershipFeeNTD}"`,
        `"${member.membership || member.branch || branch}"`,
        `"${member.joinedCount || 0}"`,
        `"${member.professionalStatus || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SLAM_${branch}_Members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ 신청서 승인 함수 (Reject 제거) + 회계 수입 반영
  const handleApproveApplication = async (application) => {
    try {
      await axios.post(`/api/admin/applications/approve?applicationId=${application.id}`);
      alert('Application approved successfully');
      
      // 승인된 멤버 정보를 localStorage에 임시 저장 (상세 정보 전달용)
      const approvedMemberInfo = {
        email: application.userEmail || application.email,
        studentId: application.studentId,
        major: application.major,
        country: application.country,
        paymentMethod: application.paymentMethod,
        amount: application.amount,
        bankLast5: application.bankLast5,
        selectedBranch: application.selectedBranch,
        userName: application.userName,
        phone: application.phone,
        professionalStatus: application.professionalStatus
      };
      localStorage.setItem('recentlyApprovedMember', JSON.stringify(approvedMemberInfo));
      
      // 목록 새로고침
      const response = await axios.get('/api/admin/membership-applications');
      setApplications(response.data);

      // 승인 시 해당 지부에 Revenue 자동 반영
      const branch = application.selectedBranch || branchFilter;
      setTransactionsByBranch(prev => {
        const updated = { ...prev };
        const list = [...(updated[branch] || [])];
        list.push({
          id: Date.now(),
          type: 'revenue',
          date: new Date().toISOString().slice(0,10),
          item: 'Membership Fee',
          amount: application.amount || membershipFeeNTD,
          submittedBy: application.userName || 'System',
        });
        updated[branch] = list;
        return updated;
      });
      
      // All Members 탭으로 자동 전환
      setActiveTab('all_members');
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {selectedUser && <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onDeleteMembership={handleDeleteMembership} />}
        {viewReceiptUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setViewReceiptUrl('')}>
            <div className="bg-white p-4 rounded-lg shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Receipt</h3>
                <button onClick={() => setViewReceiptUrl('')} className="text-gray-600 hover:text-gray-900">✕</button>
              </div>
              <div className="max-h-[75vh] overflow-auto">
                <img src={viewReceiptUrl} alt="Receipt" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Member Management</h1>
        <p className="text-gray-500 mb-8">Manage applications, view member lists, and track finances for each branch.</p>

      {/* 지부 선택 드롭다운 - 항상 표시 */}
      <div className="mb-6">
        <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700">Viewing Branch:</label>
        <select id="branch-filter" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
          className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
          {availableBranches.map(branch => <option key={branch}>{branch}</option>)}
        </select>
      </div>

      {/* Reset All Memberships Button */}
      <div className="mb-6">
        <button 
          onClick={handleResetAllMemberships}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium"
        >
          Reset All Memberships (Test)
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          <button onClick={() => setActiveTab('approvals')} className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'approvals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Pending Approvals</button>
          <button onClick={() => {
            console.log('All Members tab clicked');
            setActiveTab('all_members');
          }} className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'all_members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>All Members</button>
          <button onClick={() => setActiveTab('accounting')} className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'accounting' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Accounting</button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'approvals' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals for {branchFilter} ({filteredApplications.length})</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading applications...</p>
            ) : isMobile ? (
              // Mobile Card View for Approvals
              <div className="space-y-4">
                {filteredApplications.map(app => (
                  <div key={app.id} onClick={() => setSelectedUser(app)} className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{app.userName || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'}</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{app.status}</span>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleApproveApplication(app); 
                      }} 
                      className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View for Approvals
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map(app => (
                            <tr key={app.id} onClick={() => setSelectedUser(app)} className="cursor-pointer hover:bg-gray-50">
                                <td className="px-4 py-2">{app.userName || 'Unknown'}</td>
                                <td className="px-4 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{app.status}</span></td>
                                <td className="px-4 py-2">{app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'}</td>
                                <td className="px-4 py-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleApproveApplication(app); }} className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600">Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'all_members' && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Active Members in {branchFilter} ({filteredMembers.length})</h2>
              <button 
                onClick={() => handleExportCSV(filteredMembers, branchFilter)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium"
              >
                Export CSV
              </button>
            </div>
            
            {/* 필터링 및 통계 섹션 */}
            <div className="mb-6 space-y-4">
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800">Total Members</h3>
                  <p className="text-xl font-bold text-blue-900">{nationalityStats.total}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800">Local (Taiwan)</h3>
                  <p className="text-xl font-bold text-green-900">{nationalityStats.local}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800">International</h3>
                  <p className="text-xl font-bold text-purple-900">{nationalityStats.international}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-800">Local:Int Ratio</h3>
                  <p className="text-xl font-bold text-orange-900">
                    {nationalityStats.total > 0 
                      ? `${Math.round((nationalityStats.local / nationalityStats.total) * 100)}:${Math.round((nationalityStats.international / nationalityStats.total) * 100)}`
                      : '0:0'
                    }
                  </p>
                </div>
              </div>
              
              {/* 필터 컨트롤 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search: Name, Email, Student ID"
                  className="border rounded px-3 py-2"
                />
                <select 
                  value={memberNationalityFilter} 
                  onChange={e => setMemberNationalityFilter(e.target.value)} 
                  className="border rounded px-3 py-2"
                >
                  {memberNationalities.map(nationality => (
                    <option key={nationality} value={nationality}>
                      {nationality === 'ALL' ? 'All Nationalities' : nationality}
                    </option>
                  ))}
                </select>
                <select 
                  value={memberSortKey} 
                  onChange={e => setMemberSortKey(e.target.value)} 
                  className="border rounded px-3 py-2"
                >
                  <option value="name">Sort: Name</option>
                  <option value="email">Sort: Email</option>
                  <option value="country">Sort: Country</option>
                  <option value="joinedCount">Sort: Events Joined</option>
                </select>
                <select 
                  value={memberPageSize} 
                  onChange={e => {
                    setMemberPageSize(Number(e.target.value));
                    setMemberCurrentPage(1);
                  }} 
                  className="border rounded px-3 py-2"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
            {loading ? (
              <p className="text-center text-gray-500">Loading members...</p>
            ) : isMobile ? (
              // Mobile Card View for Members
              <div className="space-y-4">
                {paginatedMembers.map(member => (
                  <div key={member.id} onClick={() => setSelectedUser(member)} className="bg-gray-50 p-4 rounded-lg border cursor-pointer hover:bg-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.membership || member.branch || 'No membership'}</p>
                        <p className="text-xs text-gray-500">Joined: {member.joinedCount ?? 0}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteMembership(member.id, branchFilter); 
                      }} 
                      className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600"
                    >
                      Delete Membership
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View for Members
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Country</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Membership</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Events Joined</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedMembers.map(member => (
                            <tr key={member.id} onClick={() => setSelectedUser(member)} className="cursor-pointer hover:bg-gray-50">
                                <td className="px-4 py-2">{member.name}</td>
                                <td className="px-4 py-2">{member.email}</td>
                                <td className="px-4 py-2">{member.country || 'N/A'}</td>
                                <td className="px-4 py-2">{member.membership || member.branch || 'No membership'}</td>
                                <td className="px-4 py-2 text-xs text-gray-500">{member.joinedCount ?? 0}</td>
                                <td className="px-4 py-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteMembership(member.id, branchFilter); }} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600">Delete Membership</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            )}
            
            {/* 페이지네이션 */}
            {memberTotalPages > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setMemberCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={memberCurrentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {memberCurrentPage} of {memberTotalPages} ({filteredMembers.length} total members)
                </span>
                
                <button
                  onClick={() => setMemberCurrentPage(prev => Math.min(memberTotalPages, prev + 1))}
                  disabled={memberCurrentPage === memberTotalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        {activeTab === 'accounting' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-green-100 p-4 sm:p-6 rounded-lg"><h3 className="text-lg font-semibold text-green-800">Total Revenue</h3><p className="text-2xl sm:text-3xl font-bold">{totalRevenue.toLocaleString()} NTD</p></div>
              <div className="bg-red-100 p-4 sm:p-6 rounded-lg"><h3 className="text-lg font-semibold text-red-800">Total Expenses</h3><p className="text-2xl sm:text-3xl font-bold">{totalExpenses.toLocaleString()} NTD</p></div>
              <div className="bg-blue-100 p-4 sm:p-6 rounded-lg"><h3 className="text-lg font-semibold text-blue-800">Net Profit</h3><p className="text-2xl sm:text-3xl font-bold">{netProfit.toLocaleString()} NTD</p></div>
            </div>

            {/* 통합 트랜잭션 목록 + Add New Transaction + Net Total */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">All Transactions for {branchFilter}</h2>
              {isMobile ? (
                // Mobile Card View for Transactions
                <div className="space-y-4">
                  {combinedTransactions.map(tx => (
                    <div key={tx.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {tx.type === 'expense' ? 'Expense' : 'Revenue'}
                        </span>
                        <span className="text-sm font-bold">{Number(tx.amount).toLocaleString()} NTD</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Date:</strong> {tx.date}</p>
                        <p><strong>Item:</strong> {tx.item}</p>
                        {tx.eventTitle && <p><strong>Event:</strong> {tx.eventTitle}</p>}
                        <p><strong>Submitted by:</strong> {tx.submittedBy || 'System'}</p>
                        {tx.type === 'expense' && (
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {tx.status}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          {tx.receiptUrl ? (
                            <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open Receipt</a>
                          ) : tx.receiptDataUrl ? (
                            <button onClick={() => setViewReceiptUrl(tx.receiptDataUrl)} className="text-xs text-blue-600 hover:underline">Preview Receipt</button>
                          ) : (
                            <span className="text-xs text-gray-400">No Receipt</span>
                          )}
                        </div>
                        {tx.type === 'expense' && tx.status === 'Pending' && (
                          <button onClick={() => handleMarkExpensePaid(tx.id)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Mark as Paid</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table View for Transactions
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Type</th>
                        <th className="text-left">Date</th>
                        <th className="text-left">Item</th>
                        <th className="text-left">Event</th>
                        <th className="text-left">Amount</th>
                        <th className="text-left">Receipt</th>
                        <th className="text-left">Submitted By</th>
                        <th className="text-left">Status</th>
                        <th className="text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedTransactions.map(tx => (
                        <tr key={tx.id}>
                          <td>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {tx.type === 'expense' ? 'Expense' : 'Revenue'}
                            </span>
                          </td>
                          <td>{tx.date}</td>
                          <td>{tx.item}</td>
                          <td>{tx.eventTitle || '—'}</td>
                          <td>{Number(tx.amount).toLocaleString()} NTD</td>
                          <td>
                            {tx.receiptUrl ? (
                              <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Open</a>
                            ) : tx.receiptDataUrl ? (
                              <button onClick={() => setViewReceiptUrl(tx.receiptDataUrl)} className="text-xs text-blue-600 hover:underline">Preview</button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td>{tx.submittedBy || 'System'}</td>
                          <td>
                            {tx.type === 'expense' ? (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {tx.status}
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700">Confirmed</span>
                            )}
                          </td>
                          <td>
                            {tx.type === 'expense' && tx.status === 'Pending' && (
                              <button onClick={() => handleMarkExpensePaid(tx.id)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Mark as Paid</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-600 mr-2">Net Total:</span>
                <span className={`text-lg font-bold ${combinedTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? -Number(t.amount || 0) : Number(t.amount || 0)), 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {combinedTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? -Number(t.amount || 0) : Number(t.amount || 0)), 0).toLocaleString()} NTD
                </span>
              </div>
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold">Add New Transaction</h3>
                <form onSubmit={handleAddTransaction} className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2 items-end">
                  <select value={newTx.type} onChange={e => setNewTx(v => ({ ...v, type: e.target.value }))} className="p-2 border rounded">
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input type="date" value={newTx.date} onChange={e => setNewTx(v => ({ ...v, date: e.target.value }))} className="p-2 border rounded"/>
                  <input type="text" placeholder="Event Name" value={newTx.eventTitle} onChange={e => setNewTx(v => ({ ...v, eventTitle: e.target.value }))} className="p-2 border rounded w-full sm:w-64"/>
                  <input type="text" placeholder="Item" value={newTx.item} onChange={e => setNewTx(v => ({ ...v, item: e.target.value }))} className="p-2 border rounded flex-grow"/>
                  <input type="number" min="0" placeholder="Amount" value={newTx.amount} onChange={e => setNewTx(v => ({ ...v, amount: e.target.value }))} className="p-2 border rounded w-full sm:w-32"/>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm text-gray-600">Receipt (≤1MB):</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1024 * 1024) {
                          alert('Receipt size must be 1MB or less.');
                          e.target.value = '';
                          return;
                        }
                        const form = new FormData();
                        form.append('file', file);
                        axios.post('/api/admin/receipts/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
                          .then(res => {
                            const url = res?.data?.url;
                            if (url) {
                              setNewTx(prev => ({ ...prev, receiptUrl: url, receiptDataUrl: '' }));
                              setReceiptPreviewUrl('');
                              alert('Receipt uploaded.');
                            } else {
                              alert('Upload response invalid.');
                            }
                          })
                          .catch(err => {
                            console.error(err);
                            alert('Failed to upload receipt.');
                          });
                      }}
                      className="text-sm"
                    />
                  </div>
                  {receiptPreviewUrl && (
                    <button type="button" onClick={() => setViewReceiptUrl(receiptPreviewUrl)} className="text-xs text-blue-600 underline">
                      Preview
                    </button>
                  )}
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                </form>
              </div>
            </div>

            {/* Expenses/Revenue sections removed to avoid duplication */}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
