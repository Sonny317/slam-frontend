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
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [attendeeSortField, setAttendeeSortField] = useState('name');
  const [attendeeSortOrder, setAttendeeSortOrder] = useState('asc');
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [eventDetailsData, setEventDetailsData] = useState(null);
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
        
        // 이벤트 목록 가져오기 (upcoming events only)
        const eventsResponse = await axios.get('/api/admin/events');
        const now = new Date();
        const upcomingEvents = eventsResponse.data.filter(event => new Date(event.eventDateTime) >= now);
        setEvents(upcomingEvents);
        if (upcomingEvents.length > 0) {
          setSelectedEvent(upcomingEvents[0]);
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

  // ✅ 참석자 정렬 함수
  const sortAttendees = (attendees, field, order) => {
    return [...attendees].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (field === 'afterParty') {
        aValue = a.afterParty ? 1 : 0;
        bValue = b.afterParty ? 1 : 0;
      } else if (field === 'rsvpDate') {
        aValue = new Date(a.rsvpDate);
        bValue = new Date(b.rsvpDate);
      } else {
        aValue = aValue ? aValue.toString().toLowerCase() : '';
        bValue = bValue ? bValue.toString().toLowerCase() : '';
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // ✅ CSV 내보내기 함수
  const exportAttendeesToCSV = () => {
    const csvData = [
      ['Name', 'Email', 'Membership', 'After Party', 'RSVP Date'],
      ...attendees.map(attendee => [
        attendee.name || 'N/A',
        attendee.email || 'N/A',
        attendee.membership || 'N/A',
        attendee.afterParty ? 'Yes' : 'No',
        attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : 'N/A'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent?.title || 'event'}_attendees.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ 멤버 정보 보기 함수
  const handleViewMemberInfo = async (attendee) => {
    try {
      // You might want to fetch additional user info here
      setSelectedMember(attendee);
      setShowMemberModal(true);
    } catch (error) {
      console.error('Failed to fetch member info:', error);
    }
  };

  // ✅ 정렬 핸들러
  const handleSort = (field) => {
    const newOrder = attendeeSortField === field && attendeeSortOrder === 'asc' ? 'desc' : 'asc';
    setAttendeeSortField(field);
    setAttendeeSortOrder(newOrder);
  };

  // ✅ 이벤트 상세 정보 보기 (AdminEventsPage와 동일한 로직)
  const handleViewEventDetails = async (event) => {
    try {
      // 이벤트 기본 정보
      const eventDetails = {
        ...event,
        attendanceRate: event.capacity > 0 ? ((eventStats?.attendingCount || 0) / event.capacity * 100).toFixed(1) : 0
      };

      // RSVP 정보 가져오기 (참석자 및 After Party)
      try {
        const rsvpResponse = await axios.get(`/api/events/${event.id}/rsvp-summary`);
        eventDetails.rsvpData = rsvpResponse.data;
      } catch (error) {
        console.warn('Failed to fetch RSVP data:', error);
        eventDetails.rsvpData = {
          totalAttending: eventStats?.attendingCount || 0,
          afterPartyCount: eventStats?.afterPartyCount || 0,
          attendees: attendees || []
        };
      }

      // Feedback 정보 가져오기
      try {
        const feedbackResponse = await axios.get(`/api/feedback/event/${event.id}/summary`);
        eventDetails.feedbackData = feedbackResponse.data;
      } catch (error) {
        console.warn('Failed to fetch feedback data:', error);
        eventDetails.feedbackData = {
          count: 0,
          overallAvg: 0,
          npsAvg: 0
        };
      }

      setEventDetailsData(eventDetails);
      setShowEventDetailsModal(true);
    } catch (error) {
      alert('Failed to load event details: ' + (error.response?.data?.message || error.message));
    }
  };

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
                  {/* Enhanced Capacity Table */}
                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">Registration & Capacity Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Capacity Table */}
                      <div>
                        <table className="min-w-full border border-gray-300 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">Type</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">Count</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">Total Registered</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-blue-600">{eventStats.totalRsvps || 0}</td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.capacity > 0 ? Math.round((eventStats.totalRsvps || 0) / eventStats.capacity * 100) : 0}%
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">Will Attend</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-green-600">{eventStats.attendingCount}</td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.capacity > 0 ? Math.round(eventStats.attendingCount / eventStats.capacity * 100) : 0}%
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">Won't Attend</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-red-500">{eventStats.notAttendingCount || 0}</td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.capacity > 0 ? Math.round((eventStats.notAttendingCount || 0) / eventStats.capacity * 100) : 0}%
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-3 py-2 text-sm font-bold text-gray-900">Max Capacity</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-gray-800">{eventStats.capacity}</td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">100%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {/* After Party Stats */}
                      <div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{eventStats.afterPartyCount}</p>
                            <p className="text-sm text-purple-700">After Party</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {eventStats.attendingCount > 0 ? 
                                Math.round(eventStats.afterPartyCount / eventStats.attendingCount * 100) : 0}% of attendees
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Availability:</span>
                            <span className={`font-medium ${
                              eventStats.capacity - eventStats.attendingCount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {eventStats.capacity - eventStats.attendingCount} spots left
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Fill Rate:</span>
                            <span className="font-medium text-blue-600">
                              {eventStats.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                    <button 
                      onClick={() => handleViewAttendees(selectedEvent.id)}
                      disabled={loadingAttendees}
                      className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                    >
                      {loadingAttendees ? 'Loading...' : '👥 View Full Attendee List'}
                    </button>
                    <button 
                      onClick={() => handleViewEventDetails(selectedEvent)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      📊 View Event Details
                    </button>
                  </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Attendee List - {selectedEvent?.title}</h2>
                  <p className="text-sm text-gray-600">{attendees.length} attendees</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={exportAttendeesToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📊 Export CSV
                  </button>
                  <button 
                    onClick={() => setShowAttendees(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {attendees.length > 0 ? (
                isMobile ? (
                  // Mobile Card View for Attendees
                  <div className="space-y-4">
                    {sortAttendees(attendees, attendeeSortField, attendeeSortOrder).map((attendee, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-2">
                          <div>
                            <h3 
                              className="font-semibold text-blue-600 cursor-pointer hover:text-blue-800"
                              onClick={() => handleViewMemberInfo(attendee)}
                            >
                              {attendee.name}
                            </h3>
                            <p className="text-sm text-gray-600">{attendee.email}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{attendee.membership || 'N/A'}</span>
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                attendee.afterParty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                              onClick={() => handleSort('afterParty')}
                            >
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
                  <div>
                    {/* Sorting Controls */}
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Sort by:</span>
                      {[
                        { field: 'name', label: 'Name' },
                        { field: 'email', label: 'Email' },
                        { field: 'membership', label: 'Membership' },
                        { field: 'afterParty', label: 'After Party' },
                        { field: 'rsvpDate', label: 'RSVP Date' }
                      ].map(({ field, label }) => (
                        <button
                          key={field}
                          onClick={() => handleSort(field)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            attendeeSortField === field
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {label} {attendeeSortField === field && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      ))}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                              Name {attendeeSortField === 'name' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>
                              Email {attendeeSortField === 'email' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('membership')}>
                              Membership {attendeeSortField === 'membership' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('afterParty')}>
                              After Party {attendeeSortField === 'afterParty' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rsvpDate')}>
                              RSVP Date {attendeeSortField === 'rsvpDate' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortAttendees(attendees, attendeeSortField, attendeeSortOrder).map((attendee, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleViewMemberInfo(attendee)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  {attendee.name}
                                </button>
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

        {/* Member Info Modal */}
        {showMemberModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setShowMemberModal(false)}>
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Member Information</h3>
                <button 
                  onClick={() => setShowMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedMember.name || 'N/A'}</h4>
                    <p className="text-sm text-gray-600">{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Member ID:</span>
                    <span className="text-sm text-gray-900">{selectedMember.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Membership:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedMember.membership 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMember.membership || 'Non-member'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">After Party:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedMember.afterParty 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMember.afterParty ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">RSVP Date:</span>
                    <span className="text-sm text-gray-900">
                      {selectedMember.rsvpDate ? new Date(selectedMember.rsvpDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 flex justify-center">
                  <button 
                    onClick={() => setShowMemberModal(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal (similar to AdminEventsPage) */}
        {showEventDetailsModal && eventDetailsData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setShowEventDetailsModal(false)}>
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{eventDetailsData.title}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{eventDetailsData.branch}</span>
                      {eventDetailsData.theme && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">{eventDetailsData.theme}</span>
                      )}
                      <span>{new Date(eventDetailsData.eventDateTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowEventDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Event Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{eventDetailsData.capacity || 0}</div>
                    <div className="text-sm text-gray-600">Capacity</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{eventDetailsData.rsvpData?.totalAttending || eventStats?.attendingCount || 0}</div>
                    <div className="text-sm text-gray-600">Registered</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{eventDetailsData.rsvpData?.afterPartyCount || eventStats?.afterPartyCount || 0}</div>
                    <div className="text-sm text-gray-600">After Party</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">{eventDetailsData.attendanceRate}%</div>
                    <div className="text-sm text-gray-600">Show-up Rate</div>
                  </div>
                </div>

                {/* Feedback Summary */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Feedback Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">{eventDetailsData.feedbackData?.count || 0}</div>
                      <div className="text-sm text-gray-600">Total Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-500">
                        {eventDetailsData.feedbackData?.overallAvg ? Number(eventDetailsData.feedbackData.overallAvg).toFixed(1) : 'N/A'} ★
                      </div>
                      <div className="text-sm text-gray-600">Overall Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {eventDetailsData.feedbackData?.npsAvg ? Number(eventDetailsData.feedbackData.npsAvg).toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">NPS Score</div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Event Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Location:</strong> {eventDetailsData.location}</div>
                    <div><strong>Date & Time:</strong> {new Date(eventDetailsData.eventDateTime).toLocaleString()}</div>
                    {eventDetailsData.endTime && (
                      <div><strong>End Time:</strong> {eventDetailsData.endTime}</div>
                    )}
                    <div><strong>Price:</strong> {eventDetailsData.price ? `NT$${eventDetailsData.price}` : 'Free'}</div>
                    {eventDetailsData.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-gray-600 whitespace-pre-wrap">{eventDetailsData.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registered Attendees */}
                {eventDetailsData.rsvpData?.attendees && eventDetailsData.rsvpData.attendees.length > 0 && (
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="mr-2">👥</span>
                      Registered Attendees ({eventDetailsData.rsvpData.attendees.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {eventDetailsData.rsvpData.attendees.map((attendee, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm">{attendee.name || attendee.email}</span>
                            {attendee.afterParty && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                After Party
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                  <button 
                    onClick={() => handleViewAttendees(selectedEvent.id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    👥 View Full Attendee List
                  </button>
                  <button 
                    onClick={() => setShowEventDetailsModal(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}