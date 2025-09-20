// src/pages/FeedbackFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
// import { useUser } from '../context/UserContext'; // 실제 사용 시 주석 해제

// --- 별점 컴포넌트 (재사용) ---
const StarRating = ({ rating, setRating }) => (
  <div className="flex justify-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className={`text-4xl transition-transform transform hover:scale-110 ${
          star <= rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

// --- 실제 API 함수 ---
const fetchEventDetails = async (eventId, branch, role) => {
  console.log(`Fetching data for eventId: ${eventId}, branch: ${branch}, role: ${role}`);
  try {
    // 이벤트 정보 가져오기
    const eventResponse = await axios.get(`/api/admin/events`);
    const event = eventResponse.data.find(e => String(e.id) === String(eventId));
    
    if (!event) {
      throw new Error('Event not found');
    }

    // 이벤트에 할당된 게임 목록 가져오기
    const gamesResponse = await axios.get(`/api/admin/events/${eventId}/games`);
    const games = gamesResponse.data || [];
    
    console.log('Event games loaded:', games);

    return {
      eventTitle: event.title,
      eventDate: event.eventDateTime || event.date,
      games: games
    };
  } catch (error) {
    console.error('Failed to fetch event details:', error);
    // 폴백으로 기본값 설정
    return {
      eventTitle: `${branch} Event #${eventId}`,
      eventDate: "2024-12-20",
      games: []
    };
  }
};
// --------------------

export default function FeedbackFormPage() {
  const location = useLocation();
  const params = useParams();
  // const { user } = useUser(); // 실제 사용 시 주석 해제
  const user = { isLoggedIn: true }; // 임시 사용자 데이터

  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
  
  // 전체 이벤트 평점
  const [overallRating, setOverallRating] = useState(0);
  const [participantsFit, setParticipantsFit] = useState(0);
  const [interactionOpportunity, setInteractionOpportunity] = useState(0);
  
  // 새로운 질문들
  const [leadershipInterest, setLeadershipInterest] = useState('');
  const [reelsParticipation, setReelsParticipation] = useState('');
  
  const ACTIVITIES = [
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
  ];
  const [selectedActivities, setSelectedActivities] = useState([]);
  // 게임별 평점 (객체 형태로 관리)
  const [gameRatings, setGameRatings] = useState({});
  // 게임별 메모 (객체 형태로 관리)
  const [gameNotes, setGameNotes] = useState({});
  // 게임별 스킵 상태 (객체 형태로 관리)
  const [skippedGames, setSkippedGames] = useState({});
  
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 변경 시 스크롤을 맨 위로 이동 (eventDetails가 로드된 후에만)
  useEffect(() => {
    if (eventDetails && !loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, eventDetails, loading]);

  // URL 쿼리 파라미터 파싱
  const queryParams = new URLSearchParams(location.search);
  const eventId = params.eventId || queryParams.get('eventId');
  const branch = queryParams.get('branch');
  const role = queryParams.get('role') || 'member';
  
  // Staff role에 대한 self/peer 선택
  const [staffType, setStaffType] = useState(''); // 'self' or 'peer'

  useEffect(() => {
    if (eventId && branch && role) {
      setLoading(true);
      fetchEventDetails(eventId, branch, role)
        .then(data => {
          console.log('Event details loaded:', data);
          console.log('Games count:', data.games ? data.games.length : 0);
          console.log('Games data:', data.games);
          setEventDetails(data);
          // 게임 평점 상태를 초기화합니다. (모든 게임 0점)
          const initialGameRatings = data.games.reduce((acc, game) => {
            acc[game.gameId] = 0;
            return acc;
          }, {});
          setGameRatings(initialGameRatings);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch event details", err);
          setLoading(false);
        });
    }
  }, [eventId, branch, role]);

  const handleGameRatingChange = (gameId, rating) => {
    setGameRatings(prevRatings => ({
      ...prevRatings,
      [gameId]: rating
    }));
  };

  const handleGameNotesChange = (gameId, notes) => {
    setGameNotes(prevNotes => ({
      ...prevNotes,
      [gameId]: Array.isArray(notes) ? notes : [notes]
    }));
  };

  // 게임 스킵 처리
  const handleGameSkip = (gameId, isSkipped) => {
    setSkippedGames(prev => ({
      ...prev,
      [gameId]: isSkipped
    }));
    
    // 스킵된 경우 평점과 메모 초기화
    if (isSkipped) {
      setGameRatings(prev => ({
        ...prev,
        [gameId]: 0
      }));
      setGameNotes(prev => ({
        ...prev,
        [gameId]: []
      }));
    }
  };

  // 대칭 선택: Fun & engaging ↔ Boring만 적용
  const getOppositeTag = (tag) => {
    const opposites = {
      // 재미/흥미 vs 지루함 (대칭 선택)
      'Fun & engaging': 'Boring',
      'Boring': 'Fun & engaging'
      // 나머지는 자유 선택 (대칭 제한 없음)
    };
    return opposites[tag] || null;
  };

  // 단계별 네비게이션
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return overallRating > 0 && participantsFit > 0 && interactionOpportunity > 0;
    }
    if (currentStep === 2) {
      // 게임이 없으면 바로 진행 가능
      if (eventDetails.games.length === 0) {
        return true;
      }
      // 게임이 있으면 모든 게임에 대해 평점이 입력되었거나 스킵되었어야 함
      return eventDetails.games.every(game => {
        const rating = gameRatings[game.gameId];
        const isSkipped = skippedGames && skippedGames[game.gameId];
        return (rating && rating > 0) || isSkipped;
      });
    }
    if (currentStep === 3) {
      // Step 3에서는 최소 3개의 활동을 선택해야 함
      return selectedActivities.length >= 3;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (overallRating === 0) {
      alert("Please provide an overall star rating for the event!");
      return;
    }
    const top3Activities = selectedActivities.slice(0,3).join(',');
    const payload = {
      eventId: Number(eventId),
      overall: overallRating,
      participantsFit,
      interactionOpportunity,
      leadershipInterest,
      reelsParticipation,
      top3Activities,
      goodPoints,
      improvements,
      comment: `Top 3 Activities: ${top3Activities}\nGood Points: ${goodPoints}\nImprovements: ${improvements}`,
      gameRatings,
      gameNotes,
      skippedGames,
      participantCount: eventDetails.participantCount || 0, // 인원수 정보 추가
      eventContext: {
        weather: eventDetails.weather,
        venue: eventDetails.venue,
        timeOfDay: eventDetails.timeOfDay,
        specialCircumstances: eventDetails.specialCircumstances
      }
    };
    axios.post('/api/feedback/member/submit', payload)
      .then(() => setIsSubmitted(true))
      .catch((err) => alert('Failed to submit feedback: ' + (err?.response?.data?.error || err?.message || 'unknown')));
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading feedback form...</p></div>;
  }

  if (!eventDetails) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Invalid feedback link. Please check the QR code.</p></div>;
  }
  
  // 로그인 안 된 사용자 처리 (기존 코드와 동일)
  if (!user?.isLoggedIn) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
         <div>
           <h1 className="text-2xl font-bold text-gray-800 mb-4">Login required</h1>
           <p className="text-gray-600 mb-6">Please log in to submit feedback.</p>
           <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Log in</Link>
         </div>
       </div>
     );
  }

  // Staff role에서 self/peer 선택이 필요한 경우
  if (role === 'staff' && !staffType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">Staff Feedback</h1>
          <p className="text-gray-600 mb-8">Choose the type of feedback form:</p>
          <div className="space-y-4">
            <button 
              onClick={() => setStaffType('self')} 
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Self Evaluation
            </button>
            <button 
              onClick={() => setStaffType('peer')} 
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Peer Evaluation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Your feedback for <span className="font-semibold text-indigo-600">{eventDetails.eventTitle}</span> has been submitted successfully.
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🏠 Back to Home
            </Link>
            <Link 
              to="/events" 
              className="block w-full py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              📅 View More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Event Feedback</h1>
          <p className="text-gray-600 mt-2">for <span className="font-semibold text-indigo-600">{eventDetails.eventTitle}</span></p>
          
          {/* 단계별 진행 표시기 */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Step {currentStep} of 3
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Overall Event Rating */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-center text-lg font-medium text-gray-700 mb-3">How would you rate the overall event?</label>
                <StarRating rating={overallRating} setRating={setOverallRating} />
              </div>

              {/* 추가 지표 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-center text-base font-medium text-gray-700 mb-2">Participants fit</label>
                  <StarRating rating={participantsFit} setRating={setParticipantsFit} />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-center text-base font-medium text-gray-700 mb-2">Interaction opportunity</label>
                  <StarRating rating={interactionOpportunity} setRating={setInteractionOpportunity} />
                </div>
              </div>

              {/* 새로운 질문들 - 영어로 변경 */}
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    🌟 Are you interested in leading a SLAM sub-community?
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Examples: Running crew, Sports meetups, Hiking group, Cultural exchange, etc.
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-start">
                      <input
                        type="radio"
                        name="leadership"
                        value="yes"
                        checked={leadershipInterest.startsWith('yes')}
                        onChange={(e) => setLeadershipInterest(e.target.value)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <span className="font-medium">Yes, I'm interested!</span>
                        {leadershipInterest.startsWith('yes') && (
                          <input
                            type="text"
                            placeholder="Your Instagram ID for contact"
                            value={leadershipInterest.includes(':') ? leadershipInterest.split(':')[1] : ''}
                            className="mt-2 w-full p-2 border rounded-md text-sm"
                            onChange={(e) => setLeadershipInterest(`yes:${e.target.value}`)}
                          />
                        )}
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="leadership"
                        value="no"
                        checked={leadershipInterest === 'no'}
                        onChange={(e) => setLeadershipInterest(e.target.value)}
                        className="mr-3"
                      />
                      <span>Not right now</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    📹 Would you like to participate in SLAM Reels (Instagram videos)?
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start">
                      <input
                        type="radio"
                        name="reels"
                        value="yes"
                        checked={reelsParticipation.startsWith('yes')}
                        onChange={(e) => setReelsParticipation(e.target.value)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <span className="font-medium">Yes, I'd love to!</span>
                        {reelsParticipation.startsWith('yes') && (
                          <input
                            type="text"
                            placeholder="Your Instagram ID for contact"
                            value={reelsParticipation.includes(':') ? reelsParticipation.split(':')[1] : ''}
                            className="mt-2 w-full p-2 border rounded-md text-sm"
                            onChange={(e) => setReelsParticipation(`yes:${e.target.value}`)}
                          />
                        )}
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reels"
                        value="no"
                        checked={reelsParticipation === 'no'}
                        onChange={(e) => setReelsParticipation(e.target.value)}
                        className="mr-3"
                      />
                      <span>I prefer to stay behind the camera</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Game Ratings */}
          {currentStep === 2 && eventDetails && eventDetails.games && eventDetails.games.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-center text-xl font-semibold text-gray-800">How were the games?</h2>
              {console.log('Rendering Step 2 with games:', eventDetails.games)}
              {eventDetails.games.map(game => (
                <div key={game.gameId} className="p-4 border rounded-lg">
                  <div className="game-header mb-4">
                    <h3 className="text-lg font-medium text-gray-700 text-center">{game.name}</h3>
                    {game.description && (
                      <p className="text-sm text-gray-500 text-center mt-1">{game.description}</p>
                    )}
                    
                    {/* 게임 정보 표시 */}
                    <div className="game-info mt-2 text-xs text-gray-600 text-center">
                      {game.minPlayers && game.maxPlayers && (
                        <span className="mr-3">👥 {game.minPlayers}-{game.maxPlayers} players</span>
                      )}
                      {game.durationMinutes && (
                        <span className="mr-3">⏱️ {game.durationMinutes} min</span>
                      )}
                      {game.difficultyLevel && (
                        <span className="mr-3">📊 {game.difficultyLevel}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* 게임 스킵 옵션 */}
                  <div className="skip-section mb-4">
                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skippedGames[game.gameId] || false}
                        onChange={(e) => handleGameSkip(game.gameId, e.target.checked)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-red-600 font-medium">
                        ⚠️ We did not play this game
                      </span>
                    </label>
                  </div>

                  {/* 별점 평가 - 스킵된 경우 비활성화 */}
                  <div className={`rating-section mb-4 ${skippedGames[game.gameId] ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-center text-base font-medium text-gray-700 mb-3">
                      Rate this game
                    </label>
                    <StarRating 
                      rating={gameRatings[game.gameId]} 
                      setRating={(rating) => handleGameRatingChange(game.gameId, rating)}
                    />
                  </div>
                  
                  {/* 게임별 피드백 태그 - 스킵된 경우 비활성화 */}
                  <div className={`notes-section ${skippedGames[game.gameId] ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-4 mt-4">
                      📝 How was this game? <br />
                      (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 왼쪽: Positive 의견 */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-700 mb-2">👍 Positive</h4>
                        {[
                          'Fun & engaging',
                          'Helped me connect',
                          'Right duration'
                        ].map(tag => (
                          <label key={tag} className="flex items-center gap-2 p-2 border border-green-200 rounded-md cursor-pointer hover:bg-green-50">
                            <input
                              type="checkbox"
                              checked={gameNotes[game.gameId]?.includes(tag) || false}
                              onChange={(e) => {
                                const currentNotes = gameNotes[game.gameId] || [];
                                if (e.target.checked) {
                                  // 반대 의견이 선택된 경우 해제
                                  const oppositeTag = getOppositeTag(tag);
                                  const filteredNotes = currentNotes.filter(note => note !== oppositeTag);
                                  handleGameNotesChange(game.gameId, [...filteredNotes, tag]);
                                } else {
                                  handleGameNotesChange(game.gameId, currentNotes.filter(note => note !== tag));
                                }
                              }}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-green-800">{tag}</span>
                          </label>
                        ))}
                      </div>

                      {/* 오른쪽: Negative 의견 */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-700 mb-2">👎 Negative</h4>
                        {[
                          'Boring',
                          'Group size issue (too many/few)',
                          'Confusing / unclear'
                        ].map(tag => (
                          <label key={tag} className="flex items-center gap-2 p-2 border border-red-200 rounded-md cursor-pointer hover:bg-red-50">
                            <input
                              type="checkbox"
                              checked={gameNotes[game.gameId]?.includes(tag) || false}
                              onChange={(e) => {
                                const currentNotes = gameNotes[game.gameId] || [];
                                if (e.target.checked) {
                                  // 반대 의견이 선택된 경우 해제
                                  const oppositeTag = getOppositeTag(tag);
                                  const filteredNotes = currentNotes.filter(note => note !== oppositeTag);
                                  handleGameNotesChange(game.gameId, [...filteredNotes, tag]);
                                } else {
                                  handleGameNotesChange(game.gameId, currentNotes.filter(note => note !== tag));
                                }
                              }}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-red-800">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* 추가 메모 입력 - 스킵된 경우 비활성화 */}
                    <div className={`mt-3 ${skippedGames[game.gameId] ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="text"
                        placeholder="Add your own feedback..."
                        value={gameNotes[game.gameId]?.find(note => ![
                          'Fun & engaging', 'Boring', 'Helped me connect',
                          'Group size issue (too many/few)', 'Right duration', 'Confusing / unclear'
                        ].includes(note)) || ''}
                        onChange={(e) => {
                          const currentNotes = gameNotes[game.gameId] || [];
                          const filteredNotes = currentNotes.filter(note => [
                            'Fun & engaging', 'Boring', 'Helped me connect',
                            'Group size issue (too many/few)', 'Right duration', 'Confusing / unclear'
                          ].includes(note));
                          handleGameNotesChange(game.gameId, [...filteredNotes, e.target.value]);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* 게임 방법 링크 */}
                  {game.videoUrl && (
                    <div className="video-link mt-3 text-center">
                      <a
                        href={game.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
                      >
                        🎥 Watch how to play
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Activities and Final Questions */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Top 3 activities - 수정된 제목 */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
                  🎯 Choose your top 3 activities you wish to do with SLAM
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACTIVITIES.map(act => {
                    const checked = selectedActivities.includes(act);
                    return (
                      <label key={act} className={`flex items-center gap-2 p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        checked ? 'border-green-500 bg-green-100' : 'border-gray-200 hover:border-green-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedActivities(prev => {
                              const has = prev.includes(act);
                              if (has) return prev.filter(a => a !== act);
                              if (prev.length >= 3) { alert('You can select up to 3 activities.'); return prev; }
                              return [...prev, act];
                            });
                          }}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className={checked ? 'font-medium text-green-800' : ''}>{act}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-white rounded-md border-l-4 border-blue-500">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Good news!</strong> You can organize your own activities in the Community section. 
                    Connect with more SLAM friends and make it happen!
                  </p>
                </div>
              </div>

              {/* 주관식 질문 */}
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <label htmlFor="good-points" className="block text-lg font-medium text-green-800 mb-2 flex items-center">
                    <span className="mr-2">👍</span>
                    What did you like the most?
                  </label>
                  <textarea 
                    id="good-points" 
                    rows="3" 
                    value={goodPoints} 
                    onChange={(e) => setGoodPoints(e.target.value)} 
                    className="mt-1 w-full p-3 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500" 
                    placeholder="e.g., The games were fun, I met many new people, great atmosphere..."
                  />
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <label htmlFor="improvements" className="block text-lg font-medium text-orange-800 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Any suggestions for improvement?
                  </label>
                  <textarea 
                    id="improvements" 
                    rows="3" 
                    value={improvements} 
                    onChange={(e) => setImprovements(e.target.value)} 
                    className="mt-1 w-full p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    placeholder="e.g., More time for free talk, different music, better venue..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 단계별 네비게이션 버튼 */}
          <div className="flex justify-between items-center pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  canProceedToNext()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canProceedToNext()}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  canProceedToNext()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Feedback
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
