import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ useNavigate를 임포트합니다.
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate(); // ✅ navigate 함수를 사용할 수 있도록 설정합니다.

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [wantsAfterParty, setWantsAfterParty] = useState(false);
  const [isRsvpLoaded, setIsRsvpLoaded] = useState(false);
  const [showAfterPartyOptions, setShowAfterPartyOptions] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchEventAndRsvp = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const eventResponse = await axios.get(`/api/events/detail?eventId=${eventId}`);
        setEventData(eventResponse.data);

        if (user.isLoggedIn) {
          try {
            const rsvpResponse = await axios.get(`/api/events/my-rsvp?eventId=${eventId}`);
            if (rsvpResponse.data) {
              setIsAttending(rsvpResponse.data.attending);
              setWantsAfterParty(rsvpResponse.data.afterParty);
            }
          } finally {
            setIsRsvpLoaded(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        alert("Failed to load event information.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndRsvp();
  }, [eventId, user.isLoggedIn]);

  // Live countdown to the event date/time (registration closes when event starts)
  useEffect(() => {
    if (!eventData?.eventDateTime) return;
    const targetMs = new Date(eventData.eventDateTime).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = targetMs - now;
      if (diff <= 0) {
        setTimeLeft("Closed");
        return;
      }
      const secondsTotal = Math.floor(diff / 1000);
      const days = Math.floor(secondsTotal / (24 * 3600));
      const hours = Math.floor((secondsTotal % (24 * 3600)) / 3600);
      const minutes = Math.floor((secondsTotal % 3600) / 60);
      const seconds = secondsTotal % 60;
      const fmt = `${days}d ${hours}h ${minutes}m ${String(seconds).padStart(2, '0')}s`;
      setTimeLeft(fmt);
    };

    // Initial tick and interval
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventData?.eventDateTime]);

  const handleRsvpClick = (attendingStatus) => {
    if (!user.isLoggedIn) {
      return alert("Login is required.");
    }
    
    if (attendingStatus) {
      // 참석하는 경우 After Party 옵션을 보여줌
      setShowAfterPartyOptions(true);
    } else {
      // 불참하는 경우 바로 제출
      handleRsvpSubmit(false, false);
    }
  };

  const handleRsvpSubmit = async (attendingStatus, afterPartyStatus) => {
    console.log("=== handleRsvpSubmit Debug ===");
    console.log("User logged in:", user.isLoggedIn);
    console.log("Event ID:", eventId);
    console.log("Attending status:", attendingStatus);
    console.log("After party:", afterPartyStatus);
    
    if (!user.isLoggedIn) {
      return alert("Login is required.");
    }
    try {
      console.log("Making API call to /api/events/rsvp");
      const response = await axios.post(`/api/events/rsvp?eventId=${eventId}`, {
        isAttending: attendingStatus,
        afterParty: afterPartyStatus,
      });
      console.log("API response:", response.data);
      alert(response.data.message);
      setIsAttending(attendingStatus);
      setWantsAfterParty(afterPartyStatus);
      setShowAfterPartyOptions(false);

      // ✅ RSVP 성공 후 이벤트 목록 페이지로 이동합니다.
      navigate('/events'); 

    } catch (error) {
      console.error("RSVP API error:", error);
      alert("RSVP 처리 중 오류가 발생했습니다: " + (error.response?.data?.message || "다시 시도해주세요."));
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTimeRange = (startDateTime, endTime) => {
    if (!startDateTime) return "";
    const startDate = new Date(startDateTime);
    const startHour = startDate.getHours();
    const startMin = startDate.getMinutes();
    
    let startTimeStr = `${startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour}`;
    if (startMin > 0) startTimeStr += `:${startMin.toString().padStart(2, '0')}`;
    startTimeStr += startHour >= 12 ? 'pm' : 'am';
    
    if (!endTime) return `${startTimeStr}`;
    
    const [endHour, endMin] = endTime.split(':').map(Number);
    let endTimeStr = `${endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour}`;
    if (endMin > 0) endTimeStr += `:${endMin.toString().padStart(2, '0')}`;
    endTimeStr += endHour >= 12 ? 'pm' : 'am';
    
    return `${startTimeStr} ~ ${endTimeStr}`;
  };

  const getThemeIcon = (theme) => {
    const themeIcons = {
      'Regular SLAM Meet': '🤝',
      'Outing': '🌳',
      'Networking Party': '🎉',
      'Cultural Exchange': '🌍',
      'Bar Night': '🍻',
      'Sports Activity': '⚽',
      'Workshop': '🛠️'
    };
    return themeIcons[theme] || '🎯';
  };

  if (loading) {
    return <div className="text-center py-20">Loading event details...</div>;
  }
  if (!eventData) {
    return <div className="text-center py-20">Event not found.</div>;
  }



  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        <img src={eventData.imageUrl || "/default_event_image.jpg"} alt="Event" className="w-full h-64 object-cover" />

        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{eventData.title}</h1>
            {eventData.theme && (
              <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                {getThemeIcon(eventData.theme)} {eventData.theme}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
            <p><strong>📅 Date:</strong> {formatDate(eventData.eventDateTime)}</p>
            <p><strong>⏰ Time:</strong> {formatTimeRange(eventData.eventDateTime, eventData.endTime)}</p>
            <p className="flex items-center space-x-2">
              <strong>📍 Location:</strong> 
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline decoration-dotted hover:decoration-solid transition-all duration-200 flex items-center space-x-1"
              >
                <span>{eventData.location}</span>
                <span className="text-sm">🗺️</span>
              </a>
            </p>
          </div>

          {/* Countdown banner (linked to event date/time) */}
          <div className="mb-8">
            <div className={`inline-flex items-center space-x-2 rounded-full px-6 py-3 text-sm font-bold border-2 ${
              timeLeft === 'Closed' 
                ? 'bg-gray-200 text-gray-700 border-gray-400' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-600 shadow-lg animate-pulse'
            }`}>
              {timeLeft === 'Closed' ? (
                <>
                  <span>🔒</span>
                  <span>Registration Closed</span>
                </>
              ) : (
                <>
                  <span className="animate-bounce">⚡</span>
                  <span>HURRY! Registration closes in {timeLeft}</span>
                  <span className="animate-bounce">⏰</span>
                </>
              )}
            </div>
          </div>

          {user.isLoggedIn && isRsvpLoaded && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-8 border border-blue-100">
              {!showAfterPartyOptions ? (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center space-x-2">
                    <span>🤔</span>
                    <span>Will you be joining us?</span>
                    <span>✨</span>
                  </h2>
                  <div className="flex justify-center gap-4 mb-4">
                    <button 
                      onClick={() => handleRsvpClick(true)}
                      className={`font-bold py-3 px-8 rounded-full transition-all duration-200 flex items-center space-x-2 shadow-md ${
                        isAttending 
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white scale-105 shadow-lg' 
                          : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:scale-105'
                      }`}>
                      <span className="text-lg">{isAttending ? '🎉' : '👋'}</span>
                      <span>Count me in!</span>
                    </button>
                    <button 
                      onClick={() => handleRsvpClick(false)}
                      className={`font-bold py-3 px-8 rounded-full transition-all duration-200 flex items-center space-x-2 shadow-md ${
                        !isAttending 
                          ? 'bg-gray-500 text-white scale-105 shadow-lg' 
                          : 'bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50 hover:scale-105'
                      }`}>
                      <span className="text-lg">{!isAttending ? '😔' : '🤷‍♂️'}</span>
                      <span>Maybe next time</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center space-x-2">
                    <span>🎉</span>
                    <span>Awesome! How about the after-party?</span>
                    <span>🍻</span>
                  </h2>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => handleRsvpSubmit(true, true)}
                        className="font-bold py-3 px-8 rounded-full transition-all duration-200 flex items-center space-x-2 shadow-md bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105"
                      >
                        <span className="text-lg">🎉</span>
                        <span>Yes! After-party too!</span>
                        <span className="text-lg">✨</span>
                      </button>
                      <button 
                        onClick={() => handleRsvpSubmit(true, false)}
                        className="font-bold py-3 px-8 rounded-full transition-all duration-200 flex items-center space-x-2 shadow-md bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:scale-105"
                      >
                        <span className="text-lg">😊</span>
                        <span>Just the main event</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowAfterPartyOptions(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Go back
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-2">About this event</h2>
            <p>{eventData.description}</p>
          </div>


        </div>
      </div>
    </div>
  );
}
