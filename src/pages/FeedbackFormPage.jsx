// src/pages/FeedbackFormPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// --- 별점 컴포넌트 ---
const StarRating = ({ rating, setRating }) => {
  return (
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
};

export default function FeedbackFormPage() {
  const { eventId } = useParams(); // URL에서 이벤트 ID를 가져옵니다. (예: /feedback/event/1)
  
  // 가짜 이벤트 제목 (나중에 API로 실제 이벤트 제목을 받아옵니다)
  const eventTitle = "NCCU Welcome Party"; 

  const [rating, setRating] = useState(0);
  const [goodPoints, setGoodPoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please provide a star rating!");
      return;
    }
    // TODO: 백엔드 API로 피드백 데이터 전송
    console.log({
      eventId,
      rating,
      goodPoints,
      improvements
    });
    setIsSubmitted(true); // 제출 완료 화면으로 변경
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-700">Your feedback has been submitted successfully.</p>
        <p className="mt-2 text-gray-500">Your voice helps us make SLAM even better!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Event Feedback</h1>
          <p className="text-gray-600 mt-2">for <span className="font-semibold text-blue-600">{eventTitle}</span></p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-center text-lg font-medium text-gray-700 mb-3">
              How would you rate this event?
            </label>
            <StarRating rating={rating} setRating={setRating} />
          </div>

          <div>
            <label htmlFor="good-points" className="block text-lg font-medium text-gray-700">
              What did you like the most?
            </label>
            <textarea
              id="good-points"
              rows="4"
              value={goodPoints}
              onChange={(e) => setGoodPoints(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="e.g., The games were fun, I met many new people..."
            />
          </div>

          <div>
            <label htmlFor="improvements" className="block text-lg font-medium text-gray-700">
              Any suggestions for improvement?
            </label>
            <textarea
              id="improvements"
              rows="4"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="e.g., More time for free talk, different music..."
            />
          </div>
          
          <button type="submit" className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
