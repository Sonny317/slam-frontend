// src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- 가짜 데이터 (나중에 이 모든 데이터를 백엔드 API로부터 받아옵니다) ---
const mockApplications = [
  { id: 101, name: 'Peter Pan', email: 'peter@example.com', branch: 'TAIPEI', paymentMethod: 'transfer', bankLast5: '12345', amount: 900 },
  { id: 102, name: 'Alice Wonderland', email: 'alice@example.com', branch: 'NCCU', paymentMethod: 'cash', amount: 800 },
  { id: 103, name: 'Tom Sawyer', email: 'tom@example.com', branch: 'NTU', paymentMethod: 'transfer', bankLast5: '54321', amount: 800 },
];

const mockEvents = [
    { id: 1, title: "SLAM TAIPEI: 1st Pilot Event", rsvps: 75, checkedIn: 12 },
    { id: 2, title: "NCCU Welcome Back Party", rsvps: 68, checkedIn: 0 },
    { id: 3, title: "NTU Language Exchange Night", rsvps: 55, checkedIn: 0 },
];
// --------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]);

  const handleApprove = (applicationId) => {
    // TODO: 백엔드 API 호출 (POST /api/admin/applications/:applicationId/approve)
    alert(`Approving application ID: ${applicationId}. (This is a demo)`);
    // 성공했다고 가정하고, 목록에서 해당 신청자를 제거합니다.
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  // 총 매출 계산
  const totalRevenue = applications.reduce((sum, app) => sum + app.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link to="/admin/scanner" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Go to QR Scanner
          </Link>
        </div>

        {/* 1. 멤버십 승인 관리 */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Membership Approvals</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-blue-800">
            <p><span className="font-bold">{applications.length}</span> applications are pending approval.</p>
            <p>Current Pending Revenue: <span className="font-bold">{totalRevenue} NTD</span></p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'} - {app.amount} NTD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleApprove(app.id)}
                        className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 이벤트별 참석자 현황 */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Event Attendee Status</h2>
          <div className="mb-4">
            <label htmlFor="event-select" className="block text-sm font-medium text-gray-700">Select an Event:</label>
            <select 
              id="event-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              onChange={(e) => setSelectedEvent(mockEvents.find(event => event.id === parseInt(e.target.value)))}
            >
              {mockEvents.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          {selectedEvent && (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
              <p className="text-5xl font-black">
                <span className="text-green-500">{selectedEvent.checkedIn}</span>
                <span className="text-3xl text-gray-400"> / {selectedEvent.rsvps}</span>
              </p>
              <p className="text-gray-500">Checked-in / Total RSVPs</p>
              <button className="mt-4 text-sm text-blue-600 hover:underline">View Full Attendee List</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
