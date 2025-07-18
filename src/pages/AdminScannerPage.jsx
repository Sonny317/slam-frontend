// src/pages/AdminScannerPage.jsx
import React, { useState } from 'react';
// ✅ The component name has been corrected from QrScanner to Scanner
import { Scanner } from '@yudiel/react-qr-scanner';

// --- Mock Data (to be replaced with API calls) ---
const MOCK_EVENT_DATA = {
  totalRegistered: 80,
};
// ------------------------------------

export default function AdminScannerPage() {
  const [lastScan, setLastScan] = useState(null);
  const [checkedInUsers, setCheckedInUsers] = useState(new Set());
  const [scanResult, setScanResult] = useState({ type: '', message: '' });

  const handleScan = (result) => {
    // To prevent multiple scans of the same code
    if (lastScan && lastScan.text === result) {
      return;
    }

    try {
      const data = JSON.parse(result);
      if (data && data.userId) {
        // Check if already checked in
        if (checkedInUsers.has(data.userId)) {
          setScanResult({ type: 'error', message: `Already Checked In: ${data.name}` });
        } else {
          // TODO: Send check-in request to the backend API
          // const response = await axios.post('/api/admin/check-in', { userId: data.userId });
          
          // Assuming success for now
          setScanResult({ type: 'success', message: `✅ Welcome, ${data.name}!` });
          setCheckedInUsers(prev => new Set(prev.add(data.userId)));
        }
        setLastScan({ text: result, ...data });
      }
    } catch (e) {
      setScanResult({ type: 'error', message: 'Invalid QR Code' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">SLAM Event Check-in</h1>

        {/* Real-time Status Board */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg mb-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Real-time Status</h2>
          <p className="text-5xl font-black">
            <span className="text-green-400">{checkedInUsers.size}</span>
            <span className="text-3xl text-gray-400"> / {MOCK_EVENT_DATA.totalRegistered}</span>
          </p>
          <p className="text-gray-400">Checked-in Members</p>
        </div>

        {/* QR Code Scanner */}
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-6 w-full aspect-square">
          {/* ✅ The component tag has been corrected to Scanner */}
          <Scanner
            onResult={(result) => handleScan(result)}
            onError={(error) => console.log(error?.message)}
            styles={{
                container: { width: '100%', height: '100%' }
            }}
          />
        </div>

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
