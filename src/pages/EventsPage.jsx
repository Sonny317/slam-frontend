import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { user } = useUser(); // ✅ refetchUser 함수를 제거합니다.
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? "https://slam-backend.onrender.com" 
    : "http://localhost:8080";

  // ❌ const userMemberships = ['NCCU']; // ⬅️ 임시 데이터를 삭제합니다.

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const endpoint = filter === 'All' ? '/api/events' : `/api/events?branch=${filter}`;
        const response = await axios.get(endpoint);
        console.log('EventsPage - API Response:', response.data);
        console.log('EventsPage - Total events:', response.data.length);
        
        // ✅ 미래의 이벤트만 필터링
        const now = new Date();
        const futureEvents = response.data.filter(event => new Date(event.eventDateTime) > now);
        console.log('EventsPage - Future events:', futureEvents.length);
        setEvents(futureEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filter]);

  const branches = ['All', 'TAIPEI', 'NCCU', 'NTU'];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl">Upcoming Events</h1>
          <p className="mt-4 text-xl text-gray-600">This is where the magic happens. Find your next adventure.</p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-4 my-12">
          {branches.map(branch => (
            <button 
              key={branch}
              onClick={() => setFilter(branch)}
              className={`px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base transition-colors ${filter === branch ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              {branch}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-lg flex flex-col">
                <img 
                  src={event.imageUrl ? `${backendUrl}${event.imageUrl}` : "/default_event_image.jpg"} 
                  alt={event.title} 
                  className="w-full h-48 object-cover rounded-t-lg" 
                />
                <div className="p-6 flex flex-col flex-grow">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 self-start ${
                    event.branch === 'TAIPEI' ? 'bg-green-200 text-green-800' :
                    event.branch === 'NCCU' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
                  }`}>{event.branch}</span>
                  <h2 className="text-xl font-bold mb-2 flex-grow">{event.title}</h2>
                  <p className="text-gray-600 text-sm">{formatDate(event.eventDateTime)}</p>
                  <p className="text-gray-600 text-sm mb-4">{event.location}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {user.isLoggedIn ? (
                      // ✅ Context에서 가져온 실제 멤버십 목록(user.memberships)을 사용합니다.
                      (user.memberships || []).some(membership => {
                        // "ACTIVE_NCCU" 형태에서 지부 이름만 추출
                        const branchName = membership.includes('_') ? membership.split('_')[1] : membership;
                        return branchName === event.branch;
                      }) ? (
                        <Link to={`/events/${event.id}`} className="block w-full text-center bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">
                          I'm Going! (RSVP)
                        </Link>
                      ) : (
                        <Link to="/membership" className="block w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Join {event.branch} Membership
                        </Link>
                      )
                    ) : (
                      <Link to="/login" className="block w-full text-center bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        Log in to Join
                      </Link>
                    )}
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