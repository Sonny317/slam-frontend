// src/pages/AdminScannerPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
// ✅ The component name has been corrected from QrScanner to Scanner
import { Scanner } from '@yudiel/react-qr-scanner';

export default function AdminScannerPage() {
  const [lastScan, setLastScan] = useState(null);
  const [checkedInUsers, setCheckedInUsers] = useState(new Set());
  const [scanResult, setScanResult] = useState({ type: '', message: '' });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 이벤트 목록 로드
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await axios.get('/api/admin/events');
        const eventsList = response.data || [];
        setEvents(eventsList);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load events:', error);
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // 선택된 이벤트의 통계 로드
  useEffect(() => {
    if (selectedEvent) {
      const loadEventStats = async () => {
        try {
          const response = await axios.get(`/api/admin/events/attendees?eventId=${selectedEvent.id}`);
          const attendees = response.data || [];
          setEventStats({
            totalRegistered: attendees.length,
            checkedIn: checkedInUsers.size
          });
        } catch (error) {
          console.error('Failed to load event stats:', error);
          setEventStats({
            totalRegistered: 0,
            checkedIn: checkedInUsers.size
          });
        }
      };
      loadEventStats();
    }
  }, [selectedEvent, checkedInUsers.size]);

  const handleScan = (result) => {
    console.log('QR Scan result:', result);
    
    try {
      // 이벤트가 선택되지 않은 경우
      if (!selectedEvent) {
        setScanResult({ type: 'error', message: 'Please select an event first' });
        return;
      }

      // result가 객체인 경우 text 속성 추출
      const resultText = typeof result === 'string' ? result : result?.text || result?.data || result;

      if (!resultText) {
        setScanResult({ type: 'error', message: 'No QR code data detected' });
        return;
      }

      // To prevent multiple scans of the same code
      if (lastScan && lastScan.text === resultText) {
        return;
      }

      const data = JSON.parse(resultText);
      console.log('Parsed QR data:', data);
      
      // ✅ 더 엄격한 검증
      if (!data || typeof data !== 'object') {
        setScanResult({ type: 'error', message: 'Invalid QR Code: Not a valid JSON object' });
        return;
      }

      if (!data.userId || typeof data.userId !== 'number') {
        setScanResult({ type: 'error', message: 'Invalid QR Code: Missing or invalid userId' });
        return;
      }

      if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        setScanResult({ type: 'error', message: 'Invalid QR Code: Missing or invalid name' });
        return;
      }

      if (!data.eventId || typeof data.eventId !== 'number') {
        setScanResult({ type: 'error', message: 'Invalid QR Code: Missing or invalid eventId' });
        return;
      }

      // ✅ 이벤트 ID가 선택된 이벤트와 일치하는지 확인
      if (data.eventId !== selectedEvent.id) {
        setScanResult({ type: 'error', message: `QR Code is for a different event. Expected: ${selectedEvent.id}, Got: ${data.eventId}` });
        return;
      }

      // Check if already checked in
      if (checkedInUsers.has(data.userId)) {
        setScanResult({ type: 'error', message: `Already Checked In: ${data.name}` });
        return;
      }

      // 비동기 체크인 처리
      const processCheckIn = async () => {
        try {
          const res = await axios.post(`/api/admin/check-in?eventId=${selectedEvent.id}&userId=${data.userId}`);
          if (res.data?.success) {
            setScanResult({ type: 'success', message: `✅ Welcome, ${data.name}!` });
            setCheckedInUsers(prev => new Set([...prev, data.userId]));
          } else {
            setScanResult({ type: 'error', message: res.data?.error || 'Check-in failed' });
          }
        } catch (err) {
          setScanResult({ type: 'error', message: err?.response?.data?.error || err.message || 'Check-in failed' });
        }
      };
      
      processCheckIn();
      setLastScan({ text: resultText, ...data });
      
    } catch (e) {
      console.error('QR Parse error:', e);
      setScanResult({ type: 'error', message: 'Invalid QR Code format' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">SLAM Event Check-in</h1>

        {/* Event Selection */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Event</h2>
          <select
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const eventId = e.target.value;
              const event = events.find(evt => evt.id.toString() === eventId);
              setSelectedEvent(event);
              setCheckedInUsers(new Set()); // Reset checked-in users when changing event
              setScanResult({ type: '', message: '' });
            }}
            className="w-full p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose an event...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.branch}) - {new Date(event.eventDateTime).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Status Board */}
        {selectedEvent && (
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg mb-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Real-time Status</h2>
            <p className="text-5xl font-black">
              <span className="text-green-400">{eventStats?.checkedIn || 0}</span>
              <span className="text-3xl text-gray-400"> / {eventStats?.totalRegistered || 0}</span>
            </p>
            <p className="text-gray-400">Checked-in Members</p>
            <p className="text-sm text-gray-500 mt-2">{selectedEvent.title}</p>
          </div>
        )}

        {/* QR Code Scanner */}
        {selectedEvent ? (
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-6 w-full aspect-square">
            <Scanner
              onResult={(result) => {
                try {
                  handleScan(result);
                } catch (error) {
                  console.error('Error in handleScan:', error);
                  setScanResult({ type: 'error', message: 'Scan processing error' });
                }
              }}
              onError={(error) => {
                console.error('Scanner error:', error);
                setScanResult({ type: 'error', message: 'Scanner error occurred' });
              }}
              styles={{
                  container: { width: '100%', height: '100%' }
              }}
            />
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-8 text-center mb-6">
            <p className="text-gray-400">Please select an event to start scanning</p>
          </div>
        )}

        {/* Scan Result Message */}
        {scanResult.message && (
          <div className={`p-4 rounded-lg text-center font-bold text-lg transition-all ${
            scanResult.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {scanResult.message}
          </div>
        )}
      </div>
    </div>
  );
}