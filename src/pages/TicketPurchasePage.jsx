import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useUser } from '../context/UserContext';

export default function TicketPurchasePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/detail?eventId=${eventId}`);
        setEvent(response.data);
        
        // 사용자 정보가 있으면 폼 미리 채우기
        if (user?.isLoggedIn) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 티켓 구매 API 호출 (결제 로직은 나중에 구현)
      const response = await axios.post(`/api/events/${eventId}/purchase-ticket`, formData);
      
      alert('티켓 구매가 완료되었습니다!');
      navigate(`/events/${eventId}`); // 이벤트 상세 페이지로 이동
    } catch (error) {
      console.error('Failed to purchase ticket:', error);
      alert('티켓 구매에 실패했습니다: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center text-red-600">이벤트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // Early Bird 데드라인 기준으로 가격 결정
  const earlyBirdDeadline = event.earlyBirdDeadline;
  const now = new Date();
  const deadlineDate = earlyBirdDeadline ? new Date(earlyBirdDeadline) : null;
  const isEarlyBirdActive = deadlineDate && now < deadlineDate && event.currentMembers < event.earlyBirdCap;
  
  // 백엔드에서 계산된 currentPrice 사용, 없으면 로컬 계산
  const currentPrice = event.currentPrice || (isEarlyBirdActive ? event.earlyBirdPrice : event.price);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 이벤트 정보 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              🎫 {event.productType || 'Ticket'}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {event.branch}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>📅 날짜:</strong> {new Date(event.eventDateTime).toLocaleDateString()}
            </div>
            <div>
              <strong>📍 장소:</strong> {event.location}
            </div>
            <div>
              <strong>💰 가격:</strong> 
              <span className="text-lg font-bold text-orange-600 ml-2">
                ₩{currentPrice?.toLocaleString()}
              </span>
              {event.isEarlyBirdActive && (
                <span className="text-sm text-green-600 ml-2">(얼리버드)</span>
              )}
            </div>
            <div>
              <strong>👥 정원:</strong> {event.capacity}명
            </div>
          </div>
        </div>

        {/* 구매 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">티켓 구매 정보</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              특별 요청사항 (선택)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="음식 알레르기, 접근성 요구사항 등"
            />
          </div>

          {/* 계좌 정보 표시 */}
          {event.bankAccount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💳 결제 계좌 정보</h3>
              {(() => {
                // 백엔드에서 받은 "Bank - Account - AccountName" 형식을 파싱
                const bankParts = event.bankAccount.split(' - ');
                if (bankParts.length >= 3) {
                  return (
                    <>
                      <p className="text-blue-800"><strong>Bank:</strong> {bankParts[0]}</p>
                      <p className="text-blue-800"><strong>Account:</strong> {bankParts[1]}</p>
                      <p className="text-blue-800"><strong>Account Name:</strong> {bankParts[2]}</p>
                    </>
                  );
                } else {
                  return <p className="text-blue-800">계좌번호: {event.bankAccount}</p>;
                }
              })()}
              <p className="text-sm text-blue-600 mt-1">
                티켓 구매 후 위 계좌로 입금해주세요.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              뒤로 가기
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              ₩{currentPrice?.toLocaleString()} 티켓 구매
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
