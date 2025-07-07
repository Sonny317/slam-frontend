// src/pages/EventsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockEvents } from '../data/mockEvents'; // 방금 만든 가짜 데이터 불러오기

export default function EventsPage() {
  const [filter, setFilter] = useState('All'); // 'All', 'NCCU', 'NTU', 'TAIPEI'

  const filteredEvents = filter === 'All' 
    ? mockEvents 
    : mockEvents.filter(event => event.branch === filter);

  const branches = ['All', 'TAIPEI', 'NCCU', 'NTU'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Upcoming Events</h1>
      <p className="text-lg text-gray-600 text-center mb-10">Find your community, join the fun.</p>

      {/* 필터 버튼 */}
      <div className="flex justify-center gap-4 mb-12">
        {branches.map(branch => (
          <button 
            key={branch}
            onClick={() => setFilter(branch)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === branch ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {branch}
          </button>
        ))}
      </div>

      {/* 이벤트 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map(event => (
          <Link to={`/events/${event.id}`} key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${
                event.branch === 'TAIPEI' ? 'bg-green-200 text-green-800' :
                event.branch === 'NCCU' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
              }`}>{event.branch}</span>
              <h2 className="text-xl font-bold mb-2 h-16">{event.title}</h2>
              <p className="text-gray-600 text-sm">{event.date}</p>
              <p className="text-gray-600 text-sm">{event.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}