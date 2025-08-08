// src/pages/AdminMemberManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

// --- 가짜 데이터 (나중에 이 모든 데이터를 백엔드 API로부터 받아옵니다) ---
const loggedInStaff = { name: 'Alice', role: 'PRESIDENT', branch: 'NCCU' }; // 'PRESIDENT', 'All'로 바꿔서 테스트해보세요.

const mockExpenses = {
    NCCU: [ { id: 1, date: '2025-07-25', item: 'BBQ Party Supplies', amount: 3500, submittedBy: 'Alice', status: 'Pending' } ],
    TAIPEI: [ { id: 2, date: '2025-07-26', item: 'Venue Rental Deposit', amount: 2000, submittedBy: 'Peter', status: 'Reimbursed' } ],
    NTU: [ { id: 3, date: '2025-07-27', item: 'Scavenger Hunt Prizes', amount: 1500, submittedBy: 'Diana', status: 'Pending' } ],
};
// --------------------------------------------------------------------

// --- 상세 정보 팝업(Modal) 컴포넌트 ---
const DetailModal = ({ user, onClose, onDeleteMembership }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{user?.name || user?.userName || 'Unknown User'}</h2>
            <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {user?.email || user?.userEmail || 'N/A'}</p>
                <p><strong>Branch:</strong> {user?.branch || user?.selectedBranch || 'N/A'}</p>
                {user?.studentId && <p><strong>Student ID:</strong> {user.studentId}</p>}
                {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                {user?.major && <p><strong>Major:</strong> {user.major}</p>}
                {user?.professionalStatus && <p><strong>Status:</strong> {user.professionalStatus}</p>}
                {user?.country && <p><strong>Country:</strong> {user.country}</p>}
                {user?.paymentMethod && <p><strong>Payment:</strong> {user.paymentMethod === 'transfer' ? `Transfer (${user.bankLast5})` : 'Cash'} - {user.amount} NTD</p>}
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

  const availableBranches = loggedInStaff.role === 'PRESIDENT' ? ['NCCU', 'NTU', 'TAIPEI'] : [loggedInStaff.branch];

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
          setMembers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, branchFilter]);

  const filteredApplications = applications.filter(app => app.selectedBranch === branchFilter);
  const filteredMembers = Array.isArray(members) ? members : [];
  const filteredExpenses = mockExpenses[branchFilter] || [];
  
  const totalRevenue = 95000; // 예시 총 수입 (나중에 지부별로 필터링 필요)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

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



  // ✅ 신청서 승인/거부 함수
  const handleApproveApplication = async (applicationId) => {
    try {
      await axios.post(`/api/admin/applications/approve?applicationId=${applicationId}`);
      alert('Application approved successfully');
      // 목록 새로고침
      const response = await axios.get('/api/admin/membership-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application: ' + error.response?.data || error.message);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      await axios.post(`/api/admin/applications/reject?applicationId=${applicationId}`);
      alert('Application rejected successfully');
      // 목록 새로고침
      const response = await axios.get('/api/admin/membership-applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application: ' + error.response?.data || error.message);
    }
  };

  return (
    <div>
      {selectedUser && <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onDeleteMembership={handleDeleteMembership} />}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Member Management</h1>
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
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('approvals')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'approvals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Pending Approvals</button>
          <button onClick={() => {
            console.log('All Members tab clicked');
            setActiveTab('all_members');
          }} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'all_members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>All Members</button>
          <button onClick={() => setActiveTab('accounting')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'accounting' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Accounting</button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'approvals' && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals for {branchFilter} ({filteredApplications.length})</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading applications...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th></tr></thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map(app => (
                          <tr key={app.id} onClick={() => setSelectedUser(app)} className="cursor-pointer hover:bg-gray-50">
                              <td className="px-4 py-2">{app.userName || 'Unknown'}</td>
                              <td className="px-4 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{app.status}</span></td>
                              <td className="px-4 py-2">{app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'}</td>
                              <td className="px-4 py-2">
                                <button onClick={(e) => { e.stopPropagation(); handleApproveApplication(app.id); }} className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600 mr-2">Approve</button>
                                <button onClick={(e) => { e.stopPropagation(); handleRejectApplication(app.id); }} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600">Reject</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'all_members' && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Active Members in {branchFilter} ({filteredMembers.length})</h2>
            </div>
            {loading ? (
              <p className="text-center text-gray-500">Loading members...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Membership</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Joined</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map(member => (
                          <tr key={member.id} onClick={() => setSelectedUser(member)} className="cursor-pointer hover:bg-gray-50">
                              <td className="px-4 py-2">{member.name}</td>
                              <td className="px-4 py-2">{member.email}</td>
                              <td className="px-4 py-2">{member.membership || 'No membership'}</td>
                              <td className="px-4 py-2 text-xs text-gray-500">{member.id}</td>
                              <td className="px-4 py-2">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMembership(member.id, branchFilter); }} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-red-600">Delete Membership</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'accounting' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg"><h3 className="text-lg font-semibold text-green-800">Total Revenue</h3><p className="text-3xl font-bold">{totalRevenue.toLocaleString()} NTD</p></div>
                <div className="bg-red-100 p-6 rounded-lg"><h3 className="text-lg font-semibold text-red-800">Total Expenses</h3><p className="text-3xl font-bold">{totalExpenses.toLocaleString()} NTD</p></div>
                <div className="bg-blue-100 p-6 rounded-lg"><h3 className="text-lg font-semibold text-blue-800">Net Profit</h3><p className="text-3xl font-bold">{netProfit.toLocaleString()} NTD</p></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Reimbursement Requests for {branchFilter}</h2>
                <table className="min-w-full">
                    <thead><tr><th className="text-left">Date</th><th className="text-left">Item</th><th className="text-left">Amount</th><th className="text-left">Submitted By</th><th className="text-left">Receipt</th><th className="text-left">Status</th><th className="text-left">Action</th></tr></thead>
                    <tbody>
                        {filteredExpenses.map(exp => (
                            <tr key={exp.id}>
                                <td>{exp.date}</td><td>{exp.item}</td><td>{exp.amount.toLocaleString()} NTD</td><td>{exp.submittedBy}</td>
                                <td><a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a></td>
                                <td><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exp.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{exp.status}</span></td>
                                <td>{exp.status === 'Pending' && <button onClick={() => alert(`Marking expense ID ${exp.id} as paid.`)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Mark as Paid</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold">Add New Expense</h3>
                    <form className="flex flex-wrap gap-4 mt-2 items-end">
                        <input type="date" className="p-2 border rounded"/>
                        <input type="text" placeholder="Item" className="p-2 border rounded flex-grow"/>
                        <input type="number" placeholder="Amount" className="p-2 border rounded"/>
                        <div><label className="block text-xs">Receipt (max 2MB):</label><input type="file" className="text-sm"/></div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
                    </form>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
