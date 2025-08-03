import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

// --- 이벤트 생성/수정 폼 컴포넌트 ---
const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState(event);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, eventDateTime: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{formData.id ? 'Edit Event' : 'Create New Event'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
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
            <input type="text" name="theme" value={formData.theme || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Date and Time</label>
                <input type="datetime-local" name="eventDateTime" value={formData.eventDateTime} onChange={handleDateChange} className="mt-1 block w-full p-2 border rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" placeholder="e.g., /images/event_image.jpg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border rounded-md"></textarea>
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
        <div className="flex justify-end gap-4 pt-4">
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
    setCurrentEvent({ 
      id: null, branch: 'NCCU', title: '', eventDateTime: '', 
      location: '', description: '', imageUrl: '', theme: '',
      capacity: 0, price: 0 
    });
    setIsEditing(true);
  };

  const handleEdit = (event) => {
    const formattedEvent = { ...event, eventDateTime: event.eventDateTime.slice(0, 16) };
    setCurrentEvent(formattedEvent);
    setIsEditing(true);
  };
  
    const handleSave = async (eventData) => {
    const isNew = !eventData.id;
    const url = isNew ? '/api/admin/events' : `/api/admin/events?eventId=${eventData.id}`;
    const method = isNew ? 'post' : 'put';

    try {
      const response = await axios[method](url, eventData);
      alert(`Event ${isNew ? 'created' : 'updated'} successfully!`);
      if (isNew) {
        setEvents(prev => [...prev, response.data]);
      } else {
        setEvents(prev => prev.map(e => e.id === eventData.id ? response.data : e));
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
  
  if (isEditing) {
    return <EventForm event={currentEvent} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Event Management</h1>
        <button onClick={handleAddNew} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
          + Create New Event
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('upcoming')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Upcoming Events</button>
          <button onClick={() => setActiveTab('past')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Past Events</button>
        </nav>
      </div>

      <div className="mt-8">
        {loading ? <p>Loading...</p> : (
          activeTab === 'upcoming' ? (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6">
              {pastEvents.map(event => (
                <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-gray-500">{event.branch}</span>
                      <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(event.eventDateTime).toLocaleDateString()}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:underline">View Details & Feedback</button>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-2xl font-bold">{event.currentAttendees || 0} / {event.capacity || 0}</p>
                      <p className="text-xs text-green-600 font-semibold">
                        {event.capacity > 0 ? `${((event.currentAttendees / event.capacity) * 100).toFixed(1)}% Show-up Rate` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Feedback</p>
                      <p className="text-2xl font-bold text-yellow-500">{event.feedbackAvgRating || 'N/A'} ★</p>
                      <p className="text-xs text-gray-500">Average Rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}