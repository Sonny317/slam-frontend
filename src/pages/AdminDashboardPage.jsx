import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext'; // ✅ UserContext를 임포트합니다.

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // const { refetchUser } = useUser(); // refetchUser 함수가 UserContext에 없으므로 주석 처리

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 멤버십 신청 목록 가져오기
        const applicationsResponse = await axios.get('/api/admin/membership-applications');
        setApplications(applicationsResponse.data.filter(app => app.status === 'payment_pending'));
        
        // 이벤트 목록 가져오기
        const eventsResponse = await axios.get('/api/admin/events');
        setEvents(eventsResponse.data);
        if (eventsResponse.data.length > 0) {
          setSelectedEvent(eventsResponse.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        alert(`데이터를 불러오는 데 실패했습니다.\n상태코드: ${error.response?.status}\n메시지: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (applicationId, userName, branch) => {
    try {
      await axios.post(`/api/admin/applications/approve?applicationId=${applicationId}`);
      alert(`${userName}'s application for ${branch} has been approved.`);
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      // ✅ 승인 성공 후, 신청 목록을 새로고침합니다.
      const response = await axios.get('/api/admin/membership-applications');
      setApplications(response.data.filter(app => app.status === 'payment_pending'));

    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 이벤트 선택 시 통계 가져오기
  const handleEventSelect = async (eventId) => {
    if (!eventId) return;
    
    setLoadingStats(true);
    try {
      const response = await axios.get(`/api/admin/events/attendance-stats?eventId=${eventId}`);
      setEventStats(response.data);
    } catch (error) {
      console.error("Failed to fetch event stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ 참석자 목록 가져오기
  const handleViewAttendees = async (eventId) => {
    if (!eventId) return;
    
    setLoadingAttendees(true);
    try {
      const response = await axios.get(`/api/admin/events/attendees?eventId=${eventId}`);
      setAttendees(response.data);
      setShowAttendees(true);
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
      alert("참석자 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoadingAttendees(false);
    }
  };

  const totalRevenue = applications.reduce((sum, app) => sum + 900, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <Link to="/admin/scanner" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Go to QR Scanner
          </Link>
        </div>

        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Membership Approvals</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-blue-800">
            <p><span className="font-bold">{applications.length}</span> applications are pending approval.</p>
            <p>Current Pending Revenue: <span className="font-bold">{totalRevenue} NTD</span></p>
          </div>
          {loading ? (
            <p>Loading applications...</p>
          ) : isMobile ? (
            // Mobile Card View for Applications
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{app.userName}</h3>
                      <p className="text-sm text-gray-600">{app.selectedBranch}</p>
                      <p className="text-sm text-gray-500">
                        {app.paymentMethod === 'transfer' ? `Transfer (${app.bankLast5})` : 'Cash'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApprove(app.id, app.userName, app.selectedBranch)}
                    className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-green-600"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View for Applications
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
            </div>
          )}
        </section>

        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Event Attendee Status</h2>
          <div className="mb-4">
            <label htmlFor="event-select" className="block text-sm font-medium text-gray-700">Select an Event:</label>
            <select 
              id="event-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              onChange={(e) => {
                const event = events.find(event => event.id === parseInt(e.target.value));
                setSelectedEvent(event);
                if (event) {
                  handleEventSelect(event.id);
                }
              }}
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          {selectedEvent && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{selectedEvent.title}</h3>
              {loadingStats ? (
                <p className="text-gray-500">Loading stats...</p>
              ) : eventStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{eventStats.attendingCount}</p>
                      <p className="text-sm text-green-700">Attending</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{eventStats.afterPartyCount}</p>
                      <p className="text-sm text-blue-700">After Party</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Capacity: {eventStats.attendingCount}/{eventStats.capacity} ({eventStats.attendanceRate.toFixed(1)}%)
                  </p>
                  <button 
                    onClick={() => handleViewAttendees(selectedEvent.id)}
                    disabled={loadingAttendees}
                    className="mt-4 text-sm text-blue-600 hover:underline disabled:text-gray-400"
                  >
                    {loadingAttendees ? 'Loading...' : 'View Full Attendee List'}
                  </button>
                </>
              ) : (
                <p className="text-gray-500">Select an event to view stats</p>
              )}
            </div>
          )}
        </section>

        {/* 참석자 목록 모달 */}
        {showAttendees && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">Attendee List - {selectedEvent?.title}</h2>
                <button 
                  onClick={() => setShowAttendees(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {attendees.length > 0 ? (
                isMobile ? (
                  // Mobile Card View for Attendees
                  <div className="space-y-4">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                            <p className="text-sm text-gray-600">{attendee.email}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{attendee.membership || 'N/A'}</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              attendee.afterParty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {attendee.afterParty ? 'After Party: Yes' : 'After Party: No'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            RSVP: {attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop Table View for Attendees
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After Party</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSVP Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendees.map((attendee, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {attendee.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendee.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendee.membership || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendee.afterParty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {attendee.afterParty ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <p className="text-center text-gray-500 py-8">No attendees found for this event.</p>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowAttendees(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}