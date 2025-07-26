// src/pages/AdminMemberManagementPage.jsx
import React, { useState } from 'react';

// --- 가짜 데이터 (나중에 이 모든 데이터를 백엔드 API로부터 받아옵니다) ---
const loggedInStaff = { name: 'Alice', role: 'PRESIDENT', branch: 'NCCU' }; // 'PRESIDENT', 'All'로 바꿔서 테스트해보세요.

const mockApplications = [
  { id: 102, name: 'Alice Wonderland', email: 'alice@example.com', branch: 'NCCU', paymentMethod: 'cash', amount: 800, studentId: '111222333', country: 'USA', major: 'Commerce' },
  { id: 103, name: 'Charlie Brown', email: 'charlie@example.com', branch: 'NCCU', paymentMethod: 'transfer', bankLast5: '54321', amount: 800, studentId: '444555666', country: 'Taiwan', major: 'Law' },
  { id: 101, name: 'Peter Pan', email: 'peter@example.com', branch: 'TAIPEI', paymentMethod: 'transfer', bankLast5: '12345', amount: 900, phone: '0912-345-678', professionalStatus: 'Local Professional' },
  { id: 104, name: 'Wendy Darling', email: 'wendy@example.com', branch: 'NTU', paymentMethod: 'cash', amount: 800, studentId: '777888999', country: 'UK', major: 'Foreign Languages' },
];

const mockMembers = [
    { id: 1, name: 'Sonny', email: 'sonny@example.com', branch: 'NCCU', studentId: '123456789', rsvpStatus: 'Attending' },
    { id: 2, name: 'Michael', email: 'michael@example.com', branch: 'TAIPEI', phone: '0987-654-321', rsvpStatus: 'Not Responded' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', branch: 'NTU', studentId: '987654321', rsvpStatus: 'Declined' },
];

const mockExpenses = {
    NCCU: [ { id: 1, date: '2025-07-25', item: 'BBQ Party Supplies', amount: 3500, submittedBy: 'Alice', status: 'Pending' } ],
    TAIPEI: [ { id: 2, date: '2025-07-26', item: 'Venue Rental Deposit', amount: 2000, submittedBy: 'Peter', status: 'Reimbursed' } ],
    NTU: [ { id: 3, date: '2025-07-27', item: 'Scavenger Hunt Prizes', amount: 1500, submittedBy: 'Diana', status: 'Pending' } ],
};
// --------------------------------------------------------------------

// --- 상세 정보 팝업(Modal) 컴포넌트 ---
const DetailModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{user.name}</h2>
            <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Branch:</strong> {user.branch}</p>
                {user.studentId && <p><strong>Student ID:</strong> {user.studentId}</p>}
                {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                {user.major && <p><strong>Major:</strong> {user.major}</p>}
                {user.professionalStatus && <p><strong>Status:</strong> {user.professionalStatus}</p>}
                {user.country && <p><strong>Country:</strong> {user.country}</p>}
                {user.paymentMethod && <p><strong>Payment:</strong> {user.paymentMethod === 'transfer' ? `Transfer (${user.bankLast5})` : 'Cash'} - {user.amount} NTD</p>}
            </div>
            <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
        </div>
    </div>
);


export default function AdminMemberManagementPage() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [branchFilter, setBranchFilter] = useState(loggedInStaff.branch === 'All' ? 'NCCU' : loggedInStaff.branch);
  const [selectedUser, setSelectedUser] = useState(null); // 모달에 보여줄 사용자 정보

  const availableBranches = loggedInStaff.role === 'PRESIDENT' ? ['NCCU', 'NTU', 'TAIPEI'] : [loggedInStaff.branch];

  const filteredApplications = mockApplications.filter(app => app.branch === branchFilter);
  const filteredMembers = mockMembers.filter(member => member.branch === branchFilter);
  const filteredExpenses = mockExpenses[branchFilter] || [];
  
  const totalRevenue = 95000; // 예시 총 수입 (나중에 지부별로 필터링 필요)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div>
      {selectedUser && <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Member Management</h1>
      <p className="text-gray-500 mb-8">Manage applications, view member lists, and track finances for each branch.</p>

      {loggedInStaff.role === 'PRESIDENT' && (
        <div className="mb-6">
          <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700">Viewing Branch:</label>
          <select id="branch-filter" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
            className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
            {availableBranches.map(branch => <option key={branch}>{branch}</option>)}
          </select>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('approvals')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'approvals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Pending Approvals</button>
          <button onClick={() => setActiveTab('all_members')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'all_members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>All Members</button>
          <button onClick={() => setActiveTab('accounting')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'accounting' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Accounting</button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'approvals' && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals for {branchFilter} ({filteredApplications.length})</h2>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map(app => (
                        <tr key={app.id} onClick={() => setSelectedUser(app)} className="cursor-pointer hover:bg-gray-50">
                            <td className="px-4 py-2">{app.name}</td>
                            <td className="px-4 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span></td>
                            <td className="px-4 py-2">{app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'} - {app.amount} NTD</td>
                            <td className="px-4 py-2"><button onClick={(e) => { e.stopPropagation(); alert(`Approving ${app.name}...`); }} className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600">Approve</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
        {activeTab === 'all_members' && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">All Active Members in {branchFilter} ({filteredMembers.length})</h2>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Contact</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Next Event RSVP</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map(member => (
                        <tr key={member.id} onClick={() => setSelectedUser(member)} className="cursor-pointer hover:bg-gray-50">
                            <td className="px-4 py-2">{member.name}</td>
                            <td className="px-4 py-2">{member.studentId || member.phone}</td>
                            <td className="px-4 py-2"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.rsvpStatus === 'Attending' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.rsvpStatus}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
