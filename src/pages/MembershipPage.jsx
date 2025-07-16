// src/pages/MembershipPage.jsx
import React, { useState, useEffect } from 'react';

// --- 가짜 데이터 (나중에 이 모든 데이터를 백엔드 API로부터 받아옵니다) ---
const MOCK_API_DATA = {
  totalCapacity: 80,
  earlyBirdCap: 20,
  currentMembers: 21, // ⬅️ 이 숫자를 15, 21, 75 등으로 바꿔가며 테스트해보세요!
  registrationCloseDate: '2025-09-12T23:59:59', // 마감 날짜
};
// --------------------------------------------------------------------

const membershipDetails = {
  NCCU: { title: "Elevate Your NCCU Experience with SLAM 🌟", benefits: [ "3 SLAM MEETs (Value: 1050 NTD)", "Exclusive Newsletter for Taipei Life Hacks (200NTD)", "Discounts at Partner Restaurants & Bars (250NTD)", "Priority for Outings (BBQ, Bowling etc.)" ] },
  NTU: { title: "Supercharge Your NTU Life with SLAM 🚀", benefits: [ "3 Exclusive NTU Chapter MEETs", "Joint events with other SLAM branches", "Networking opportunities with top students", "Access to all SLAM partnership benefits" ] },
  TAIPEI: { title: "Expand Your Network in Taipei with SLAM 💼", benefits: [ "Monthly themed social events for professionals", "Connect with local & international talent", "Exclusive partnership deals in the city", "A chance to escape your work bubble" ] }
};
const nccuMajors = ["Liberal Arts", "Social Sciences", "Commerce", "Communication", "Foreign Languages", "Law", "Science", "International Affairs", "Education", "ICI", "Informatics", "X-College"];
const taipeiStatuses = ["Student", "Professional", "Business Owner", "Freelancer", "Intern"];

