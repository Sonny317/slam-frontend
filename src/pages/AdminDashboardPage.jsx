import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext'; // ✅ UserContext를 임포트합니다.

export default function AdminDashboardPage() {
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
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
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

  // ✅ 이벤트 선택 시 통계 가져오기
  const handleEventSelect = useCallback(async (eventId) => {
    if (!eventId) return;
    
    console.log("🔍 handleEventSelect called with eventId:", eventId);
    setLoadingStats(true);
    try {
      console.log("📡 Fetching stats for eventId:", eventId);
      
      // 선택된 이벤트에서 지부 정보 가져오기
      const selectedEventData = events.find(event => event.id === eventId);
      const branch = selectedEventData?.branch;
      const capacity = selectedEventData?.capacity || 0;
      
      if (!branch) {
        console.error("❌ No branch found for event:", selectedEventData);
        return;
      }
      
      // 병렬로 데이터 가져오기
      const [attendeesResponse, membersResponse] = await Promise.all([
        axios.get(`/api/admin/events/attendees?eventId=${eventId}`),
        axios.get(`/api/admin/users/branch?branchName=${branch}`)
      ]);
      
      console.log("👥 Attendees response:", attendeesResponse.data);
      console.log("👥 Members response:", membersResponse.data);
      
      const attendees = attendeesResponse.data || [];
      const totalMembers = membersResponse.data?.length || 0; // 해당 지부의 전체 멤버 수
      
      // 🔍 디버깅: 실제 데이터 구조 확인
      console.log("🔍 Sample attendee data:", attendees[0]);
      console.log("🔍 All attendees attending values:", attendees.map(a => ({ 
        name: a.name, 
        attending: a.attending, 
        attendingType: typeof a.attending,
        attendingValue: a.attending === true ? 'TRUE' : a.attending === false ? 'FALSE' : 'OTHER'
      })));
      
      // RSVP 통계 계산 - 백엔드 수정 후 정상 작동
      const attendingCount = attendees.filter(attendee => attendee.attending === true).length; // "Count me in" 누른 사람들
      const notAttendingCount = attendees.filter(attendee => attendee.attending === false).length; // "Maybe next time" 누른 사람들
      const afterPartyCount = attendees.filter(attendee => attendee.afterParty === true).length; // After Party 참석자
      
      // No RSVP 계산: 전체 멤버 수 - (참석자 + 비참석자)
      const noRsvpCount = totalMembers - (attendingCount + notAttendingCount);
      
      // 국제/로컬 비율 계산 (Will Attend 멤버들만 기준)
      const attendingMembers = attendees.filter(attendee => attendee.attending === true);
      const localAttendingCount = attendingMembers.filter(attendee => {
        // Event management 페이지와 동일한 로직 적용
        const displayNationality = attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality;
        return displayNationality === 'Taiwan';
      }).length || 0;
      
      const internationalAttendingCount = attendingCount - localAttendingCount;
      const localIntAttendingRatio = attendingCount > 0 ? 
        `${Math.round((localAttendingCount / attendingCount) * 100)}:${Math.round((internationalAttendingCount / attendingCount) * 100)}` : 
        '0:0';
      
      const stats = {
        eventId: eventId,
        eventTitle: selectedEventData?.title || '',
        totalRsvps: totalMembers, // 해당 지부의 전체 멤버 수 (Total Registered)
        attendingCount: attendingCount, // "Count me in" 누른 사람들
        notAttendingCount: notAttendingCount, // "Maybe next time" 누른 사람들
        noRsvpCount: noRsvpCount, // RSVP하지 않은 멤버들
        afterPartyCount: afterPartyCount,
        capacity: capacity,
        attendanceRate: capacity > 0 ? (attendingCount / capacity * 100) : 0,
        localAttendingCount: localAttendingCount,
        internationalAttendingCount: internationalAttendingCount,
        localIntAttendingRatio: localIntAttendingRatio
      };
      
      console.log("📊 Calculated stats:", stats);
      setEventStats(stats);
    } catch (error) {
      console.error("❌ Failed to fetch event stats:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoadingStats(false);
    }
  }, [events]);

  // ✅ 선택된 이벤트가 변경될 때 통계 가져오기
  useEffect(() => {
    if (selectedEvent && selectedEvent.id) {
      handleEventSelect(selectedEvent.id);
    }
  }, [selectedEvent, handleEventSelect]);


  // ✅ 참석자 목록 가져오기 (전체 멤버 + RSVP 정보)
  const handleViewAttendees = async (eventId) => {
    if (!eventId) return;
    
    setLoadingAttendees(true);
    try {
      // 선택된 이벤트에서 지부 정보 가져오기
      const selectedEventData = events.find(event => event.id === eventId);
      const branch = selectedEventData?.branch;
      
      if (!branch) {
        console.error("❌ No branch found for event:", selectedEventData);
        return;
      }
      
      // 병렬로 데이터 가져오기
      const [attendeesResponse, membersResponse] = await Promise.all([
        axios.get(`/api/admin/events/attendees?eventId=${eventId}`),
        axios.get(`/api/admin/users/branch?branchName=${branch}`)
      ]);
      
      const currentAttendees = attendeesResponse.data || [];
      const allMembers = membersResponse.data || [];
      
      // 전체 멤버에 RSVP 정보 추가
      const allMembersWithRsvp = allMembers.map(member => {
        const rsvp = currentAttendees.find(a => a.id === member.id);
        return {
          ...member,
          attending: rsvp ? rsvp.attending : null,
          afterParty: rsvp ? rsvp.afterParty : false,
          rsvpDate: rsvp ? rsvp.rsvpDate : null
        };
      });
      
      setAttendees(allMembersWithRsvp);
      setShowAttendees(true);
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
      alert("참석자 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoadingAttendees(false);
    }
  };

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
      } else if (field === 'attending') {
        // Type 정렬: Will Attend(1) > Won't Attend(0) > No RSVP(-1)
        if (aValue === true) aValue = 1;
        else if (aValue === false) aValue = 0;
        else aValue = -1;
        
        if (bValue === true) bValue = 1;
        else if (bValue === false) bValue = 0;
        else bValue = -1;
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
    const dataToExport = filteredAttendees.length > 0 ? filteredAttendees : attendees;
    const csvData = [
      ['Name', 'Email', 'Membership', 'Nationality', 'After Party', 'RSVP Date', 'Type'],
      ...dataToExport.map(attendee => [
        attendee.name || 'N/A',
        attendee.email || 'N/A',
        attendee.membership || 'N/A',
        attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality,
        attendee.afterParty ? 'Yes' : 'No',
        attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : 'N/A',
        attendee.attending === true ? 'Will Attend' : 
        attendee.attending === false ? 'Won\'t Attend' : 
        attendee.attending === null || attendee.attending === undefined ? 'No RSVP' : 'Unknown'
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

  // ✅ Count 클릭 핸들러 - 해당 타입의 멤버들 필터링
  const handleCountClick = async (type) => {
    // 먼저 attendees 데이터가 있는지 확인하고, 없으면 로드
    if (attendees.length === 0 && selectedEvent) {
      await handleViewAttendees(selectedEvent.id);
    }
    
    try {
      setLoadingAttendees(true);
      
      // 선택된 이벤트에서 지부 정보 가져오기
      const selectedEventData = events.find(event => event.id === selectedEvent.id);
      const branch = selectedEventData?.branch;
      
      if (!branch) {
        console.error("❌ No branch found for event:", selectedEventData);
        return;
      }
      
      // 병렬로 데이터 가져오기
      const [attendeesResponse, membersResponse] = await Promise.all([
        axios.get(`/api/admin/events/attendees?eventId=${selectedEvent.id}`),
        axios.get(`/api/admin/users/branch?branchName=${branch}`)
      ]);
      
      const currentAttendees = attendeesResponse.data || [];
      const allMembers = membersResponse.data || [];
      
      console.log("🔍 handleCountClick data:", { type, currentAttendees, allMembers });
      
      let filteredList = [];
      
      switch(type) {
        case 'total':
          // 모든 멤버 (RSVP 여부 관계없이) - 전체 멤버 목록
          // allMembers에 attending 필드 추가
          filteredList = allMembers.map(member => {
            const rsvp = currentAttendees.find(a => a.id === member.id);
            return {
              ...member,
              attending: rsvp ? rsvp.attending : null,
              afterParty: rsvp ? rsvp.afterParty : false,
              rsvpDate: rsvp ? rsvp.rsvpDate : null
            };
          });
          break;
        case 'attending':
          filteredList = currentAttendees.filter(attendee => attendee.attending === true);
          break;
        case 'notAttending':
          filteredList = currentAttendees.filter(attendee => attendee.attending === false);
          break;
        case 'noRsvp':
          // RSVP하지 않은 멤버들 = 전체 멤버 - RSVP한 사람들
          const rsvpUserIds = new Set(currentAttendees.map(a => a.id));
          filteredList = allMembers.filter(member => !rsvpUserIds.has(member.id)).map(member => ({
            ...member,
            attending: null,
            afterParty: false,
            rsvpDate: null
          }));
          break;
        case 'local':
          // Local (Taiwan) 멤버들 - Will Attend 중에서 Nationality가 Taiwan인 사람들
          const attendingMembers = currentAttendees.filter(attendee => attendee.attending === true);
          filteredList = attendingMembers.filter(attendee => {
            const displayNationality = attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality;
            return displayNationality === 'Taiwan';
          });
          break;
        case 'international':
          // International 멤버들 - Will Attend 중에서 Nationality가 Taiwan이 아닌 사람들
          const attendingMembersInt = currentAttendees.filter(attendee => attendee.attending === true);
          filteredList = attendingMembersInt.filter(attendee => {
            const displayNationality = attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality;
            return displayNationality !== 'Taiwan';
          });
          break;
        default:
          filteredList = currentAttendees;
      }
      
      console.log("🔍 handleCountClick result:", { type, filteredList, eventStats });
      setFilteredAttendees(filteredList);
      setShowAttendeeModal(true);
    } catch (error) {
      console.error("❌ Failed to fetch data for count click:", error);
      alert(`데이터를 불러오는 데 실패했습니다: ${error.message}`);
    } finally {
      setLoadingAttendees(false);
    }
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
                       <div className="flex justify-end">
                         <table className="w-96 border border-gray-300 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 border-b">Type</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">Count</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">Will Attend</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-green-600 cursor-pointer hover:bg-green-50 rounded" onClick={() => handleCountClick('attending')}>
                                {eventStats.attendingCount}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.totalRsvps > 0 ? Math.round(eventStats.attendingCount / eventStats.totalRsvps * 100) : 0}%
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">Won't Attend</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-red-500 cursor-pointer hover:bg-red-50 rounded" onClick={() => handleCountClick('notAttending')}>
                                {eventStats.notAttendingCount || 0}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.totalRsvps > 0 ? Math.round((eventStats.notAttendingCount || 0) / eventStats.totalRsvps * 100) : 0}%
                              </td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">No RSVP</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-yellow-600 cursor-pointer hover:bg-yellow-50 rounded" onClick={() => handleCountClick('noRsvp')}>
                                {eventStats.noRsvpCount || 0}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                {eventStats.totalRsvps > 0 ? Math.round((eventStats.noRsvpCount || 0) / eventStats.totalRsvps * 100) : 0}%
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="px-3 py-2 text-sm font-bold text-gray-900">Total Registered</td>
                              <td className="px-3 py-2 text-sm text-center font-bold text-blue-600 cursor-pointer hover:bg-blue-50 rounded" onClick={() => handleCountClick('total')}>
                                {eventStats.totalRsvps || 0}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-500">
                                100%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {/* After Party Stats */}
                       <div className="flex justify-start">
                         <div className="w-96">
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
                            <span className="text-gray-600">Max Capacity:</span>
                            <span className="font-medium text-gray-800">
                              {eventStats.capacity}
                            </span>
                          </div>
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
                  </div>
                  {/* 국제/로컬 비율 표시 */}
                  {eventStats && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Member Demographics</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleCountClick('attending')}
                        >
                          <div className="text-lg font-bold text-blue-600">{eventStats.attendingCount || 0}</div>
                          <div className="text-xs text-gray-600">Total Attending</div>
                        </div>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleCountClick('local')}
                        >
                          <div className="text-lg font-bold text-green-600">{eventStats.localAttendingCount || 0}</div>
                          <div className="text-xs text-gray-600">Local (Taiwan)</div>
                        </div>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleCountClick('international')}
                        >
                          <div className="text-lg font-bold text-purple-600">{eventStats.internationalAttendingCount || 0}</div>
                          <div className="text-xs text-gray-600">International</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-orange-600">{eventStats.localIntAttendingRatio || '0:0'}</div>
                          <div className="text-xs text-gray-600">Local:Int Ratio</div>
                        </div>
                      </div>
                    </div>
                  )}

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
        {(showAttendees || showAttendeeModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-7xl max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {filteredAttendees.length > 0 ? 'Filtered Attendee List' : 'Attendee List'} - {selectedEvent?.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredAttendees.length > 0 ? filteredAttendees.length : attendees.length} attendees
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {filteredAttendees.length > 0 && (
                    <button 
                      onClick={() => {
                        setFilteredAttendees([]);
                        // 모달을 닫지 않고 전체 데이터 표시
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      🔄 Clear Filter
                    </button>
                  )}
                  <button 
                    onClick={exportAttendeesToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📊 Export CSV
                  </button>
                  <button 
                    onClick={() => {
                      setShowAttendees(false);
                      setShowAttendeeModal(false);
                      setFilteredAttendees([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {attendees.length > 0 ? (
                isMobile ? (
                  // Mobile Card View for Attendees
                  <div className="space-y-4">
                    {sortAttendees(filteredAttendees.length > 0 ? filteredAttendees : attendees, attendeeSortField, attendeeSortOrder).map((attendee, index) => (
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
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Nationality: {attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attendee.attending === true ? 'bg-green-100 text-green-800' :
                                attendee.attending === false ? 'bg-red-100 text-red-800' :
                                attendee.attending === null || attendee.attending === undefined ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {attendee.attending === true ? 'Will Attend' : 
                               attendee.attending === false ? 'Won\'t Attend' : 
                               attendee.attending === null || attendee.attending === undefined ? 'No RSVP' : 'Unknown'}
                            </span>
                          <p className="text-xs text-gray-500">
                            RSVP: {attendee.rsvpDate ? new Date(attendee.rsvpDate).toLocaleDateString() : 'N/A'}
                          </p>
                          </div>
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
                        { field: 'nationality', label: 'Nationality' },
                        { field: 'afterParty', label: 'After Party' },
                        { field: 'rsvpDate', label: 'RSVP Date' },
                        { field: 'attending', label: 'Type' }
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
                      <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('nationality')}>
                              Nationality {attendeeSortField === 'nationality' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('afterParty')}>
                              After Party {attendeeSortField === 'afterParty' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rsvpDate')}>
                              RSVP Date {attendeeSortField === 'rsvpDate' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('attending')}>
                              Type {attendeeSortField === 'attending' && (attendeeSortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortAttendees(filteredAttendees.length > 0 ? filteredAttendees : attendees, attendeeSortField, attendeeSortOrder).map((attendee, index) => (
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {attendee.nationality === 'N/A' || !attendee.nationality ? 'Taiwan' : attendee.nationality}
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  attendee.attending === true ? 'bg-green-100 text-green-800' :
                                  attendee.attending === false ? 'bg-red-100 text-red-800' :
                                  attendee.attending === null || attendee.attending === undefined ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {attendee.attending === true ? 'Will Attend' : 
                                   attendee.attending === false ? 'Won\'t Attend' : 
                                   attendee.attending === null || attendee.attending === undefined ? 'No RSVP' : 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg font-medium mb-2">
                    {filteredAttendees.length === 0 && attendees.length === 0 ? 'No attendees found for this event.' : 
                     filteredAttendees.length === 0 ? 'No attendees found for this filter.' : 
                     'No attendees found for this event.'}
                  </p>
                  {filteredAttendees.length === 0 && attendees.length > 0 && (
                    <p className="text-sm">Try clicking "Clear Filter" to see all attendees.</p>
                  )}
                  {filteredAttendees.length === 0 && attendees.length === 0 && (
                    <p className="text-sm">Click "👥 View Full Attendee List" to load attendee data first.</p>
                  )}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setShowAttendees(false);
                    setShowAttendeeModal(false);
                    setFilteredAttendees([]);
                  }}
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
                    <span className="font-medium text-gray-700">Member ID:</span>
                    <span className="text-gray-900">{selectedMember.id || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Membership:</span>
                    <span className="text-gray-900">{selectedMember.membership || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Nationality:</span>
                    <span className="text-gray-900">{selectedMember.nationality === 'N/A' || !selectedMember.nationality ? 'Taiwan' : selectedMember.nationality}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">After Party:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMember.afterParty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMember.afterParty ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">RSVP Date:</span>
                    <span className="text-gray-900">
                      {selectedMember.rsvpDate ? new Date(selectedMember.rsvpDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMember.attending === true ? 'bg-green-100 text-green-800' : 
                      selectedMember.attending === false ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMember.attending === true ? 'Will Attend' : 
                       selectedMember.attending === false ? 'Won\'t Attend' : 
                       selectedMember.attending === null || selectedMember.attending === undefined ? 'No RSVP' : 'Unknown'}
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
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{eventStats?.totalRsvps || 0}</div>
                    <div className="text-sm text-gray-600">Total Registered</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{eventStats?.attendingCount || 0}</div>
                    <div className="text-sm text-gray-600">Will Attend</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{eventStats?.notAttendingCount || 0}</div>
                    <div className="text-sm text-gray-600">Won't Attend</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{eventStats?.afterPartyCount || 0}</div>
                    <div className="text-sm text-gray-600">After Party</div>
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
                <div className="flex justify-center pt-4 border-t">
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