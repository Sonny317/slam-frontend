// src/pages/AdminFeedbackPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';

// --- 가짜 데이터 (API 연동 후 대체될 데이터베이스 모델) ---

// Game Master List
const mockGames = [
  { gameId: 'game-01', name: 'Human Bingo' },
  { gameId: 'game-02', name: 'Two Truths, One Lie' },
  { gameId: 'game-03', name: 'Scavenger Hunt' },
];

// Events List
const mockEvents = [
  { eventId: 1, eventTitle: "NCCU Welcome Party", branch: "NCCU", date: "2024-08-15", games: [mockGames[0], mockGames[1]] },
  { eventId: 2, eventTitle: "Taipei Professionals Networking", branch: "Taipei", date: "2024-08-20", games: [mockGames[1], mockGames[2]] },
  { eventId: 3, eventTitle: "NCCU Mid-term Party", branch: "NCCU", date: "2024-09-10", games: [mockGames[0], mockGames[2]] },
];

// Game Analytics Data (누적 데이터)
const mockGameStats = [
    { gameId: 'game-01', name: 'Human Bingo', avgRating: 4.8, feedbackCount: 120 },
    { gameId: 'game-02', name: 'Two Truths, One Lie', avgRating: 4.2, feedbackCount: 250 },
    { gameId: 'game-03', name: 'Scavenger Hunt', avgRating: 4.5, feedbackCount: 85 },
];
// ------------------------------------

