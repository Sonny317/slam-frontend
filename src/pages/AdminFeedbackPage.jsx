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
  const [allEvents, setAllEvents] = useState([]); // 피드백이 있는 이벤트들
  const [allAvailableEvents, setAllAvailableEvents] = useState([]); // 모든 이벤트 (Create 모달용)
  const [selectedEventId, setSelectedEventId] = useState('');
  const [movedToPast, setMovedToPast] = useState(new Set()); // Past로 이동된 이벤트 ID들
  const [showPerformanceCriteria, setShowPerformanceCriteria] = useState(false); // Performance 기준 표시 여부
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
  const [feedbackDetails, setFeedbackDetails] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetails, setGameDetails] = useState([]);
  const [showGameDetails, setShowGameDetails] = useState(false);

  // 사용자 역할 확인 (useEffect에 추가)
  useEffect(() => {
    // 사용자 역할 가져오기 (올바른 API 엔드포인트 사용)
    axios.get('/api/users/me').then(res => {
      setUserRole(res.data.role);
    }).catch(error => {
      console.error('Failed to fetch user role:', error);
      setUserRole('member');
    });
  }, []);

  // 지부 필터링 로직
  const filteredEvents = useMemo(() => {
    const eventsToFilter = activeTab === 'past' ? pastEvents : events;
    if (selectedBranch === 'all') return eventsToFilter;
    return eventsToFilter.filter(event => event.branch === selectedBranch);
  }, [selectedBranch, events, pastEvents, activeTab]);

  useEffect(() => {
    // Load events with feedback from backend
    axios.get('/api/feedback/events').then(res => {
      const eventsWithFeedback = res.data || [];
      setAllEvents(eventsWithFeedback); // 피드백이 있는 이벤트들
    }).catch(() => {
      setAllEvents([]);
    });
    
    // Load all events for feedback creation (only current/upcoming events)
    axios.get('/api/admin/events').then(res => {
      const allEvents = res.data || [];
      const now = new Date();
      // 현재 진행 중이거나 미래의 이벤트만 필터링
      const currentAndUpcomingEvents = allEvents.filter(e => new Date(e.eventDateTime) >= now);
      setAllAvailableEvents(currentAndUpcomingEvents);
    }).catch(err => {
      console.error('Failed to load all events:', err);
      setAllAvailableEvents([]);
    });
    
    // Load all games for event assignment
    axios.get('/api/admin/games').then(res => {
      console.log('Games loaded:', res.data);
      setAllGames(res.data || []);
    }).catch(err => {
      console.error('Failed to load games:', err);
      setAllGames([]);
    });
  }, []);

  // movedToPast 상태가 변경될 때마다 이벤트 분류
  useEffect(() => {
    if (allEvents.length > 0) {
      const upcoming = allEvents.filter(event => !movedToPast.has(event.id || event.eventId));
      const past = allEvents.filter(event => movedToPast.has(event.id || event.eventId));
      
      setEvents(upcoming);
      setPastEvents(past);
    }
  }, [movedToPast, allEvents]);

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

  // Create New Feedback 처리 - 피드백 폼 생성
  const handleCreateFeedback = async () => {
    if (!newFeedbackForm.eventId || newFeedbackForm.games.length === 0) {
      alert('Please select an event and at least one game.');
      return;
    }
    
    try {
      // 피드백 폼 생성 (이벤트에 게임 할당)
      await axios.post(`/api/admin/events/${newFeedbackForm.eventId}/games`, newFeedbackForm.games);
      alert('Feedback form created successfully! Games have been assigned to the event.');
      
      // 모달 닫기 및 폼 초기화
      setShowCreateModal(false);
      setNewFeedbackForm({ eventId: '', games: [] });
      
      // 피드백이 있는 이벤트 목록을 다시 로드하여 UI 업데이트
      const res = await axios.get('/api/feedback/events');
      const eventsWithFeedback = res.data || [];
      setAllEvents(eventsWithFeedback);
    } catch (err) {
      alert('Failed to create feedback form: ' + (err?.response?.data || err?.message || 'Unknown error'));
    }
  };

  // 이벤트를 Past feedback으로 이동
  const handleMoveToPast = (eventId) => {
    if (!window.confirm('Are you sure you want to move this event to Past Feedback? This will archive the event.')) {
      return;
    }
    
    // Past로 이동된 이벤트 ID에 추가
    setMovedToPast(prev => new Set([...prev, eventId]));
    
    // 선택된 이벤트가 이동된 경우 선택 해제
    if (selectedEventId === eventId) {
      setSelectedEventId('');
      setSummary(null);
      setGameRows([]);
      setFeedbackDetails([]);
      setShowDetails(false);
    }
    
    alert('Event moved to Past Feedback successfully!');
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
        setFeedbackDetails([]);
        setShowDetails(false);
      }
      
      // 피드백이 있는 이벤트 목록을 다시 로드하여 UI 업데이트
      const res = await axios.get('/api/feedback/events');
      const eventsWithFeedback = res.data || [];
      setAllEvents(eventsWithFeedback);
    } catch (error) {
      alert('Failed to delete feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  // 이벤트 삭제 처리
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also delete all associated feedback and cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/events/${eventId}`);
      alert('Event deleted successfully!');
      
      // 이벤트 목록에서 제거
      setEvents(prev => prev.filter(e => (e.id || e.eventId) !== eventId));
      setPastEvents(prev => prev.filter(e => (e.id || e.eventId) !== eventId));
      
      // 선택된 이벤트가 삭제된 경우 선택 해제
      if (selectedEventId === eventId) {
        setSelectedEventId('');
        setSummary(null);
        setGameRows([]);
      }
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
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

  // 피드백 상세 정보 로드
  const loadFeedbackDetails = async (eventId) => {
    // UI 업데이트를 즉시 실행하고 무거운 작업은 다음 이벤트 루프로 지연
    setTimeout(async () => {
      try {
        const response = await axios.get(`/api/feedback/event/${eventId}/details`);
        setFeedbackDetails(response.data || []);
        setShowDetails(true);
      } catch (error) {
        console.error('Failed to load feedback details:', error);
        setFeedbackDetails([]);
      }
    }, 0);
  };

  // 게임 상세 정보 로드
  const loadGameDetails = async (gameId) => {
    try {
      const response = await axios.get(`/api/feedback/event/${selectedEventId}/game/${gameId}/details`);
      setGameDetails(response.data || []);
      setSelectedGame(gameId);
      setShowGameDetails(true);
    } catch (error) {
      console.error('Failed to load game details:', error);
      setGameDetails([]);
    }
  };

  // CSV 다운로드 함수
  const downloadFeedbackCSV = async (data) => {
    if (!data || data.length === 0) {
      alert('No data to download');
      return;
    }

    // 선택된 게임만 가져오기 (gameRows에서)
    let gameIds = new Set();
    
    // gameRows에서 실제로 선택된 게임 ID만 수집
    if (gameRows && gameRows.length > 0) {
      gameRows.forEach(game => {
        if (game.gameId) {
          gameIds.add(game.gameId);
        }
      });
    }
    
    // gameRows가 없으면 피드백 데이터에서 게임 ID 수집
    if (gameIds.size === 0) {
      data.forEach(feedback => {
        if (feedback.gameRatings && typeof feedback.gameRatings === 'object') {
          Object.keys(feedback.gameRatings).forEach(gameId => {
            if (gameId && gameId !== 'null' && gameId !== 'undefined') {
              gameIds.add(gameId);
            }
          });
        }
      });
    }

    // CSV 헤더 생성
    const headers = [
      'Response #',
      // Step 1: 기본 평점
      'Overall Rating',
      'Participants Fit',
      'Interaction Opportunity',
      // Step 1 추가 질문들
      'Leadership Interest',
      'Leadership Instagram ID',
      'Reels Participation',
      'Reels Instagram ID',
      // Step 2: 게임별 평점 및 피드백
      ...Array.from(gameIds).flatMap(gameId => [
        `Game ${gameId} Rating`,
        `Game ${gameId} Positive`,
        `Game ${gameId} Negative`,
        `Game ${gameId} Own Feedback`
      ]),
      // Step 3: 활동
      'Top 3 Activities',
      'What they liked most (6)',
      'Suggestions for improvement (6)',
      'Submitted Date'
    ];

    // 각 피드백별 게임 데이터 가져오기
    const csvData = await Promise.all(data.map(async (feedback, index) => {
      const row = [
        index + 1,
        // Step 1: 기본 평점
        feedback.overall || '',
        feedback.participantsFit || '',
        feedback.interactionOpportunity || '',
        // Step 1 추가 질문들
        feedback.leadershipInterest && feedback.leadershipInterest.startsWith('yes') ? 'Yes' : 'No',
        feedback.leadershipInterest && feedback.leadershipInterest.includes(':') ? feedback.leadershipInterest.split(':')[1] : '',
        feedback.reelsParticipation && feedback.reelsParticipation.startsWith('yes') ? 'Yes' : 'No',
        feedback.reelsParticipation && feedback.reelsParticipation.includes(':') ? feedback.reelsParticipation.split(':')[1] : '',
      ];

      // Step 2: 게임별 데이터 (Step 3과 같은 방식으로 처리)
      for (const gameId of Array.from(gameIds)) {
        let rating = '';
        let positiveOptions = [];
        let negativeOptions = [];
        let ownFeedback = '';
        
        // Step 3과 같은 방식으로 직접 접근
        if (feedback.gameRatings && feedback.gameRatings[gameId]) {
          rating = feedback.gameRatings[gameId];
        }
        
        if (feedback.gameNotes && feedback.gameNotes[gameId]) {
          const gameNote = feedback.gameNotes[gameId];
          
          if (Array.isArray(gameNote)) {
            // Positive/Negative 옵션과 Custom Feedback 분리
            const positiveOptionsList = ['Fun & engaging', 'Helped me connect', 'Right duration'];
            const negativeOptionsList = ['Boring', 'Group size issue (too many/few)', 'Confusing / unclear'];
            
            gameNote.forEach(note => {
              if (positiveOptionsList.some(option => note.includes(option))) {
                positiveOptions.push(note);
              } else if (negativeOptionsList.some(option => note.includes(option))) {
                negativeOptions.push(note);
              } else {
                // 옵션이 아닌 실제 커스텀 피드백
                ownFeedback = note;
              }
            });
          }
        }

        // Step 3과 같은 방식으로 데이터 추가
        row.push(
          rating || '',
          positiveOptions.join('; ') || '',
          negativeOptions.join('; ') || '',
          ownFeedback || ''
        );
      }

      // Step 3: 활동
      row.push(
        feedback.top3Activities || '',
        feedback.goodPoints || '',
        feedback.improvements || '',
        new Date(feedback.createdAt).toLocaleDateString()
      );

      return row;
    }));

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // BOM 추가 (한글 지원)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                {filteredEvents.map((event, index) => (
                  <li key={`filtered-event-${event.eventId || event.id || index}-${event.eventTitle || 'untitled'}`} className="p-4 border rounded-lg sm:flex justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-900">{event.eventTitle}</p>
                      <p className="text-sm text-gray-600"><span className="font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{event.branch}</span> | {new Date(event.eventDateTime || event.date).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => generateQrUrl(event, 'member')} className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">Member QR</button>
                      <button onClick={() => generateQrUrl(event, 'staff')} className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">Staff QR</button>
                      <button onClick={() => {
                        setSelectedEventId(event.id || event.eventId);
                        loadFeedbackDetails(event.id || event.eventId);
                      }} className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200">View Details</button>
                      <button onClick={() => handleMoveToPast(event.id || event.eventId)} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200">Move to Past</button>
                      <button onClick={() => handleDeleteFeedback(event.id || event.eventId)} className="text-sm bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200">Delete Feedback</button>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Submissions</div>
                        <div className="text-2xl font-bold text-blue-600">{summary.count}</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Overall Rating</div>
                        <div className="text-2xl font-bold text-yellow-500">{Number(summary.overallAvg).toFixed(1)} ★</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Response Rate</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {summary.responseRate !== undefined ? `${summary.responseRate.toFixed(1)}%` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-500">Participants Fit</div>
                          <div className="text-xl font-bold text-gray-700">
                            {summary.participantsFitAvg ? Number(summary.participantsFitAvg).toFixed(1) : 'N/A'} ★
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-500">Interaction Opportunity</div>
                          <div className="text-xl font-bold text-gray-700">
                            {summary.interactionOpportunityAvg ? Number(summary.interactionOpportunityAvg).toFixed(1) : 'N/A'} ★
                          </div>
                        </div>
                    </div>


                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500">No feedback data available yet.</p>
                  </div>
                )}

                {/* Game Ratings Section */}
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
                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Custom Feedback</th>
                            <th className="px-4 py-3 text-left text-gray-600 font-medium flex items-center gap-2">
                              Performance
                              <button 
                                onClick={() => setShowPerformanceCriteria(!showPerformanceCriteria)}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                                title="Rating Criteria"
                              >
                                ℹ️
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {gameRows.map((g,i)=>{
                            const gameName = allGames.find(game => game.gameId === g.gameId)?.name || g.gameId;
                            const rating = Number(g.rating);
                            const performance = rating >= 4.5 ? '🔥 Excellent' : rating >= 4.0 ? '👍 Good' : rating >= 3.5 ? '👌 Average' : '⚠️ Needs Improvement';
                            
                            return (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  <button 
                                    onClick={() => loadGameDetails(g.gameId)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {gameName}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-yellow-500 font-bold text-lg">{rating.toFixed(1)} ★</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{g.customFeedbackCount || 'N/A'}</td>
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

                  {/* Performance Criteria Modal */}
                  {showPerformanceCriteria && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => setShowPerformanceCriteria(false)}>
                      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">📊 Rating Criteria</h3>
                          <button 
                            onClick={() => setShowPerformanceCriteria(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                          >
                            ×
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="border-l-4 border-orange-500 pl-4">
                            <h4 className="font-semibold text-orange-700">🔥 Excellent (4.5 - 5.0)</h4>
                            <p className="text-sm text-gray-600">Outstanding performance with high participant satisfaction</p>
                          </div>
                          
                          <div className="border-l-4 border-green-500 pl-4">
                            <h4 className="font-semibold text-green-700">👍 Good (4.0 - 4.4)</h4>
                            <p className="text-sm text-gray-600">Generally satisfactory performance</p>
                          </div>
                          
                          <div className="border-l-4 border-yellow-500 pl-4">
                            <h4 className="font-semibold text-yellow-700">👌 Average (3.5 - 3.9)</h4>
                            <p className="text-sm text-gray-600">Moderate satisfaction level</p>
                          </div>
                          
                          <div className="border-l-4 border-red-500 pl-4">
                            <h4 className="font-semibold text-red-700">⚠️ Needs Improvement (0.0 - 3.4)</h4>
                            <p className="text-sm text-gray-600">Participants were dissatisfied with the game</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top 3 Activities Section */}
                {summary && summary.top3Activities && summary.top3Activities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Top 3 Activities Analysis
                    </h4>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Activity Frequency Chart */}
                        <div>
                          <h5 className="font-medium text-blue-700 mb-4 flex items-center">
                            <span className="mr-2">📈</span>
                            Activity Frequency
                          </h5>
                          <div className="space-y-3">
                            {(() => {
                              // 모든 활동을 수집하고 빈도 계산
                              console.log('Summary top3Activities:', summary.top3Activities);
                              const allActivities = [];
                              summary.top3Activities.forEach(activities => {
                                if (activities && typeof activities === 'string') {
                                  const activityList = activities.split(',').map(a => a.trim()).filter(a => a);
                                  console.log('Activity list from:', activities, '->', activityList);
                                  allActivities.push(...activityList);
                                }
                              });
                              
                              // 디버깅을 위해 현재 선택 가능한 활동들도 확인
                              console.log('Available activities from form:', [
                                '🧺 Picnic in the Park',
                                '🎤 Karaoke Nights', 
                                '🎲 Board Game Nights',
                                '🎵 EDM festival & Night club',
                                '🧗 Bouldering & Running crew',
                                '🏖️ Going to the beach',
                                '🥾 Hiking & Nature walks',
                                '✈️ 2-day Taiwan traveling',
                                '🍻 Drink at a bar',
                                '🗣️ Language Exchange meetups',
                                '🎳 Go Bowling',
                                '🍖 BBQ night'
                              ]);
                              
                              // 테스트용: 이모지가 포함된 활동명이 제대로 처리되는지 확인
                              console.log('Sample activity with emoji:', '🎳 Go Bowling');
                              console.log('Activity name length:', '🎳 Go Bowling'.length);
                              console.log('First character (emoji):', '🎳 Go Bowling'.charAt(0));
                              console.log('All activities collected:', allActivities);
                              
                              // 빈도 계산
                              const activityCount = {};
                              allActivities.forEach(activity => {
                                activityCount[activity] = (activityCount[activity] || 0) + 1;
                              });
                              console.log('Activity count:', activityCount);
                              
                              // 빈도순으로 정렬
                              const sortedActivities = Object.entries(activityCount)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 10); // 상위 10개만 표시
                              console.log('Sorted activities:', sortedActivities);
                              
                              const maxCount = sortedActivities.length > 0 ? Math.max(...sortedActivities.map(([,count]) => count)) : 1;
                              
                              if (sortedActivities.length === 0) {
                                return (
                                  <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p>No activity data available yet.</p>
                                    <p className="text-sm mt-2">Members need to submit feedback with their top 3 activities.</p>
                                  </div>
                                );
                              }
                              
                              return sortedActivities.map(([activity, count]) => {
                                const percentage = (count / allActivities.length) * 100;
                                const barWidth = (count / maxCount) * 100;
                                console.log('Displaying activity in chart:', activity, 'with count:', count);
                                
                                return (
                                  <div key={activity} className="flex items-center space-x-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate flex items-center space-x-2">
                                        <span className="text-lg">{activity}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {count} times ({percentage.toFixed(1)}%)
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                          style={{ width: `${barWidth}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* Right Side - Top 3 List */}
                        <div>
                          <h5 className="font-medium text-purple-700 mb-4 flex items-center">
                            <span className="mr-2">🏆</span>
                            Top 3 Activities
                          </h5>
                          <div className="space-y-4">
                            {(() => {
                              // 모든 활동을 수집하고 빈도 계산
                              const allActivities = [];
                              summary.top3Activities.forEach(activities => {
                                if (activities && typeof activities === 'string') {
                                  const activityList = activities.split(',').map(a => a.trim()).filter(a => a);
                                  allActivities.push(...activityList);
                                }
                              });
                              
                              // 빈도 계산
                              const activityCount = {};
                              allActivities.forEach(activity => {
                                activityCount[activity] = (activityCount[activity] || 0) + 1;
                              });
                              
                              // 빈도순으로 정렬하고 상위 3개만 표시
                              const sortedActivities = Object.entries(activityCount)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3);
                              
                              return sortedActivities.map(([activity, count], index) => {
                                const percentage = (count / allActivities.length) * 100;
                                const rank = index + 1;
                                
                                return (
                                  <div key={activity} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-center space-x-4">
                                      {/* Rank Badge */}
                                      <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                          {rank}
                                        </div>
                                      </div>
                                      
                                      {/* Activity Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="text-2xl">
                                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                          </span>
                                          <h6 className="text-lg font-bold text-gray-900 truncate">
                                            {activity}
                                          </h6>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-semibold text-purple-600">{count} times</span>
                                          <span className="mx-2">•</span>
                                          <span className="text-gray-500">{percentage.toFixed(1)}% of responses</span>
                                        </div>
                                      </div>
                                      
                                      {/* Decorative Icon */}
                                      <div className="flex-shrink-0 text-3xl opacity-60">
                                        {rank === 1 ? '👑' : rank === 2 ? '⭐' : '✨'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Outing Suggestions Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h5 className="font-medium text-green-700 mb-4 flex items-center">
                          <span className="mr-2">🎯</span>
                          Outing Suggestions
                        </h5>
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(() => {
                              // 모든 활동을 수집하고 빈도 계산
                              const allActivities = [];
                              summary.top3Activities.forEach(activities => {
                                if (activities && typeof activities === 'string') {
                                  const activityList = activities.split(',').map(a => a.trim()).filter(a => a);
                                  allActivities.push(...activityList);
                                }
                              });
                              
                              // 빈도 계산
                              const activityCount = {};
                              allActivities.forEach(activity => {
                                activityCount[activity] = (activityCount[activity] || 0) + 1;
                              });
                              
                              // 빈도순으로 정렬하고 상위 3개만 표시
                              const sortedActivities = Object.entries(activityCount)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 3);
                              
                              // 활동별 추천 장소 및 팁 (Taipei, Taiwan 기반)
                              const getSuggestions = (activity, rank) => {
                                // 이모지가 포함된 활동명에서 이모지 제거
                                const cleanActivity = activity.replace(/^[^\w\s]+/, '').trim();
                                console.log('Clean activity name:', cleanActivity);
                                
                                const suggestions = {
                                  'Picnic in the Park': {
                                    places: ['Daan Forest Park', 'Xiangshan Hiking Trail', 'Riverside Park'],
                                    tips: ['Check weather forecast', 'Bring portable chairs', 'Prepare mosquito repellent'],
                                    emoji: '🧺'
                                  },
                                  'Karaoke Nights': {
                                    places: ['KT Happy Music Japanese Karaoke', 'Party World KTV', 'Cashbox KTV'],
                                    tips: ['Book in advance', 'Bring ID for verification', 'Prepare popular songs list'],
                                    emoji: '🎤'
                                  },
                                  'Board Game Nights': {
                                    places: ['Board Game Cafe', 'Cafe & Game Space', 'Member\'s home'],
                                    tips: ['Bring various games', 'Prepare snacks', 'Allocate enough time'],
                                    emoji: '🎲'
                                  },
                                  'EDM festival & Night club': {
                                    places: ['OMNI Nightclub', 'AI Nightclub', 'Wave Club'],
                                    tips: ['Dress code required', 'Bring valid ID', 'Check event schedule'],
                                    emoji: '🎵'
                                  },
                                  'Bouldering & Running crew': {
                                    places: ['B-Pump Climbing Gym', 'Taipei Riverside', 'Elephant Mountain'],
                                    tips: ['Wear proper gear', 'Bring water bottle', 'Warm up before activity'],
                                    emoji: '🧗'
                                  },
                                  'Going to the beach': {
                                    places: ['Fulong Beach', 'Baishawan Beach', 'Wanli Beach'],
                                    tips: ['Check weather conditions', 'Bring sunscreen', 'Prepare beach essentials'],
                                    emoji: '🏖️'
                                  },
                                  'Hiking & Nature walks': {
                                    places: ['Yangmingshan National Park', 'Elephant Mountain', 'Xiangshan Trail'],
                                    tips: ['Wear comfortable shoes', 'Bring water and snacks', 'Check trail conditions'],
                                    emoji: '🥾'
                                  },
                                  '2-day Taiwan traveling': {
                                    places: ['Yilan', 'Tamshui', 'Keelung'],
                                    tips: ['Book accommodation early', 'Plan transportation', 'Research local attractions'],
                                    emoji: '✈️'
                                  },
                                  'Drink at a bar': {
                                    places: ['Brass Monkey', 'Barcode', 'On tap'],
                                    tips: ['Check dress code', 'Bring valid ID', 'Set budget limit'],
                                    emoji: '🍻'
                                  },
                                  'Language Exchange meetups': {
                                    places: ['Cafe & Language Exchange', 'Community Centers', 'Online platforms'],
                                    tips: ['Prepare conversation topics', 'Bring language materials', 'Be open to learning'],
                                    emoji: '🗣️'
                                  },
                                  'Go Bowling': {
                                    places: ['Taipei Bowling Center', 'E7 play', 'AMF Bowling'],
                                    tips: ['Book lanes in advance', 'Wear comfortable clothes', 'Bring extra socks'],
                                    emoji: '🎳'
                                  },
                                  'BBQ night': {
                                    places: ['Riverside BBQ Area', 'Tamshui BBQ', 'BBQ Restaurant'],
                                    tips: ['Prepare ingredients', 'Check weather', 'Bring cooking utensils'],
                                    emoji: '🍖'
                                  }
                                };
                                
                                return suggestions[cleanActivity] || suggestions[activity] || {
                                  places: ['Various locations', 'Discuss with members', 'Online platforms'],
                                  tips: ['Plan in advance', 'Gather member opinions', 'Safety first'],
                                  emoji: '🎯'
                                };
                              };
                              
                              return sortedActivities.map(([activity, count], index) => {
                                const rank = index + 1;
                                console.log('Processing activity:', activity);
                                // 이모지가 포함된 활동명에서 이모지 제거
                                const cleanActivity = activity.replace(/^[^\w\s]+/, '').trim();
                                const suggestion = getSuggestions(activity, rank);
                                console.log('Suggestion for', activity, ':', suggestion);
                                
                                return (
                                  <div key={activity} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-2 mb-3">
                                      <span className="text-2xl">{suggestion.emoji}</span>
                                      <h6 className="font-semibold text-gray-900">{cleanActivity}</h6>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                        #{rank}
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div>
                                        <h7 className="text-sm font-medium text-gray-700 mb-1">📍 Recommended Places</h7>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {suggestion.places.map((place, idx) => (
                                            <li key={idx} className="flex items-center">
                                              <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                              {place}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <h7 className="text-sm font-medium text-gray-700 mb-1">💡 Preparation Tips</h7>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {suggestion.tips.map((tip, idx) => (
                                            <li key={idx} className="flex items-center">
                                              <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                                              {tip}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-600">💡</span>
                              <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> These recommendations are based on member preferences. 
                                Please discuss with members to choose the optimal location and time when planning actual events!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Participant Comments Section */}
                {summary && (summary.goodPoints || summary.improvements || summary.comments) && (
                  <div className="mt-6">
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
                            {summary.goodPoints.map((comment, index) => (
                              <div key={index} className="bg-green-50 border-l-4 border-green-200 p-3 rounded-r-lg">
                                <p className="text-sm text-green-800 italic">"{comment}"</p>
                              </div>
                            ))}
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
                            {summary.improvements.map((comment, index) => (
                              <div key={index} className="bg-orange-50 border-l-4 border-orange-200 p-3 rounded-r-lg">
                                <p className="text-sm text-orange-800 italic">"{comment}"</p>
                              </div>
                            ))}
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
            )}

            {/* 피드백 상세 정보 */}
            {showDetails && feedbackDetails.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Detailed Feedback Responses ({feedbackDetails.length} responses)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Response #</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Overall Rating</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Leadership Interest</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Reels Participation</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {feedbackDetails.map((feedback, index) => (
                        <tr key={feedback.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="text-yellow-500 font-bold text-lg">{feedback.overall || 0} ★</span>
                          </td>
                          <td className="px-4 py-3">
                            {feedback.leadershipInterest && feedback.leadershipInterest.startsWith('yes') ? (
                              <div className="text-green-600">
                                <div className="font-medium">Yes!</div>
                                {feedback.leadershipInterest.includes(':') && (
                                  <div className="text-xs text-gray-500">
                                    ID: {feedback.leadershipInterest.split(':')[1]}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {feedback.reelsParticipation && feedback.reelsParticipation.startsWith('yes') ? (
                              <div className="text-purple-600">
                                <div className="font-medium">Yes!</div>
                                {feedback.reelsParticipation.includes(':') && (
                                  <div className="text-xs text-gray-500">
                                    ID: {feedback.reelsParticipation.split(':')[1]}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hide Details
                  </button>
                  <button 
                    onClick={async () => await downloadFeedbackCSV(feedbackDetails)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    📥 Download CSV
                  </button>
                </div>
              </div>
            )}

            {/* 게임 상세 정보 모달 */}
            {showGameDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => setShowGameDetails(false)}>
                <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {allGames.find(game => game.gameId === selectedGame)?.name || selectedGame} - Detailed Feedback
                    </h2>
                    <button 
                      onClick={() => setShowGameDetails(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  {gameDetails.length > 0 ? (
                    <div>
                      {/* 게임 평점 요약 */}
                      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                        <div className="text-center">
                          <span className="text-sm text-gray-500">Average Game Rating:</span>
                          <div className="font-bold text-yellow-500 text-3xl">
                            {(gameDetails.reduce((sum, d) => sum + (d.rating || 0), 0) / gameDetails.length).toFixed(1)} ★
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Based on {gameDetails.length} feedback(s)
                          </div>
                        </div>
                      </div>

                      {/* Performance Analysis and Recommendations */}
                      {(() => {
                        const avgRating = gameDetails.reduce((sum, d) => sum + (d.rating || 0), 0) / gameDetails.length;
                        const performance = avgRating >= 4.5 ? '🔥 Excellent' : avgRating >= 4.0 ? '👍 Good' : avgRating >= 3.5 ? '👌 Average' : '⚠️ Needs Improvement';
                        
                        const getConsiderationsAndRecommendations = (rating) => {
                          if (rating >= 4.5) {
                            return {
                              considerations: [
                                "Participants were highly satisfied with the game",
                                "Overwhelmingly positive feedback received",
                                "Custom Feedback primarily contained positive comments"
                              ],
                              recommendations: [
                                "Consider using this game as a core game in future events",
                                "Document the game's execution as a best practice",
                                "Apply this game's success factors to other games"
                              ]
                            };
                          } else if (rating >= 4.0) {
                            return {
                              considerations: [
                                "Generally satisfactory performance",
                                "Most participants were satisfied",
                                "Some minor improvement areas identified"
                              ],
                              recommendations: [
                                "Maintain the game with minor adjustments",
                                "Address specific improvement points from Custom Feedback",
                                "Consider optimizing game duration or group size"
                              ]
                            };
                          } else if (rating >= 3.5) {
                            return {
                              considerations: [
                                "Moderate satisfaction level",
                                "Mixed feedback from participants",
                                "Clear improvement areas identified"
                              ],
                              recommendations: [
                                "Hold a team meeting to analyze game issues",
                                "Review Custom Feedback for common complaints",
                                "Consider modifying game rules or execution method"
                              ]
                            };
                          } else {
                            return {
                              considerations: [
                                "Participants were dissatisfied with the game",
                                "Significant negative feedback received",
                                "Major issues with game execution or design"
                              ],
                              recommendations: [
                                "Immediately hold a team meeting to address issues",
                                "Consider replacing the game entirely",
                                "Analyze Custom Feedback for root cause analysis",
                                "Review if game matches participant group characteristics"
                              ]
                            };
                          }
                        };

                        const { considerations, recommendations } = getConsiderationsAndRecommendations(avgRating);
                        
                        return (
                          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <span className="mr-2">📊</span>
                              Performance Analysis: {performance}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                                  <span className="mr-2">🔍</span>
                                  Considerations:
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {considerations.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-blue-500 mr-2">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-green-700 mb-3 flex items-center">
                                  <span className="mr-2">💡</span>
                                  Recommendations:
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                  {recommendations.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-green-500 mr-2">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Positive/Negative 피드백 그래프 */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Feedback Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Positive 피드백 */}
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-700 mb-3 flex items-center">
                              <span className="mr-2">👍</span>
                              Positive Feedback
                            </h4>
                            <div className="space-y-2">
                              {['Fun & engaging', 'Helped me connect', 'Right duration'].map(option => {
                                const count = gameDetails.filter(d => 
                                  d.positiveOptions && d.positiveOptions.includes(option)
                                ).length;
                                const percentage = gameDetails.length > 0 ? (count / gameDetails.length) * 100 : 0;
                                return (
                                  <div key={option} className="flex items-center justify-between">
                                    <span className="text-sm text-green-800">{option}</span>
                                    <div className="flex items-center">
                                      <div className="w-24 bg-green-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-green-600 h-2 rounded-full" 
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-green-600 w-8">{count}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Negative 피드백 */}
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-medium text-red-700 mb-3 flex items-center">
                              <span className="mr-2">👎</span>
                              Negative Feedback
                            </h4>
                            <div className="space-y-2">
                              {['Boring', 'Group size issue (too many/few)', 'Confusing / unclear'].map(option => {
                                const count = gameDetails.filter(d => 
                                  d.negativeOptions && d.negativeOptions.includes(option)
                                ).length;
                                const percentage = gameDetails.length > 0 ? (count / gameDetails.length) * 100 : 0;
                                return (
                                  <div key={option} className="flex items-center justify-between">
                                    <span className="text-sm text-red-800">{option}</span>
                                    <div className="flex items-center">
                                      <div className="w-24 bg-red-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-red-600 h-2 rounded-full" 
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-red-600 w-8">{count}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add your own feedback 섹션 */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Custom Feedback</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {gameDetails
                            .filter(d => d.customFeedback && d.customFeedback.trim())
                            .map((detail, index) => (
                            <div key={detail.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-700 italic">"{detail.customFeedback}"</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Submitted by: {detail.submittedBy} | {new Date(detail.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                          {gameDetails.filter(d => d.customFeedback && d.customFeedback.trim()).length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                              No custom feedback provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No detailed feedback available for this game.
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
                          {summary.responseRate !== undefined ? `${summary.responseRate.toFixed(1)}%` : 'N/A'}
                        </div>
                      </div>
                    </div>


                    {/* Top 3 Activities Section for Past Events */}
                    {summary && summary.top3Activities && summary.top3Activities.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <span className="mr-2">📊</span>
                          Top 3 Activities Analysis
                        </h4>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side - Activity Frequency Chart */}
                            <div>
                              <h5 className="font-medium text-blue-700 mb-4 flex items-center">
                                <span className="mr-2">📈</span>
                                Activity Frequency
                              </h5>
                              <div className="space-y-3">
                                {(() => {
                                  // 모든 활동을 수집하고 빈도 계산
                                  const allActivities = [];
                                  summary.top3Activities.forEach(activities => {
                                    if (activities && typeof activities === 'string') {
                                      const activityList = activities.split(',').map(a => a.trim()).filter(a => a);
                                      allActivities.push(...activityList);
                                    }
                                  });
                                  
                                  // 빈도 계산
                                  const activityCount = {};
                                  allActivities.forEach(activity => {
                                    activityCount[activity] = (activityCount[activity] || 0) + 1;
                                  });
                                  
                                  // 빈도순으로 정렬
                                  const sortedActivities = Object.entries(activityCount)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 10); // 상위 10개만 표시
                                  
                                  const maxCount = Math.max(...sortedActivities.map(([,count]) => count));
                                  
                                  return sortedActivities.map(([activity, count]) => {
                                    const percentage = (count / allActivities.length) * 100;
                                    const barWidth = (count / maxCount) * 100;
                                    
                                    return (
                                      <div key={activity} className="flex items-center space-x-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 truncate">
                                            {activity}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {count} times ({percentage.toFixed(1)}%)
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                              style={{ width: `${barWidth}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Right Side - Top 3 List */}
                            <div>
                              <h5 className="font-medium text-purple-700 mb-4 flex items-center">
                                <span className="mr-2">🏆</span>
                                Top 3 Activities
                              </h5>
                              <div className="space-y-4">
                                {(() => {
                                  // 모든 활동을 수집하고 빈도 계산
                                  const allActivities = [];
                                  summary.top3Activities.forEach(activities => {
                                    if (activities && typeof activities === 'string') {
                                      const activityList = activities.split(',').map(a => a.trim()).filter(a => a);
                                      allActivities.push(...activityList);
                                    }
                                  });
                                  
                                  // 빈도 계산
                                  const activityCount = {};
                                  allActivities.forEach(activity => {
                                    activityCount[activity] = (activityCount[activity] || 0) + 1;
                                  });
                                  
                                  // 빈도순으로 정렬하고 상위 3개만 표시
                                  const sortedActivities = Object.entries(activityCount)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 3);
                                  
                                  return sortedActivities.map(([activity, count], index) => {
                                    const percentage = (count / allActivities.length) * 100;
                                    const rank = index + 1;
                                    
                                    return (
                                      <div key={activity} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                          {/* Rank Badge */}
                                          <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                              {rank}
                                            </div>
                                          </div>
                                          
                                          {/* Activity Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <span className="text-2xl">
                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                                              </span>
                                              <h6 className="text-lg font-bold text-gray-900 truncate">
                                                {activity}
                                              </h6>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              <span className="font-semibold text-purple-600">{count} times</span>
                                              <span className="mx-2">•</span>
                                              <span className="text-gray-500">{percentage.toFixed(1)}% of responses</span>
                                            </div>
                                          </div>
                                          
                                          {/* Decorative Icon */}
                                          <div className="flex-shrink-0 text-3xl opacity-60">
                                            {rank === 1 ? '👑' : rank === 2 ? '⭐' : '✨'}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
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
                            <th className="px-3 py-2 text-left text-gray-600">Custom Feedback</th>
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
                              <td className="px-3 py-2">{g.customFeedbackCount || 'N/A'}</td>
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


      </div>
      {/* Create New Feedback Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={() => {
          setShowCreateModal(false);
          setNewFeedbackForm({ eventId: '', games: [] });
        }}>
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
                  {allAvailableEvents.map(event => (
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
              <button onClick={() => {
                setShowCreateModal(false);
                setNewFeedbackForm({ eventId: '', games: [] });
              }} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
