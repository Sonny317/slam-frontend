// src/pages/AdminEventsPage.jsx
import React, { useState } from 'react';

// --- 가짜 데이터 (과거/미래 이벤트 및 통계 데이터 추가) ---
const mockEvents = [
  // Past Events
  { id: 1, branch: 'TAIPEI', title: "SLAM TAIPEI: 1st Pilot Event", date: "2025-07-26T17:00", location: "Daan Forest Park", totalRsvps: 75, actualAttendees: 68, feedbackAvgRating: 4.9 },
  { id: 2, branch: 'NCCU', title: "NCCU Welcome Back Party", date: "2025-06-18T19:00", location: "NCCU Activity Center", totalRsvps: 82, actualAttendees: 75, feedbackAvgRating: 4.7 },
  
  // Upcoming Events
  { id: 3, branch: 'NTU', title: "NTU Language Exchange Night", date: "2025-09-25T19:00", location: "NTU Campus Cafe" },
  { id: 4, branch: 'TAIPEI', title: "Professionals Networking Vol. 2", date: "2025-10-15T19:30", location: "R77 Bistro & Bar" },
];
// ------------------------------------

export default function AdminEventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  // 현재 날짜를 기준으로 이벤트 필터링
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = events.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- 핸들러 함수들은 이전과 동일 ---
  const handleAddNew = () => {
    setCurrentEvent({ branch: 'NCCU', title: '', date: '', location: '', description: '', imageUrl: '' });
    setIsEditing(true);
  };
  const handleEdit = (event) => {
    setCurrentEvent(event);
    setIsEditing(true);
  };
  const handleSave = (e) => {
    e.preventDefault();
    alert(`Saving event: ${currentEvent.title}`);
    setIsEditing(false);
    setCurrentEvent(null);
  };
  // ------------------------------------

  // 수정/생성 폼 UI
  if (isEditing) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{currentEvent.id ? 'Edit Event' : 'Create New Event'}</h1>
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {/* ... 폼 내용은 이전과 동일 ... */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Event</button>
          </div>
        </form>
      </div>
    );
  }

  // 메인 대시보드 UI
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Event Management</h1>
        <button onClick={handleAddNew} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
          + Create New Event
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('upcoming')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Upcoming Events</button>
          <button onClick={() => setActiveTab('past')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Past Events</button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="mt-8">
        {activeTab === 'upcoming' && (
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
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(event.date).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-6">
            {pastEvents.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500">{event.branch}</span>
                    <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:underline">View Details & Feedback</button>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="text-2xl font-bold">{event.actualAttendees} / {event.totalRsvps}</p>
                    <p className="text-xs text-green-600 font-semibold">{((event.actualAttendees / event.totalRsvps) * 100).toFixed(1)}% Show-up Rate</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Feedback</p>
                    <p className="text-2xl font-bold text-yellow-500">{event.feedbackAvgRating} ★</p>
                    <p className="text-xs text-gray-500">Average Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
