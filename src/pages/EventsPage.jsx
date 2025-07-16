// src/pages/EventsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockEvents } from '../data/mockEvents';

// --- 테스트를 위한 새로운 가짜 사용자 상태 ---
const IS_LOGGED_IN = true;
const userMemberships = ['']; // ✅ 예: 이 사용자는 NCCU 멤버입니다.
// userMemberships를 ['NCCU', 'TAIPEI']로 바꾸거나, [] (빈 배열)로 바꿔가며 테스트해보세요.
// ------------------------------------

export default function EventsPage() {
  const [filter, setFilter] = useState('All');
  const filteredEvents = filter === 'All' 
    ? mockEvents 
    : mockEvents.filter(event => event.branch === filter);
  const branches = ['All', 'TAIPEI', 'NCCU', 'NTU'];

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl">Upcoming Events</h1>
          <p className="mt-4 text-xl text-gray-600">This is where the magic happens. Find your next adventure.</p>
        </div>

        {/* 필터 버튼 */}
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

        {/* 이벤트 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg flex flex-col">
              <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
              <div className="p-6 flex flex-col flex-grow">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 self-start ${
                  event.branch === 'TAIPEI' ? 'bg-green-200 text-green-800' :
                  event.branch === 'NCCU' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
                }`}>{event.branch}</span>
                <h2 className="text-xl font-bold mb-2 flex-grow">{event.title}</h2>
                <p className="text-gray-600 text-sm">{event.date}</p>
                <p className="text-gray-600 text-sm mb-4">{event.location}</p>
                
                {/* 여기가 핵심! 사용자 상태에 따라 다른 버튼을 보여줍니다. */}
                {/* EventsPage.jsx의 .map() 함수 안쪽, 버튼을 보여주는 부분 */}

                {/* EventsPage.jsx의 .map() 함수 안쪽, 버튼을 보여주는 부분 */}

                <div className="mt-auto pt-4 border-t border-gray-100">
                {IS_LOGGED_IN ? (
                    // ✅ userMemberships 배열에 현재 이벤트의 지부가 포함되어 있는지 확인합니다.
                    userMemberships.includes(event.branch) ? (
                    // ✅ 포함되어 있다면: RSVP 버튼 표시
                    <Link to={`/events/${event.id}`} className="block w-full text-center bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">
                        I'm Going! (RSVP)
                    </Link>
                    ) : (
                    // ✅ 포함되어 있지 않다면: 멤버십 구매 유도 버튼 표시
                    <Link to="/membership" className="block w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Join {event.branch} Membership
                    </Link>
                    )
                ) : (
                    // ✅ 비로그인 사용자일 경우: 로그인 유도 버튼
                    <Link to="/login" className="block w-full text-center bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Log in to Join
                    </Link>
                )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}