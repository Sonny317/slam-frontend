import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios'; // ✅ axios를 임포트합니다.
import { useUser } from '../context/UserContext'; // ✅ UserContext를 임포트합니다.

export default function EventsPage() {
  const [events, setEvents] = useState([]); // ✅ API로부터 받아온 이벤트를 저장할 state
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태를 관리할 state
  const { user } = useUser(); // ✅ 전역 user 상태를 가져옵니다.

  // 🔴 userMemberships는 나중에 실제 사용자 정보에서 가져와야 합니다.
  const userMemberships = ['NCCU']; // 임시 데이터

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // 데이터 요청 시작 시 로딩 상태로 설정
      try {
        // 필터가 'All'이 아니면 쿼리 파라미터로 지부 정보를 함께 보냅니다.
        const endpoint = filter === 'All' ? '/api/events' : `/api/events?branch=${filter}`;
        const response = await axios.get(endpoint);
        setEvents(response.data); // 받아온 데이터로 state 업데이트
      } catch (error) {
        console.error("Failed to fetch events:", error);
        alert("이벤트 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false); // 데이터 요청 완료 시 로딩 상태 해제
      }
    };

    fetchEvents();
  }, [filter]); // ✅ filter state가 변경될 때마다 이 useEffect가 다시 실행됩니다.

  const branches = ['All', 'TAIPEI', 'NCCU', 'NTU'];

  // 날짜 형식을 예쁘게 바꿔주는 함수
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

        {/* 로딩 중일 때 표시될 스켈레톤 UI */}
        {loading ? (
          <p className="text-center text-gray-500">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-lg flex flex-col">
                <img src={event.imageUrl || "/default_event_image.jpg"} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
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
                      userMemberships.includes(event.branch) ? (
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