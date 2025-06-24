// src/pages/EventDetailPage.jsx
import React from 'react';

// MVP를 위해, 실제 데이터 대신 가짜 데이터를 사용합니다.
const eventData = {
  title: "SLAM TAIPEI 1st Pilot Event: BBQ & Language Exchange",
  host: "Sonny",
  date: "2025년 7월 26일 (토) 오후 5:00",
  location: "타이베이 다안 공원 (Daan Forest Park)",
  imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2070", // 임시 이미지
  description: "SLAM TAIPEI의 첫 번째 파일럿 이벤트를 시작합니다! 맛있는 바베큐와 함께 다양한 국적의 친구들과 만나 즐겁게 언어를 교환하고 문화를 체험해보세요. 새로운 친구를 사귀고 싶거나, 즐거운 주말을 보내고 싶은 분이라면 누구든 환영합니다!",
  reviews: [
    { id: 1, name: "Jessica", rating: 5, comment: "정말 즐거운 시간이었어요! 다양한 나라의 친구들을 만날 수 있어서 좋았습니다." },
    { id: 2, name: "Michael", rating: 5, comment: "운영진분들이 정말 친절하고, 분위기도 편안해서 금방 적응할 수 있었어요. 다음 이벤트도 기대됩니다." }
  ]
};

function EventDetailPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* 1. 이벤트 대표 이미지 */}
        <img src={eventData.imageUrl} alt="Event" className="w-full h-64 object-cover" />

        <div className="p-8">
          {/* 2. 이벤트 기본 정보 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{eventData.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
            <p><strong>Host:</strong> {eventData.host}</p>
            <p><strong>Date:</strong> {eventData.date}</p>
            <p><strong>Location:</strong> {eventData.location}</p>
          </div>

          {/* 3. 참석 여부 버튼 (RSVP) */}
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
          
          {/* 4. 이벤트 상세 설명 */}
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-2">About this event</h2>
            <p>{eventData.description}</p>
          </div>

          {/* 5. 리뷰 섹션 */}
          <div className="mt-10 pt-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">Reviews (★5.0)</h2>
            <div className="space-y-4">
              {eventData.reviews.map(review => (
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

export default EventDetailPage;