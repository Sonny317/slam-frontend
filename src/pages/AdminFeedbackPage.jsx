// src/pages/AdminFeedbackPage.jsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// --- 가짜 데이터 (나중에 API로 대체) ---
const mockFeedbackSummaries = [
  { eventId: 1, eventTitle: "NCCU Welcome Party", responses: 45, avgRating: 4.8, formUrl: "http://localhost:3000/feedback/event/1" },
  { eventId: 2, eventTitle: "Taipei Professionals Networking", responses: 62, avgRating: 4.9, formUrl: "http://localhost:3000/feedback/event/2" },
];
// ------------------------------------

// --- QR 코드 팝업(Modal) 컴포넌트 ---
const QrModal = ({ url, title, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
    <div className="bg-white p-8 rounded-lg text-center" onClick={e => e.stopPropagation()}>
      <h2 className="text-2xl font-bold mb-4">QR Code for {title}</h2>
      <QRCodeSVG value={url} size={256} />
      <p className="mt-4 text-gray-600">Scan this code to open the feedback form.</p>
      <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
    </div>
  </div>
);


export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState('member'); // 'member' or 'staff'
  const [showQrModal, setShowQrModal] = useState(null); // QR 코드를 보여줄 이벤트 정보

  return (
    <div>
      {showQrModal && <QrModal url={showQrModal.formUrl} title={showQrModal.eventTitle} onClose={() => setShowQrModal(null)} />}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Feedback Management</h1>
        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
          + Create New Feedback Form
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab('member')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'member' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Member Feedback</button>
          <button onClick={() => setActiveTab('staff')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'staff' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>Staff Evaluation</button>
        </nav>
      </div>
      
      <div className="mt-8">
        {activeTab === 'member' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Event Feedback Summary</h2>
            <ul className="space-y-4">
              {mockFeedbackSummaries.map(summary => (
                <li key={summary.eventId} className="p-4 border rounded-lg sm:flex justify-between items-center space-y-4 sm:space-y-0">
                  <div className="flex-grow">
                    <p className="font-bold text-lg">{summary.eventTitle}</p>
                    <p className="text-sm text-gray-600">{summary.responses} responses | Avg. Rating: <span className="font-bold text-yellow-500">{summary.avgRating} ★</span></p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setShowQrModal(summary)} className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">Show QR Code</button>
                    <button className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200">View Details</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">Staff Evaluations</h2>
            <p className="text-gray-600">This section will contain tools for self and peer evaluations for staff members after each event.</p>
            {/* 여기에 스태프 평가 관련 기능 UI가 들어갑니다. */}
          </div>
        )}
      </div>
    </div>
  );
}