// --- 마케팅 메시지를 관리하는 컴포넌트 ---
const UrgencyMessage = ({ data }) => {
  const { totalCapacity, earlyBirdCap, currentMembers, registrationCloseDate, selectedBranch } = data;
  const price = currentMembers < earlyBirdCap ? 800 : 900;
  const spotsLeft = totalCapacity - currentMembers;

  // 남은 시간 계산
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(registrationCloseDate);
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft("Registration Closed!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${days} days ${hours} hours left`);
    }, 1000);
    return () => clearInterval(interval);
  }, [registrationCloseDate]);

  let message;
  if (spotsLeft <= 0) {
    // 4단계: 마감
    message = (
      <div className="bg-gray-200 border-l-4 border-gray-500 text-gray-700 p-4">
        <p className="font-bold">Registration for this semester is now closed.</p>
        <p>Sign up to get notified for the next season!</p>
      </div>
    );
  } else if (currentMembers < earlyBirdCap) {
    // 1단계: 얼리버드
    message = (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
        <p className="font-bold">🔥 Early Bird Special: {earlyBirdCap - currentMembers} spots left!</p>
        <p>Join now for only 800 NTD before the price increases.</p>
      </div>
    );
  } else if (spotsLeft > 10) {
    // 2단계: 정가 - 시간제한
    message = (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
        <p className="font-bold">🎉 Early Bird SOLD OUT!</p>
        <p>Standard registration is now open. The form closes in <span className="font-bold">{timeLeft}</span>.</p>
      </div>
    );
  } else {
    // 3단계: 정가 - 수량제한
    message = (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 animate-pulse">
        <p className="font-bold">😱 LAST CHANCE! Only {spotsLeft} spots left!</p>
        <p>Secure your spot before the semester is fully booked.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-2xl font-bold mb-3 text-blue-800">{membershipDetails[selectedBranch].title}</h2>
      <div className="my-4 text-center">
        <span className="text-gray-500 line-through">Total Value: 1500 NTD</span>
        <p className="text-4xl font-black text-red-500">Your Price: ONLY {price} NTD</p>
      </div>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-6">
        {membershipDetails[selectedBranch].benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
      </ul>
      {message}
    </div>
  );
};


export default function MembershipPage() {
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    userType: '', studentId: '', major: '', phone: '', professionalStatus: '',
    howDidYouFind: '', whatYouLookFor: [], foodAllergies: '',
    country: '', stayDuration: '', bankLast5: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (selectedBranch === 'TAIPEI') {
      if (!formData.professionalStatus || !formData.phone) {
        alert("Please fill out your Status and Phone Number.");
        return;
      }
    } else {
      if (!formData.userType || !formData.studentId || !formData.major) {
        alert("Please fill out your Status, Student ID, and Major.");
        return;
      }
    }
    console.log("Submitting Info:", { branch: selectedBranch, profile: formData });
    setStep(3); 
  };

  const handleFinalSubmit = () => {
    if (!paymentMethod) {
        alert("Please select a payment method.");
        return;
    }
    if (paymentMethod === 'transfer' && !formData.bankLast5) {
        alert("Please enter the last 5 digits of your bank account.");
        return;
    }
    // TODO: 백엔드로 최종 데이터 전송
    console.log("Final Submission:", { branch: selectedBranch, profile: formData, paymentMethod });
    alert("Application submitted successfully! We will contact you soon.");
  };

  const renderInfoForm = () => (
    <form onSubmit={handleInfoSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Tell us about yourself</h3>
      {selectedBranch === 'TAIPEI' ? (
        <>
          <select name="professionalStatus" value={formData.professionalStatus} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Your Current Status?</option>
            {taipeiStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="userType" value={formData.userType} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Are you a local or foreigner?</option>
              <option value="local">Local</option>
              <option value="foreigner">Foreigner</option>
          </select>
          {formData.userType === 'foreigner' && (
              <input type="text" name="country" placeholder="Which country are you from?" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded" required />
          )}
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
        </>
      ) : (
        <>
          <select name="userType" value={formData.userType} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Who are you?</option>
            <option value="local">Local Student</option>
            <option value="international">International Student</option>
            <option value="exchange">Exchange Student</option>
          </select>
          <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} className="w-full p-2 border rounded" required />
          <select name="major" value={formData.major} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Major</option>
            {nccuMajors.map(m => <option key={m} value={m}>{m}</option>)}
            <option value="Other">Other</option>
          </select>
          {/* 'Other'를 선택했을 때만 이 입력창이 보입니다. */}
            {formData.major === 'Other' && (
              <input type="text" name="otherMajor" placeholder="Please type your major" className="w-full p-2 border rounded mt-2" />
            )}
          <input type="text" name="phone" placeholder="Phone Number (Optional)" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </>
      )}
      <input type="text" name="foodAllergies" placeholder="Any food allergies?" value={formData.foodAllergies} onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="mt-8 w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Next: Select Payment Method</button>
    </form>
  );

  const renderPaymentForm = () => {
    const price = MOCK_API_DATA.currentMembers < MOCK_API_DATA.earlyBirdCap ? 800 : 900;
    return (
        <div>
            <h3 className="text-xl font-bold mt-8 mb-4">Choose your payment method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => setPaymentMethod('transfer')} className={`p-4 border rounded-lg text-center ${paymentMethod === 'transfer' && 'border-blue-500 ring-2 ring-blue-500'}`}>
                    <span className="text-2xl">💳</span>
                    <p>Bank Transfer</p>
                </button>
                <button onClick={() => setPaymentMethod('cash')} className={`p-4 border rounded-lg text-center ${paymentMethod === 'cash' && 'border-blue-500 ring-2 ring-blue-500'}`}>
                    <span className="text-2xl">💵</span>
                    <p>Pay with Cash</p>
                </button>
            </div>

            {paymentMethod === 'transfer' && (
                <div className="bg-gray-100 p-6 rounded-lg">
                <p><strong>Please transfer {price} NTD to:</strong></p>
                <p><strong>Bank:</strong> (822) Cathay United Bank</p>
                <p><strong>Account:</strong> 123-456-7890</p>
                <input type="text" name="bankLast5" placeholder="Last 5 digits of your account" value={formData.bankLast5} onChange={handleChange} className="w-full p-2 border rounded mt-4" required />
                </div>
            )}
            {paymentMethod === 'cash' && (
                <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="font-bold">Please meet our staff to pay {price} NTD in cash.</p>
                <p className="text-sm mt-2">We will announce collection times and locations via email.</p>
                </div>
            )}
            
            <button onClick={handleFinalSubmit} className="mt-8 w-full py-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:bg-gray-400" disabled={!paymentMethod}>
                Complete Application
            </button>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-2">Join the SLAM Family!</h2>
            <p className="text-center text-gray-600 mb-8">First, which community are you joining?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(membershipDetails).map(branch => (
                <button key={branch} onClick={() => { setSelectedBranch(branch); setStep(2); }} className="p-6 border rounded-lg text-center hover:shadow-lg hover:border-blue-500 transition">
                  <h3 className="text-xl font-bold">{branch}</h3>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <UrgencyMessage data={{...MOCK_API_DATA, selectedBranch}} />
            {renderInfoForm()}
            <button onClick={() => setStep(1)} className="mt-2 w-full py-1 text-sm text-gray-600 hover:underline">Back to branch selection</button>
          </div>
        )}
        {step === 3 && (
            <div>
                {renderPaymentForm()}
                <button onClick={() => setStep(2)} className="mt-2 w-full py-1 text-sm text-gray-600 hover:underline">Back to edit info</button>
            </div>
        )}
      </div>
    </div>
  );
}