// --- QR 코드 팝업(Modal) 컴포넌트 ---
const QrModal = ({ url, title, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
    <div className="bg-white p-8 rounded-lg text-center shadow-2xl" onClick={e => e.stopPropagation()}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <QRCodeSVG value={url} size={256} />
      <p className="mt-4 text-gray-600">Scan this code to open the feedback form.</p>
      <p className="mt-1 text-sm text-indigo-600 break-all">{url}</p>
      <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
    </div>
  </div>
);

export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'games'
  const [selectedBranch, setSelectedBranch] = useState('all'); // 'all', 'NCCU', 'NTU', 'Taipei'
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [summary, setSummary] = useState(null);
  const [gameRows, setGameRows] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFeedbackForm, setNewFeedbackForm] = useState({
    eventId: '',
    games: []
  });
  const [allGames, setAllGames] = useState([]);
  const [showQrModal, setShowQrModal] = useState(null); // { event, role }

  // 지부 필터링 로직
  const filteredEvents = useMemo(() => {
    if (selectedBranch === 'all') return events;
    return events.filter(event => event.branch === selectedBranch);
  }, [selectedBranch, events]);

  useEffect(() => {
    // Load events from backend admin list
    axios.get('/api/admin/events').then(res => setEvents(res.data || [])).catch(()=> setEvents([]));
    // Load all games for event assignment
    axios.get('/api/admin/games').then(res => setAllGames(res.data || [])).catch(()=> setAllGames([]));
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setSummary(null); setGameRows([]); return; }
    axios.get(`/api/feedback/event/${selectedEventId}/summary`).then(res => setSummary(res.data)).catch(()=> setSummary(null));
    axios.get(`/api/feedback/event/${selectedEventId}/games`).then(res => setGameRows(res.data || [])).catch(()=> setGameRows([]));
  }, [selectedEventId]);

  // QR 코드 URL 생성 로직
  const generateQrUrl = (event, role) => {
    // Staff 폼의 경우 self/peer 선택이 필요한 URL
    if (role === 'staff') {
      const url = `${window.location.origin}/feedback?eventId=${event.id || event.eventId}&branch=${event.branch}&role=staff`;
      setShowQrModal({ url, title: `${event.title || event.eventTitle} (Staff - Select Self/Peer)` });
    } else {
      const url = `${window.location.origin}/feedback/event/${event.id || event.eventId}?branch=${event.branch}&role=${role}`;
      setShowQrModal({ url, title: `${event.title || event.eventTitle} (${role})` });
    }
  };

  // Create New Feedback 처리
  const handleCreateFeedback = () => {
    if (!newFeedbackForm.eventId || newFeedbackForm.games.length === 0) {
      alert('Please select an event and at least one game.');
      return;
    }
    
    // 선택된 이벤트에 게임 할당
    axios.post(`/api/admin/events/${newFeedbackForm.eventId}/games`, newFeedbackForm.games)
      .then(() => {
        alert('Feedback form created successfully!');
        setShowCreateModal(false);
        setNewFeedbackForm({ eventId: '', games: [] });
      })
      .catch(err => alert('Failed to create feedback: ' + (err?.response?.data || err?.message || 'Unknown error')));
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {showQrModal && <QrModal url={showQrModal.url} title={showQrModal.title} onClose={() => setShowQrModal(null)} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">Feedback Dashboard</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          + Create New Feedback
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('summary')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Event Summary</button>
          <button onClick={() => setActiveTab('games')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'games' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Game Analytics</button>
        </nav>
      </div>
      
      <div className="mt-8">
        {activeTab === 'summary' && (
          <div>
            <div className="mb-6">
              <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700">Filter by Branch</label>
              <select 
                id="branch-filter"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Branches</option>
                <option value="NCCU">NCCU</option>
                <option value="NTU">NTU</option>
                <option value="Taipei">Taipei</option>
              </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Event Feedback List</h2>
              <ul className="space-y-4">
                {filteredEvents.map(event => (
                  <li key={event.eventId} className="p-4 border rounded-lg sm:flex justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-900">{event.eventTitle}</p>
                      <p className="text-sm text-gray-600"><span className="font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{event.branch}</span> | {new Date(event.eventDateTime || event.date).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => generateQrUrl(event, 'member')} className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">Member QR</button>
                      <button onClick={() => generateQrUrl(event, 'staff')} className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">Staff QR</button>
                      <button onClick={() => setSelectedEventId(event.id || event.eventId)} className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200">View Details</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selectedEventId && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4">Summary (Event #{selectedEventId})</h3>
                {summary ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><div className="text-sm text-gray-500">Submissions</div><div className="text-2xl font-bold">{summary.count}</div></div>
                    <div><div className="text-sm text-gray-500">Overall Avg</div><div className="text-2xl font-bold">{Number(summary.overallAvg).toFixed(2)}</div></div>
                    <div><div className="text-sm text-gray-500">NPS Avg</div><div className="text-2xl font-bold">{Number(summary.npsAvg).toFixed(2)}</div></div>
                  </div>
                ) : (
                  <p className="text-gray-500">No summary yet.</p>
                )}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Game Ratings</h4>
                  {gameRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600">Game ID</th>
                            <th className="px-3 py-2 text-left text-gray-600">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {gameRows.map((g,i)=>(
                            <tr key={i}>
                              <td className="px-3 py-2">{g.gameId}</td>
                              <td className="px-3 py-2">{g.rating}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No game ratings yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Cumulative Game Ratings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Feedbacks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockGameStats.map(stat => (
                    <tr key={stat.gameId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-bold text-yellow-500 text-lg">{stat.avgRating.toFixed(1)} ★</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.feedbackCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Create New Feedback Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white p-8 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create New Feedback Form</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select 
                  value={newFeedbackForm.eventId} 
                  onChange={(e) => setNewFeedbackForm(prev => ({ ...prev, eventId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event.id || event.eventId} value={event.id || event.eventId}>
                      {event.title || event.eventTitle} ({event.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Games</label>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                  {allGames.map(game => (
                    <label key={game.gameId} className="flex items-center gap-2 p-1">
                      <input
                        type="checkbox"
                        checked={newFeedbackForm.games.includes(game.gameId)}
                        onChange={(e) => {
                          setNewFeedbackForm(prev => ({
                            ...prev,
                            games: e.target.checked 
                              ? [...prev.games, game.gameId]
                              : prev.games.filter(g => g !== game.gameId)
                          }));
                        }}
                      />
                      <span className="text-sm">{game.name} <span className="text-gray-500">({game.category})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateFeedback} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
