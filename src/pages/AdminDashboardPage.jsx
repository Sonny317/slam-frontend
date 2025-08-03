import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext'; // ✅ UserContext를 임포트합니다.

const mockEvents = [
    { id: 1, title: "SLAM TAIPEI: 1st Pilot Event", rsvps: 75, checkedIn: 12 },
    { id: 2, title: "NCCU Welcome Back Party", rsvps: 68, checkedIn: 0 },
    { id: 3, title: "NTU Language Exchange Night", rsvps: 55, checkedIn: 0 },
];

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]);
  const { refetchUser } = useUser(); // ✅ Context에서 refetchUser 함수를 가져옵니다.

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/admin/membership-applications');
        setApplications(response.data.filter(app => app.status === 'payment_pending'));
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        alert("신청 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleApprove = async (applicationId, userName, branch) => {
    try {
      await axios.post(`/api/admin/applications/${applicationId}/approve`);
      alert(`${userName}'s application for ${branch} has been approved.`);
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      // ✅ 승인 성공 후, Context의 사용자 정보를 강제로 새로고침합니다.
      await refetchUser(); 

    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const totalRevenue = applications.reduce((sum, app) => sum + 900, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link to="/admin/scanner" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Go to QR Scanner
          </Link>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Membership Approvals</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-blue-800">
            <p><span className="font-bold">{applications.length}</span> applications are pending approval.</p>
            <p>Current Pending Revenue: <span className="font-bold">{totalRevenue} NTD</span></p>
          </div>
          <div className="overflow-x-auto">
            {loading ? <p>Loading applications...</p> : (
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
                    <td className="px-6 py-4 whitespace-nowrap">{app.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.selectedBranch}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleApprove(app.id, app.userName, app.selectedBranch)}
                        className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </section>

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