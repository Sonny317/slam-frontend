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
  
  // 전체 이벤트 평점
  const [overallRating, setOverallRating] = useState(0);
  const [participantsFit, setParticipantsFit] = useState(0);
  const [interactionOpportunity, setInteractionOpportunity] = useState(0);
  const [languageConfidence, setLanguageConfidence] = useState(0);
  const [nps, setNps] = useState(0);
  const ACTIVITIES = [
    'Traveling','Drink at a bar','Karaoke Nights','Going to beach','EDM festival & Night club',
    'Bouldering & Running crew','Picnic in the Park','Game Nights','Hiking'
  ];
  const [selectedActivities, setSelectedActivities] = useState([]);
  // 게임별 평점 (객체 형태로 관리)
  const [gameRatings, setGameRatings] = useState({});
  
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      languageConfidence,
      nps,
      top3Activities,
      comment: [goodPoints, improvements].filter(Boolean).join('\n\n'),
      gameRatings
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
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-700">Your feedback for <span className="font-semibold">{eventDetails.eventTitle}</span> has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Event Feedback</h1>
          <p className="text-gray-600 mt-2">for <span className="font-semibold text-indigo-600">{eventDetails.eventTitle}</span></p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 전체 이벤트 평가 */}
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-center text-base font-medium text-gray-700 mb-2">Language confidence</label>
              <StarRating rating={languageConfidence} setRating={setLanguageConfidence} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-center text-base font-medium text-gray-700 mb-2">How likely to recommend (NPS 0–10)</label>
              <input type="number" min="0" max="10" value={nps} onChange={(e)=> setNps(Math.max(0, Math.min(10, Number(e.target.value)||0)))} className="mt-1 w-full p-2 border rounded-md text-center" />
            </div>
          </div>

          {/* 게임별 동적 평가 */}
          {eventDetails.games.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-center text-xl font-semibold text-gray-800">How were the games?</h2>
              {eventDetails.games.map(game => (
                <div key={game.gameId} className="p-4 border rounded-lg">
                  <label className="block text-center text-lg font-medium text-gray-700 mb-3">{game.name}</label>
                  <StarRating 
                    rating={gameRatings[game.gameId]} 
                    setRating={(rating) => handleGameRatingChange(game.gameId, rating)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Top 3 activities */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-lg font-medium text-gray-700 mb-3 text-center">Choose your top 3 ways to have fun with SLAM</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTIVITIES.map(act => {
                const checked = selectedActivities.includes(act);
                return (
                  <label key={act} className="flex items-center gap-2 p-2 border rounded-md">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedActivities(prev => {
                          const has = prev.includes(act);
                          if (has) return prev.filter(a => a !== act);
                          if (prev.length >= 3) { alert('You can select up to 3.'); return prev; }
                          return [...prev, act];
                        });
                      }}
                    />
                    <span>{act}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 주관식 질문 */}
          <div className="space-y-6">
            <div>
              <label htmlFor="good-points" className="block text-lg font-medium text-gray-700">What did you like the most?</label>
              <textarea id="good-points" rows="4" value={goodPoints} onChange={(e) => setGoodPoints(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., The games were fun, I met many new people..."/>
            </div>
            <div>
              <label htmlFor="improvements" className="block text-lg font-medium text-gray-700">Any suggestions for improvement?</label>
              <textarea id="improvements" rows="4" value={improvements} onChange={(e) => setImprovements(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="e.g., More time for free talk, different music..."/>
            </div>
          </div>
          
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors text-lg">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
