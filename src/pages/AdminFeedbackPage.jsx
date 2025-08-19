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
    <div className="bg-white p-8 rounded-lg text-center shadow-2xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      {/* QR Code - 가운데 정렬 */}
      <div className="flex justify-center mb-6">
      <QRCodeSVG value={url} size={256} />
      </div>
      
      <p className="text-gray-600 mb-4">Scan this code or click the button below to open the feedback form.</p>
      
      {/* 버튼으로 링크 이동 */}
      <div className="space-y-3">
        <button 
          onClick={() => window.open(url, '_blank')}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          🔗 Open Feedback Form
        </button>
        <button 
          onClick={onClose} 
          className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'games', 'past', 'staff'
  const [selectedBranch, setSelectedBranch] = useState('all'); // 'all', 'NCCU', 'NTU', 'Taipei'
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
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
  const [selectedPastEvents, setSelectedPastEvents] = useState(new Set());
  const [aggregatedData, setAggregatedData] = useState(null);
  const [staffFeedback, setStaffFeedback] = useState([]);
  const [userRole, setUserRole] = useState('member'); // 'member', 'staff', 'leader', 'admin'

  // 사용자 역할 확인 (useEffect에 추가)
  useEffect(() => {
    // 사용자 역할 가져오기 (UserContext 또는 API에서)
    axios.get('/api/user/role').then(res => {
      setUserRole(res.data.role);
    }).catch(() => setUserRole('member'));
  }, []);

  // 지부 필터링 로직
  const filteredEvents = useMemo(() => {
    const eventsToFilter = activeTab === 'past' ? pastEvents : events;
    if (selectedBranch === 'all') return eventsToFilter;
    return eventsToFilter.filter(event => event.branch === selectedBranch);
  }, [selectedBranch, events, pastEvents, activeTab]);

  useEffect(() => {
    // Load events from backend admin list
    axios.get('/api/admin/events').then(res => {
      const allEvents = res.data || [];
      const now = new Date();
      
      // 현재/미래 이벤트와 과거 이벤트 분리
      const upcoming = allEvents.filter(e => new Date(e.eventDateTime) >= now);
      const past = allEvents.filter(e => new Date(e.eventDateTime) < now);
      
      setEvents(upcoming);
      setPastEvents(past);
    }).catch(() => {
      setEvents([]);
      setPastEvents([]);
    });
    
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
    // Staff 폼의 경우 새로운 Staff Feedback Form으로 연결
    if (role === 'staff') {
      const url = `${window.location.origin}/feedback/staff/${event.id || event.eventId}?branch=${event.branch}`;
      setShowQrModal({ url, title: `${event.title || event.eventTitle} (Staff Evaluation)` });
    } else {
      const url = `${window.location.origin}/feedback/event/${event.id || event.eventId}?branch=${event.branch}&role=${role}`;
      setShowQrModal({ url, title: `${event.title || event.eventTitle} (Member Feedback)` });
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

  // 피드백 삭제 처리
  const handleDeleteFeedback = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete all feedback for this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/feedback/event/${eventId}`);
      alert('Feedback deleted successfully!');
      
      // 선택된 이벤트가 삭제된 경우 선택 해제
      if (selectedEventId === eventId) {
        setSelectedEventId('');
        setSummary(null);
        setGameRows([]);
      }
    } catch (error) {
      alert('Failed to delete feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  // 체크박스 선택 처리
  const handleEventSelection = (eventId, isChecked) => {
    const newSelection = new Set(selectedPastEvents);
    if (isChecked) {
      newSelection.add(eventId);
    } else {
      newSelection.delete(eventId);
    }
    setSelectedPastEvents(newSelection);
  };

  // 전체 선택/해제
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allEventIds = filteredEvents.map(e => e.id || e.eventId);
      setSelectedPastEvents(new Set(allEventIds));
    } else {
      setSelectedPastEvents(new Set());
    }
  };

  // 선택된 이벤트들의 집계 데이터 계산
  const calculateAggregatedData = async () => {
    if (selectedPastEvents.size === 0) {
      setAggregatedData(null);
      return;
    }

    try {
      const eventIds = Array.from(selectedPastEvents);
      const summaryPromises = eventIds.map(id => 
        axios.get(`/api/feedback/event/${id}/summary`).catch(() => null)
      );
      const gamePromises = eventIds.map(id => 
        axios.get(`/api/feedback/event/${id}/games`).catch(() => [])
      );

      const summaries = await Promise.all(summaryPromises);
      const gameData = await Promise.all(gamePromises);

      // 유효한 데이터만 필터링
      const validSummaries = summaries.filter(s => s && s.data).map(s => s.data);
      const validGameData = gameData.filter(g => g && g.data).flatMap(g => g.data);

      if (validSummaries.length === 0) {
        setAggregatedData(null);
        return;
      }

      // 집계 계산
      const totalSubmissions = validSummaries.reduce((sum, s) => sum + (s.count || 0), 0);
      const avgOverall = validSummaries.reduce((sum, s) => sum + (s.overallAvg || 0), 0) / validSummaries.length;
      const avgNPS = validSummaries.reduce((sum, s) => sum + (s.npsAvg || 0), 0) / validSummaries.length;
      
      // 게임별 집계
      const gameAggregation = {};
      validGameData.forEach(game => {
        if (!gameAggregation[game.gameId]) {
          gameAggregation[game.gameId] = { ratings: [], totalResponses: 0 };
        }
        gameAggregation[game.gameId].ratings.push(Number(game.rating) || 0);
        gameAggregation[game.gameId].totalResponses += (game.responseCount || 0);
      });

      const aggregatedGames = Object.entries(gameAggregation).map(([gameId, data]) => ({
        gameId,
        avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        totalResponses: data.totalResponses,
        eventCount: data.ratings.length
      }));

      setAggregatedData({
        eventCount: selectedPastEvents.size,
        totalSubmissions,
        avgOverall,
        avgNPS,
        games: aggregatedGames
      });
    } catch (error) {
      console.error('Failed to calculate aggregated data:', error);
      setAggregatedData(null);
    }
  };

  // 선택된 이벤트가 변경될 때마다 집계 데이터 계산
  useEffect(() => {
    if (activeTab === 'past') {
      calculateAggregatedData();
    }
  }, [selectedPastEvents, activeTab]);

  // Staff 피드백 데이터 로드
  const loadStaffFeedback = async (eventId) => {
    try {
      const selfResponse = await axios.get(`/api/feedback/staff/self/${eventId}`);
      const peerResponse = await axios.get(`/api/feedback/staff/peer/${eventId}`);
      
      setStaffFeedback({
        self: selfResponse.data || [],
        peer: peerResponse.data || []
      });
    } catch (error) {
      console.error('Failed to load staff feedback:', error);
      setStaffFeedback({ self: [], peer: [] });
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {showQrModal && <QrModal url={showQrModal.url} title={showQrModal.title} onClose={() => setShowQrModal(null)} />}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">Feedback Dashboard</h1>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Create New Feedback
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('summary')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
            📋 Current Events
          </button>
          <button onClick={() => setActiveTab('past')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'past' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
            📚 Past Feedback
          </button>
          <button onClick={() => setActiveTab('staff')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'staff' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
            👥 Staff Feedback
          </button>
          <button onClick={() => setActiveTab('games')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'games' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
            🎯 Game Analytics
          </button>
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
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Event Feedback Summary (#{selectedEventId})
                </h3>
                {summary ? (
                  <div>
                    {/* Enhanced Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Submissions</div>
                        <div className="text-2xl font-bold text-blue-600">{summary.count}</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Overall Rating</div>
                        <div className="text-2xl font-bold text-yellow-500">{Number(summary.overallAvg).toFixed(1)} ★</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">NPS Score</div>
                        <div className="text-2xl font-bold text-green-600">{Number(summary.npsAvg).toFixed(1)}</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Response Rate</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {summary.responseRate ? `${summary.responseRate}%` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    {(summary.participantsFitAvg || summary.interactionOpportunityAvg || summary.languageConfidenceAvg) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {summary.participantsFitAvg && (
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-sm text-gray-500">Participants Fit</div>
                            <div className="text-xl font-bold text-gray-700">{Number(summary.participantsFitAvg).toFixed(1)} ★</div>
                          </div>
                        )}
                        {summary.interactionOpportunityAvg && (
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-sm text-gray-500">Interaction Opportunity</div>
                            <div className="text-xl font-bold text-gray-700">{Number(summary.interactionOpportunityAvg).toFixed(1)} ★</div>
                          </div>
                        )}
                        {summary.languageConfidenceAvg && (
                          <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-sm text-gray-500">Language Confidence</div>
                            <div className="text-xl font-bold text-gray-700">{Number(summary.languageConfidenceAvg).toFixed(1)} ★</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    {(summary.goodPoints || summary.improvements || summary.comments) && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <span className="mr-2">💬</span>
                          Participant Comments
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Good Points */}
                          {summary.goodPoints && summary.goodPoints.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-700 mb-3 flex items-center">
                                <span className="mr-2">👍</span>
                                What they liked most ({summary.goodPoints.length})
                              </h5>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {summary.goodPoints.slice(0, 8).map((comment, index) => (
                                  <div key={index} className="bg-green-50 border-l-4 border-green-200 p-3 rounded-r-lg">
                                    <p className="text-sm text-green-800 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.goodPoints.length > 8 && (
                                  <div className="text-center text-sm text-green-600">
                                    ... and {summary.goodPoints.length - 8} more positive comments
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Improvements */}
                          {summary.improvements && summary.improvements.length > 0 && (
                            <div>
                              <h5 className="font-medium text-orange-700 mb-3 flex items-center">
                                <span className="mr-2">💡</span>
                                Suggestions for improvement ({summary.improvements.length})
                              </h5>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {summary.improvements.slice(0, 8).map((comment, index) => (
                                  <div key={index} className="bg-orange-50 border-l-4 border-orange-200 p-3 rounded-r-lg">
                                    <p className="text-sm text-orange-800 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.improvements.length > 8 && (
                                  <div className="text-center text-sm text-orange-600">
                                    ... and {summary.improvements.length - 8} more suggestions
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Legacy combined comments (if no separated data available) */}
                          {summary.comments && summary.comments.length > 0 && !summary.goodPoints && !summary.improvements && (
                            <div className="lg:col-span-2">
                              <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                <span className="mr-2">💭</span>
                                General Comments ({summary.comments.length})
                              </h5>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {summary.comments.slice(0, 10).map((comment, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.comments.length > 10 && (
                                  <div className="text-center text-sm text-gray-500">
                                    ... and {summary.comments.length - 10} more comments
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500">No feedback data available yet.</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="mr-2">🎮</span>
                    Game Ratings
                  </h4>
                  {gameRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Game Name</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Average Rating</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Responses</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Performance</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {gameRows.map((g,i)=>{
                            const gameName = allGames.find(game => game.gameId === g.gameId)?.name || g.gameId;
                            const rating = Number(g.rating);
                            const performance = rating >= 4.5 ? '🔥 Excellent' : rating >= 4.0 ? '👍 Good' : rating >= 3.5 ? '👌 Average' : '⚠️ Needs Improvement';
                            
                            return (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{gameName}</td>
                                <td className="px-4 py-3">
                                  <span className="text-yellow-500 font-bold text-lg">{rating.toFixed(1)} ★</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{g.responseCount || 'N/A'}</td>
                                <td className="px-4 py-3">
                                  <span className="text-sm">{performance}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🎯</div>
                      <p className="text-gray-500">No game ratings available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Past Event Feedback</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{filteredEvents.length} events</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPastEvents.size === filteredEvents.length && filteredEvents.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                    Select All
                  </label>
                </div>
              </div>
              
              {selectedPastEvents.size > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-blue-800">
                      📊 Aggregated Data ({selectedPastEvents.size} events selected)
                    </h3>
                    <button
                      onClick={() => setSelectedPastEvents(new Set())}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  {aggregatedData ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Total Submissions</div>
                        <div className="text-xl font-bold text-blue-600">{aggregatedData.totalSubmissions}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Avg Overall</div>
                        <div className="text-xl font-bold text-yellow-500">{aggregatedData.avgOverall.toFixed(1)} ★</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Avg NPS</div>
                        <div className="text-xl font-bold text-green-600">{aggregatedData.avgNPS.toFixed(1)}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Events</div>
                        <div className="text-xl font-bold text-purple-600">{aggregatedData.eventCount}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">Loading aggregated data...</div>
                  )}
                </div>
              )}

              <ul className="space-y-4">
                {filteredEvents.map(event => (
                  <li key={event.eventId || event.id} className="p-4 border rounded-lg sm:flex justify-between items-center space-y-4 sm:space-y-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3 flex-grow">
                      <input
                        type="checkbox"
                        checked={selectedPastEvents.has(event.id || event.eventId)}
                        onChange={(e) => handleEventSelection(event.id || event.eventId, e.target.checked)}
                        className="rounded"
                      />
                      <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-900">{event.eventTitle || event.title}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full mr-2">{event.branch}</span>
                          {new Date(event.eventDateTime || event.date).toLocaleDateString()}
                          {event.theme && (
                            <span className="ml-2 text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs">{event.theme}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => setSelectedEventId(event.id || event.eventId)} 
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200"
                      >
                        📊 View Feedback
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selectedEventId && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4">Feedback Summary (Event #{selectedEventId})</h3>
                {summary ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Submissions</div>
                        <div className="text-2xl font-bold text-blue-600">{summary.count}</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Overall Avg</div>
                        <div className="text-2xl font-bold text-yellow-500">{Number(summary.overallAvg).toFixed(1)} ★</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">NPS Avg</div>
                        <div className="text-2xl font-bold text-green-600">{Number(summary.npsAvg).toFixed(1)}</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Response Rate</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {summary.responseRate ? `${summary.responseRate}%` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Comments Section for Past Events */}
                    {(summary.goodPoints || summary.improvements || summary.comments) && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <span className="mr-2">💬</span>
                          Participant Comments
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Good Points */}
                          {summary.goodPoints && summary.goodPoints.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-700 mb-3 flex items-center">
                                <span className="mr-2">👍</span>
                                What they liked most ({summary.goodPoints.length})
                              </h5>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {summary.goodPoints.slice(0, 8).map((comment, index) => (
                                  <div key={index} className="bg-green-50 border-l-4 border-green-200 p-3 rounded-r-lg">
                                    <p className="text-sm text-green-800 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.goodPoints.length > 8 && (
                                  <div className="text-center text-sm text-green-600">
                                    ... and {summary.goodPoints.length - 8} more positive comments
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Improvements */}
                          {summary.improvements && summary.improvements.length > 0 && (
                            <div>
                              <h5 className="font-medium text-orange-700 mb-3 flex items-center">
                                <span className="mr-2">💡</span>
                                Suggestions for improvement ({summary.improvements.length})
                              </h5>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {summary.improvements.slice(0, 8).map((comment, index) => (
                                  <div key={index} className="bg-orange-50 border-l-4 border-orange-200 p-3 rounded-r-lg">
                                    <p className="text-sm text-orange-800 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.improvements.length > 8 && (
                                  <div className="text-center text-sm text-orange-600">
                                    ... and {summary.improvements.length - 8} more suggestions
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Legacy combined comments (if no separated data available) */}
                          {summary.comments && summary.comments.length > 0 && !summary.goodPoints && !summary.improvements && (
                            <div className="lg:col-span-2">
                              <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                <span className="mr-2">💭</span>
                                General Comments ({summary.comments.length})
                              </h5>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {summary.comments.slice(0, 10).map((comment, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700 italic">"{comment}"</p>
                                  </div>
                                ))}
                                {summary.comments.length > 10 && (
                                  <div className="text-center text-sm text-gray-500">
                                    ... and {summary.comments.length - 10} more comments
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No feedback data available.</p>
                )}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Game Ratings</h4>
                  {gameRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600">Game Name</th>
                            <th className="px-3 py-2 text-left text-gray-600">Rating</th>
                            <th className="px-3 py-2 text-left text-gray-600">Responses</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {gameRows.map((g,i)=>(
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">
                                {allGames.find(game => game.gameId === g.gameId)?.name || g.gameId}
                              </td>
                              <td className="px-3 py-2">
                                <span className="text-yellow-500 font-bold">{Number(g.rating).toFixed(1)} ★</span>
                              </td>
                              <td className="px-3 py-2">{g.responseCount || 'N/A'}</td>
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

        {activeTab === 'staff' && (userRole === 'leader' || userRole === 'admin') && (
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Staff Performance Feedback</h2>
                <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  🔒 Leader Access Only
                </span>
              </div>
              
              <ul className="space-y-4">
                {filteredEvents.map(event => (
                  <li key={event.eventId || event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-900">{event.eventTitle || event.title}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full mr-2">{event.branch}</span>
                          {new Date(event.eventDateTime || event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => {
                            setSelectedEventId(event.id || event.eventId);
                            loadStaffFeedback(event.id || event.eventId);
                          }}
                          className="text-sm bg-purple-100 text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-200"
                        >
                          👥 View Staff Feedback
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Staff Feedback Details */}
            {selectedEventId && staffFeedback && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">👥</span>
                  Staff Feedback Summary (Event #{selectedEventId})
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Self Evaluations */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="mr-2">🔍</span>
                      Self Evaluations ({staffFeedback.self?.length || 0})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {staffFeedback.self?.map((feedback, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{feedback.staffName}</span>
                            <span className="text-xs text-gray-500">{feedback.team}</span>
                          </div>
                          <div className="grid grid-cols-5 gap-2 text-xs mb-2">
                            <div className="text-center">
                              <div className="text-gray-500">Proactive</div>
                              <div className="font-bold text-blue-600">{feedback.proactiveness}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Task</div>
                              <div className="font-bold text-blue-600">{feedback.taskCompletion}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Comm</div>
                              <div className="font-bold text-blue-600">{feedback.communication}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Time</div>
                              <div className="font-bold text-blue-600">{feedback.timeManagement}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Ideas</div>
                              <div className="font-bold text-blue-600">{feedback.ideaGeneration}/5</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{feedback.proudOf}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peer Evaluations */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">👥</span>
                      Peer Evaluations ({staffFeedback.peer?.length || 0})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {staffFeedback.peer?.map((feedback, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">
                              {feedback.evaluatorName} → {feedback.evaluatedName}
                            </span>
                            <span className="text-xs text-gray-500">{feedback.team}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                            <div className="text-center">
                              <div className="text-gray-500">Performance</div>
                              <div className="font-bold text-green-600">{feedback.overallPerformance}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Teamwork</div>
                              <div className="font-bold text-green-600">{feedback.teamwork}/5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">Communication</div>
                              <div className="font-bold text-green-600">{feedback.communication}/5</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{feedback.strengths}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
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
              <h2 className="text-2xl font-semibold mb-4">Staff Performance Feedback</h2>
              
              <ul className="space-y-4">
                {filteredEvents.map(event => (
                  <li key={event.eventId || event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-900">{event.eventTitle || event.title}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full mr-2">{event.branch}</span>
                          {new Date(event.eventDateTime || event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => setSelectedEventId(event.id || event.eventId)}
                          className="text-sm bg-purple-100 text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-200"
                        >
                          👥 View Staff Feedback
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selectedEventId && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">👥</span>
                  Staff Feedback Summary (Event #{selectedEventId})
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Self Evaluations */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="mr-2">🔍</span>
                      Self Evaluations (5)
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">John Kim</span>
                          <span className="text-xs text-gray-500">EP</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                          <div className="text-center">
                            <div className="text-gray-500">Proactive</div>
                            <div className="font-bold text-blue-600">4/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Task</div>
                            <div className="font-bold text-blue-600">5/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Comm</div>
                            <div className="font-bold text-blue-600">4/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Time</div>
                            <div className="font-bold text-blue-600">3/5</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic">"Successfully managed registration desk and helped newcomers feel welcome"</p>
                      </div>
                    </div>
                  </div>

                  {/* Peer Evaluations */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">👥</span>
                      Peer Evaluations (8)
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            Sarah → John Kim
                          </span>
                          <span className="text-xs text-gray-500">EP</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="text-center">
                            <div className="text-gray-500">Overall</div>
                            <div className="font-bold text-green-600">5/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Teamwork</div>
                            <div className="font-bold text-green-600">4/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Communication</div>
                            <div className="font-bold text-green-600">5/5</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic">"Very helpful and always ready to support team members"</p>
                      </div>
                    </div>
                  </div>
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
              <button onClick={handleCreateFeedback} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
