import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

// --- 이벤트 생성/수정 폼 컴포넌트 ---
const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState(event);
  const [imageFile, setImageFile] = useState(null);
  const [showLocationPreview, setShowLocationPreview] = useState(false);
  const [customTheme, setCustomTheme] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, eventDateTime: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('branch', formData.branch);
    data.append('title', formData.title);
    if (formData.theme) data.append('theme', formData.theme);
    data.append('eventDateTime', formData.eventDateTime);
    if (formData.endTime) data.append('endTime', formData.endTime);
    data.append('location', formData.location);
    if (formData.description) data.append('description', formData.description);
    data.append('capacity', String(formData.capacity ?? 0));
    data.append('price', String(formData.price ?? 0));
    if (imageFile) data.append('image', imageFile);
    onSave({ id: formData.id, formData: data, isMultipart: true });
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{formData.id ? 'Edit Event' : 'Create New Event'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <select name="branch" value={formData.branch} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
              <option>NCCU</option>
              <option>NTU</option>
              <option>TAIPEI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <select 
              name="theme" 
              value={formData.theme === customTheme && customTheme ? 'Others' : formData.theme || ''} 
              onChange={(e) => {
                if (e.target.value === 'Others') {
                  setFormData(prev => ({ ...prev, theme: '' }));
                } else {
                  setFormData(prev => ({ ...prev, theme: e.target.value }));
                  setCustomTheme('');
                }
              }}
              className="mt-1 block w-full p-2 border rounded-md bg-white"
            >
              <option value="">Select a theme</option>
              <option value="Regular SLAM Meet">🤝 Regular SLAM Meet</option>
              <option value="Outing">🌳 Outing</option>
              <option value="Networking Party">🎉 Networking Party</option>
              <option value="Cultural Exchange">🌍 Cultural Exchange</option>
              <option value="Bar Night">🍻 Bar Night</option>
              <option value="Sports Activity">⚽ Sports Activity</option>
              <option value="Workshop">🛠️ Workshop</option>
              <option value="Others">✏️ Others (Custom)</option>
            </select>
            {(formData.theme === '' || formData.theme === customTheme) && (
              <input
                type="text"
                placeholder="Enter custom theme..."
                value={customTheme}
                onChange={(e) => {
                  setCustomTheme(e.target.value);
                  setFormData(prev => ({ ...prev, theme: e.target.value }));
                }}
                className="mt-2 block w-full p-2 border rounded-md"
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                <input type="datetime-local" name="eventDateTime" value={formData.eventDateTime} onChange={handleDateChange} className="mt-1 block w-full p-2 border rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className="mt-1 block w-full p-2 border rounded-md" 
                    placeholder="e.g., NTU Main Library, NCCU Business Building, Taipei 101"
                    required 
                  />
                  {formData.location && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowLocationPreview(!showLocationPreview)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>🗺️</span>
                        <span>{showLocationPreview ? 'Hide map preview' : 'Show map preview'}</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
                      >
                        <span>📍</span>
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  )}
                  {showLocationPreview && formData.location && (
                    <div className="border rounded-md overflow-hidden bg-gray-50">
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🗺️</div>
                        <p className="text-sm text-gray-600 mb-3">
                          Location: <strong>{formData.location}</strong>
                        </p>
                        <div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                          >
                            📍 View in Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-1 block w-full p-2 border rounded-md bg-white" />
          {formData.imageUrl && (
            <p className="text-xs text-gray-500 mt-1">Current: {formData.imageUrl}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            name="description" 
            value={formData.description || ''} 
            onChange={handleChange} 
            rows="8" 
            className="mt-1 block w-full p-2 border rounded-md"
            placeholder="Enter event description..."
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Capacity (Total Spots)</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Price (NTD)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
            </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Event</button>
        </div>
      </form>
    </div>
  );
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showPastEventModal, setShowPastEventModal] = useState(false);
  const [pastEventDetails, setPastEventDetails] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200); // iPad Pro까지 카드 뷰 사용
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/admin/events');
        console.log('AdminEventsPage - API Response:', response.data);
        console.log('AdminEventsPage - Total events:', response.data.length);
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.eventDateTime) >= now).sort((a, b) => new Date(a.eventDateTime) - new Date(b.eventDateTime));
  const pastEvents = events.filter(e => new Date(e.eventDateTime) < now).sort((a, b) => new Date(b.eventDateTime) - new Date(a.eventDateTime));

  const handleAddNew = () => {
    // ✅ 모든 필드를 빈 문자열 또는 0으로 명확하게 초기화합니다.
    const defaultDescription = `Join us for an amazing event! 🎉

📍 What to expect:
• Meet amazing people from around the world
• Enjoy great food and drinks
• Fun activities and games
• Networking opportunities

🎫 What's included:
• Welcome drink
• Light refreshments
• Fun activities

👥 Who should attend:
• International students
• Local students
• Young professionals
• Anyone looking to make new friends!

Can't wait to see you there! 🌟`;

    // 1st/2nd/3rd 로테이션으로 기본 제목 생성
    const cycleNumber = ((events.length % 3) + 1);
    const ordinals = ['1st', '2nd', '3rd'];
    const defaultTitle = `SLAM ${ordinals[cycleNumber - 1]} Event`;

    setCurrentEvent({ 
      id: null, branch: 'NCCU', title: defaultTitle, eventDateTime: '', endTime: '',
      location: '', description: defaultDescription, imageUrl: '', theme: '',
      capacity: 0, price: 0 
    });
    setIsEditing(true);
  };

  const handleEdit = (event) => {
    const formattedEvent = { ...event, eventDateTime: event.eventDateTime.slice(0, 16) };
    setCurrentEvent(formattedEvent);
    setIsEditing(true);
  };
  
  const handleSave = async (payload) => {
    const isNew = !payload.id;
    const url = isNew ? '/api/admin/events' : `/api/admin/events?eventId=${payload.id}`;
    const method = isNew ? 'post' : 'put';

    try {
      let response;
      if (payload.isMultipart) {
        response = await axios[method](url, payload.formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios[method](url, payload);
      }
      alert(`Event ${isNew ? 'created' : 'updated'} successfully!`);
      if (isNew) {
        setEvents(prev => [...prev, response.data]);
      } else {
        setEvents(prev => prev.map(e => e.id === payload.id ? response.data : e));
      }
      setIsEditing(false);
      setCurrentEvent(null);
    } catch (error) {
      alert(`Failed to save event: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/admin/events?eventId=${eventId}`);
        alert("Event deleted successfully.");
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } catch (error) {
        alert(`Failed to delete event: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleArchive = async (eventId) => {
    if (!window.confirm("Mark this event as Past (archive)?")) return;
    try {
      // 이벤트를 과거 날짜로 변경하여 Past Events로 이동
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDateTime = yesterday.toISOString();
      
      await axios.put(`/api/admin/events?eventId=${eventId}`, {
        eventDateTime: pastDateTime,
        archived: true
      });
      
      alert('Event moved to Past Events successfully.');
      
      // 로컬 상태 업데이트
      setEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, eventDateTime: pastDateTime, archived: true } 
          : e
      ));
    } catch (error) {
      alert(`Failed to archive event: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewPastEventDetails = async (event) => {
    try {
      // 이벤트 기본 정보
      const eventDetails = {
        ...event,
        attendanceRate: event.capacity > 0 ? ((event.currentAttendees || 0) / event.capacity * 100).toFixed(1) : 0
      };

      // RSVP 정보 가져오기 (참석자 및 After Party)
      try {
        const rsvpResponse = await axios.get(`/api/events/${event.id}/rsvp-summary`);
        eventDetails.rsvpData = rsvpResponse.data;
      } catch (error) {
        console.warn('Failed to fetch RSVP data:', error);
        eventDetails.rsvpData = {
          totalAttending: event.currentAttendees || 0,
          afterPartyCount: 0,
          attendees: []
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

      setPastEventDetails(eventDetails);
      setShowPastEventModal(true);
    } catch (error) {
      alert('Failed to load event details: ' + (error.response?.data?.message || error.message));
    }
  };
  
  if (isEditing) {
    return <EventForm event={currentEvent} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

    return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Event Management</h1>
        <p className="text-gray-500 mb-8">Create, edit, and manage upcoming and past events for all branches.</p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div></div>
          <button onClick={handleAddNew} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
            + Create New Event
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            <button onClick={() => setActiveTab('upcoming')} className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Upcoming Events</button>
            <button onClick={() => setActiveTab('past')} className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Past Events</button>
          </nav>
        </div>

        <div className="mt-8">
        {loading ? <p>Loading...</p> : (
          activeTab === 'upcoming' ? (
            isMobile ? (
              // Mobile Card View for Upcoming Events
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.branch}</p>
                        <p className="text-sm text-gray-500">{new Date(event.eventDateTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                      <button onClick={() => handleArchive(event.id)} className="text-gray-700 hover:text-black text-sm font-medium">Move to Past</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View for Upcoming Events
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingEvents.map(event => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{event.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(event.eventDateTime).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                        <button onClick={() => handleArchive(event.id)} className="text-gray-700 hover:text-black ml-4">Move to Past</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          ) : (
            isMobile ? (
              // Mobile Card View for Past Events
              <div className="space-y-4">
                {pastEvents.map(event => (
                  <div key={event.id} className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      {event.theme && (
                        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          {event.theme}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{event.branch}</p>
                      <p className="text-sm text-gray-500">{new Date(event.eventDateTime).toLocaleDateString()}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{event.currentAttendees || 0} / {event.capacity || 0}</span>
                        <span className="text-xs text-green-600 ml-2">
                          {event.capacity > 0 ? `${((event.currentAttendees || 0) / event.capacity * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleViewPastEventDetails(event)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleEdit(event)} 
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View for Past Events
              <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
              {pastEvents.map(event => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              {event.theme && (
                                <div className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                  {event.theme}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {event.branch}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.eventDateTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">{event.currentAttendees || 0} / {event.capacity || 0}</span>
                            <span className="text-xs text-green-600">
                              {event.capacity > 0 ? `${((event.currentAttendees || 0) / event.capacity * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewPastEventDetails(event)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleEdit(event)} 
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(event.id)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )
        )}
      </div>

      {/* Past Event Details Modal */}
      {showPastEventModal && pastEventDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setShowPastEventModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{pastEventDetails.title}</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">{pastEventDetails.branch}</span>
                    {pastEventDetails.theme && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">{pastEventDetails.theme}</span>
                    )}
                    <span>{new Date(pastEventDetails.eventDateTime).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => setShowPastEventModal(false)} className="text-gray-400 hover:text-gray-600">
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
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{pastEventDetails.capacity || 0}</div>
                  <div className="text-sm text-gray-600">Capacity</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{pastEventDetails.rsvpData?.totalAttending || 0}</div>
                  <div className="text-sm text-gray-600">Registered</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">{pastEventDetails.rsvpData?.afterPartyCount || 0}</div>
                  <div className="text-sm text-gray-600">After Party</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pastEventDetails.attendanceRate}%</div>
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
                    <div className="text-xl font-bold text-gray-800">{pastEventDetails.feedbackData?.count || 0}</div>
                    <div className="text-sm text-gray-600">Total Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-500">
                      {pastEventDetails.feedbackData?.overallAvg ? Number(pastEventDetails.feedbackData.overallAvg).toFixed(1) : 'N/A'} ★
                    </div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {pastEventDetails.feedbackData?.npsAvg ? Number(pastEventDetails.feedbackData.npsAvg).toFixed(1) : 'N/A'}
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
                  <div><strong>Location:</strong> {pastEventDetails.location}</div>
                  <div><strong>Date & Time:</strong> {new Date(pastEventDetails.eventDateTime).toLocaleString()}</div>
                  {pastEventDetails.endTime && (
                    <div><strong>End Time:</strong> {pastEventDetails.endTime}</div>
                  )}
                  <div><strong>Price:</strong> {pastEventDetails.price ? `NT$${pastEventDetails.price}` : 'Free'}</div>
                  {pastEventDetails.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{pastEventDetails.description}</p>
            </div>
        )}
      </div>
              </div>

              {/* Registered Attendees */}
              {pastEventDetails.rsvpData?.attendees && pastEventDetails.rsvpData.attendees.length > 0 && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">👥</span>
                    Registered Attendees ({pastEventDetails.rsvpData.attendees.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pastEventDetails.rsvpData.attendees.map((attendee, index) => (
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
                <Link 
                  to={`/admin/feedback`} 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  onClick={() => setShowPastEventModal(false)}
                >
                  View Full Feedback Report
                </Link>
                <button 
                  onClick={() => {
                    setShowPastEventModal(false);
                    handleEdit(pastEventDetails);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Edit Event
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