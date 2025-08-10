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

  const handleRsvpSubmit = async (attendingStatus) => {
    console.log("=== handleRsvpSubmit Debug ===");
    console.log("User logged in:", user.isLoggedIn);
    console.log("Event ID:", eventId);
    console.log("Attending status:", attendingStatus);
    console.log("After party:", attendingStatus ? wantsAfterParty : false);
    
    if (!user.isLoggedIn) {
      return alert("Login is required.");
    }
    try {
      console.log("Making API call to /api/events/rsvp");
      const response = await axios.post(`/api/events/rsvp?eventId=${eventId}`, {
        isAttending: attendingStatus,
        afterParty: attendingStatus ? wantsAfterParty : false,
      });
      console.log("API response:", response.data);
      alert(response.data.message);
      setIsAttending(attendingStatus);

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
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-20">Loading event details...</div>;
  }
  if (!eventData) {
    return <div className="text-center py-20">Event not found.</div>;
  }

  const reviews = [
    { id: 1, name: "Jessica", rating: 5, comment: "정말 즐거운 시간이었어요! 다양한 나라의 친구들을 만날 수 있어서 좋았습니다." },
    { id: 2, name: "Michael", rating: 5, comment: "운영진분들이 정말 친절하고, 분위기도 편안해서 금방 적응할 수 있었어요. 다음 이벤트도 기대됩니다." }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        <img src={eventData.imageUrl || "/default_event_image.jpg"} alt="Event" className="w-full h-64 object-cover" />

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{eventData.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
            <p><strong>Host:</strong> Sonny</p>
            <p><strong>Date:</strong> {formatDate(eventData.eventDateTime)}</p>
            <p><strong>Location:</strong> {eventData.location}</p>
          </div>

          {/* Countdown banner (linked to event date/time) */}
          <div className="mb-8">
            <div className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${timeLeft === 'Closed' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'}`}>
              {timeLeft === 'Closed' ? 'Registration closed' : `Closes in ${timeLeft}`}
            </div>
          </div>

          {user.isLoggedIn && isRsvpLoaded && (
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Are you going?</h2>
              <div className="flex justify-center gap-4 mb-4">
                <button 
                  onClick={() => handleRsvpSubmit(true)}
                  className={`font-bold py-2 px-8 rounded-full transition-colors ${isAttending ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-100'}`}>
                   Join
                </button>
                <button 
                  onClick={() => handleRsvpSubmit(false)}
                  className={`font-bold py-2 px-8 rounded-full transition-colors ${!isAttending ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                   Decline
                </button>
              </div>
              {isAttending && (
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id="after-party" 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={wantsAfterParty}
                    onChange={(e) => setWantsAfterParty(e.target.checked)}
                  />
                  <label htmlFor="after-party" className="ml-2 block text-sm text-gray-900">
                    I will also join the after-party!
                  </label>
                </div>
              )}
            </div>
          )}
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-2">About this event</h2>
            <p>{eventData.description}</p>
          </div>

          <div className="mt-10 pt-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">Reviews (★5.0)</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold">{review.name}</span>
                    <span className="ml-2 text-yellow-500">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-700">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
