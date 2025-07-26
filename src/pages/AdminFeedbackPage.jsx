// src/pages/AdminFeedbackPage.jsx
import React from 'react';

// 가짜 데이터
const feedbackSummaries = [
  { eventId: 1, eventTitle: "NCCU Welcome Party", responses: 45, avgRating: 4.8 },
  { eventId: 2, eventTitle: "Taipei Professionals Networking", responses: 62, avgRating: 4.9 },
];

export default function AdminFeedbackPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Feedback Management</h1>
        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
          Create New Feedback Form
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Event Feedback Summary</h2>
        <ul className="space-y-4">
          {feedbackSummaries.map(summary => (
            <li key={summary.eventId} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{summary.eventTitle}</p>
                <p className="text-sm text-gray-600">{summary.responses} responses</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-500">{summary.avgRating} ★</p>
                <button className="text-sm text-blue-600 hover:underline mt-1">View Details</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
