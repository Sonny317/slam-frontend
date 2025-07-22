import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ✅ URL 파라미터를 읽기 위한 훅
import axios from '../api/axios'; // ✅ API 호출을 위한 훅

export default function EventDetailPage() {
  const { eventId } = useParams(); // ✅ URL에서 이벤트 ID를 가져옵니다. (예: /events/1 -> eventId는 '1')
  const [eventData, setEventData] = useState(null); // ✅ API로부터 받아온 데이터를 저장할 state
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!eventId) return; // eventId가 없으면 실행하지 않음
      setLoading(true);
      try {
        const response = await axios.get(`/api/events/${eventId}`);
        setEventData(response.data);
      } catch (error) {
        console.error("Failed to fetch event detail:", error);
        alert("이벤트 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [eventId]); // ✅ eventId가 변경될 때마다 이 useEffect가 다시 실행됩니다.

  // 날짜 형식을 예쁘게 바꿔주는 함수
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // 로딩 중이거나 데이터가 없을 때 표시할 화면
  if (loading) {
    return <div className="text-center py-20">Loading event details...</div>;
  }
  if (!eventData) {
    return <div className="text-center py-20">Event not found.</div>;
  }

  // TODO: 리뷰 데이터는 나중에 API로부터 받아와야 합니다.
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
            <p><strong>Host:</strong> Sonny</p> {/* TODO: 실제 호스트 정보로 변경 */}
            <p><strong>Date:</strong> {formatDate(eventData.eventDateTime)}</p>
            <p><strong>Location:</strong> {eventData.location}</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Are you going?</h2>
            <div className="flex justify-center gap-4 mb-4">
              <button className="bg-blue-600 text-white font-bold py-2 px-8 rounded-full hover:bg-blue-700 transition-colors">
                참석 (Join)
              </button>
              <button className="bg-gray-200 text-gray-800 font-bold py-2 px-8 rounded-full hover:bg-gray-300 transition-colors">
                불참 (Decline)
              </button>
            </div>
            <div className="flex items-center justify-center">
              <input type="checkbox" id="after-party" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="after-party" className="ml-2 block text-sm text-gray-900">
                애프터파티에도 참여합니다!
              </label>
            </div>
          </div>
          
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