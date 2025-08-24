import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // ✅ useSearchParams 추가
import { useUser } from '../context/UserContext';

// --- 백엔드 API에서 가져올 데이터 ---
const DEFAULT_API_DATA = {
  totalCapacity: 80,
  earlyBirdCap: 20,
  currentMembers: 0,
  registrationCloseDate: '2025-09-12T23:59:59', // 마감 날짜
};
// --------------------------------------------------------------------

const membershipDetails = {
  NCCU: { title: "Elevate Your NCCU Experience with SLAM 🌟", benefits: [ "3 SLAM MEETs (Value: 1050 NTD)", "Exclusive Newsletter for Taipei Life Hacks (200NTD)", "Discounts at Partner Restaurants & Bars (250NTD)", "Priority for Outings (BBQ, Bowling etc.)" ] },
  NTU: { title: "Supercharge Your NTU Life with SLAM 🚀", benefits: [ "3 Exclusive NTU Chapter MEETs", "Joint events with other SLAM branches", "Networking opportunities with top students", "Access to all SLAM partnership benefits" ] },
  TAIPEI: { title: "Expand Your Network in Taipei with SLAM 💼", benefits: [ "Monthly themed social events for professionals", "Connect with local & international talent", "Exclusive partnership deals in the city", "A chance to escape your work bubble" ] }
};

// ✅ 지부별 계좌 정보 (각 지부마다 다른 계좌)
const branchBankInfo = {
  NCCU: {
    bank: "(822) Cathay United Bank",
    account: "123-456-7890",
    accountName: "SLAM NCCU"
  },
  NTU: {
    bank: "(700) China Post",
    account: "098-765-4321", 
    accountName: "SLAM NTU"
  },
  TAIPEI: {
    bank: "(812) Taiwan Cooperative Bank",
    account: "555-123-9876",
    accountName: "SLAM TAIPEI"
  }
};
// ✅ 통합 대분류 - 모든 학교에서 사용 가능한 표준화된 전공 카테고리 (알파벳 순)
const unifiedMajors = [
  "Agriculture & Life Sciences",
  "Architecture & Planning",
  "Business & Management", 
  "Communication & Media Studies",
  "Computer Science & Information Technology",
  "Design & Arts",
  "Economics & Finance",
  "Education & Teaching",
  "Engineering & Technology",
  "Environmental Studies",
  "Languages & Linguistics", 
  "Law & Legal Studies",
  "Liberal Arts & Humanities",
  "Medicine & Health Sciences",
  "Music & Performing Arts",
  "Philosophy & Religious Studies",
  "Political Science & International Relations",
  "Public Health & Social Work",
  "Science & Mathematics",
  "Social Sciences & Psychology",
  "Sports & Physical Education",
  "Others"
];

const taipeiStatuses = ["Student", "Professional", "Business Owner", "Freelancer", "Intern"];

// ✅ 단순화된 산업 카테고리 (모든 전문직 상태에 공통 적용, 알파벳 순)
const industryCategories = [
  "Design & Creative",
  "Education & Research",
  "Finance & Banking", 
  "Food & Beverage",
  "Government & Public Service",
  "Healthcare & Medical",
  "Legal & Consulting",
  "Manufacturing",
  "Marketing & Advertising",
  "Media & Communications",
  "Non-profit & NGO",
  "Real Estate",
  "Retail & E-commerce",
  "Technology & Software",
  "Others"
];

// ISO-like country list (subset for brevity, can be expanded)
const countryOptions = [
  // Americas (Latin America & South America emphasized)
  "Argentina", "Belize", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominican Republic", "Ecuador", "El Salvador", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Puerto Rico", "Suriname", "Trinidad and Tobago", "Uruguay", "Venezuela",
  // Others (existing)
  "Australia", "Austria", "Belgium", "Canada", "China", "Denmark", "Finland", "France", "Germany", "Hong Kong", "India", "Indonesia", "Ireland", "Italy", "Japan", "Malaysia", "Netherlands", "New Zealand", "Norway", "Philippines", "Poland", "Portugal", "Russia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
].sort().concat("— Others"); // ✅ Others 옵션을 마지막에 추가

// --- 새로운 반응형 SLAM 프로모션 카드 ---
const SlamPromotionCard = ({ data, onRegisterClick }) => {
  const { totalCapacity, earlyBirdCap, currentMembers, registrationCloseDate, selectedBranch, currentPrice } = data;
  const price = currentPrice || (currentMembers < earlyBirdCap ? 800 : 900);
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
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s left`);
    }, 1000);
    return () => clearInterval(interval);
  }, [registrationCloseDate]);

  let urgencyMessage;
  if (spotsLeft <= 0) {
    urgencyMessage = (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-gray-500 text-gray-700 p-4 sm:p-6 rounded-lg animate-pulse">
        <p className="font-bold text-lg">Registration for this semester is now closed.</p>
        <p className="text-sm mt-2">Sign up to get notified for the next season!</p>
      </div>
    );
  } else if (currentMembers < earlyBirdCap) {
    urgencyMessage = (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 p-4 sm:p-6 rounded-lg">
        <p className="font-bold text-lg">🔥 Early Bird Special: {earlyBirdCap - currentMembers} spots left!</p>
        <p className="text-sm mt-2">Join now for only 800 NTD before the price increases.</p>
      </div>
    );
  } else if (spotsLeft > 10) {
    urgencyMessage = (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 text-yellow-700 p-4 sm:p-6 rounded-lg">
        <p className="font-bold text-lg">🎉 Early Bird SOLD OUT!</p>
        <div className="mt-3">
          <p className="text-sm">Standard registration is now open.</p>
          <div className="mt-3 bg-yellow-200 border-2 border-yellow-400 rounded-lg p-3 text-center">
            <p className="text-xs mb-1">Form closes in</p>
            <span className="font-bold text-lg sm:text-xl text-yellow-900">{timeLeft}</span>
          </div>
        </div>
      </div>
    );
  } else {
    urgencyMessage = (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 p-4 sm:p-6 rounded-lg animate-pulse">
        <p className="font-bold text-lg">😱 LAST CHANCE! Only {spotsLeft} spots left!</p>
        <p className="text-sm mt-2">Secure your spot before the semester is fully booked.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mb-8 group">
      {/* 메인 카드 */}
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group-hover:shadow-2xl">
        
        {/* 헤더 섹션 - 파란색 그라데이션 */}
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 sm:p-10 lg:p-12 overflow-hidden">
          {/* 떠다니는 배경 효과 */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white bg-opacity-5 rounded-full animate-bounce"></div>
          
          {/* 아이콘 */}
          <div className="text-center mb-4">
            <div className="text-5xl sm:text-6xl lg:text-7xl mb-2 animate-bounce">🎯</div>
          </div>
          
          {/* 제목 */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-2 leading-tight">
            {membershipDetails[selectedBranch].title}
          </h1>
          
          {/* 부제목 */}
          <p className="text-sm sm:text-base lg:text-lg text-center opacity-90 font-medium">
            Exclusive membership benefits await
          </p>
        </div>

        {/* 가격 섹션 */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 sm:p-8 mb-6 text-center border-2 border-red-200 relative">
            {/* Early Bird 배지 */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce z-10">
              🐦 EARLY BIRD!
            </div>

            <div className="text-sm sm:text-base text-slate-500 line-through mb-1">
              Total Value: 1500 NTD
            </div>
            <div className="text-base sm:text-lg text-slate-400 line-through mb-2">
              Regular Price: 900 NTD
            </div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-red-600 mb-2 animate-pulse">
              ⚡ {price} <span className="text-2xl sm:text-3xl lg:text-4xl">NTD</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-orange-600 mb-3">
              You Save 700 NTD (47% OFF!)
            </div>
            <div className="inline-block bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-4 py-2 rounded-full text-sm sm:text-base font-semibold border border-red-300">
              All Included ✨
            </div>
          </div>

          {/* 얼리버드 카운트다운 박스 */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 sm:p-6 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl animate-pulse">⏰</span>
              <span className="text-sm sm:text-base font-bold text-yellow-800">HURRY UP!</span>
              <span className="text-2xl animate-pulse">⚡</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-yellow-900 mb-1">
              Only {earlyBirdCap - currentMembers} spots left
            </div>
            <div className="text-base sm:text-lg font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg inline-block">
              {timeLeft}
            </div>
          </div>

          {/* 혜택 섹션 */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-center text-slate-800 mb-4">What's Included:</h3>
            {membershipDetails[selectedBranch].benefits.map((benefit, i) => {
              // 혜택과 가치를 분리 (더 간단한 로직)
              const hasValue = benefit.includes('(Value:') || benefit.includes('(200NTD)') || benefit.includes('(250NTD)');
              const [mainBenefit, benefitValue] = hasValue ? benefit.split('(') : [benefit, null];
              const value = benefitValue ? `(${benefitValue}` : null;

              return (
                <div
                  key={i}
                  className="flex items-start p-3 sm:p-4 bg-slate-50 rounded-xl transition-all duration-200 hover:translate-x-1 hover:bg-slate-100 border border-slate-100"
                >
                  {/* 체크마크 아이콘 */}
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    <div className="text-white text-xs font-bold">
                      ✓
                    </div>
                  </div>

                  {/* 텍스트 컨텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                      {mainBenefit.trim()}
                    </div>
                    {value && (
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        {value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Register Now 버튼 */}
          <div className="text-center">
            <button
              onClick={onRegisterClick}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg sm:text-xl py-4 px-8 sm:px-12 rounded-2xl hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🚀</span>
                <span>Register Now</span>
                <span className="text-2xl">⚡</span>
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-2">⚠️ Limited time offer - Early Bird pricing won't last!</p>
        </div>
        </div>
      </div>
    </div>
  );
};


export default function MembershipPage() {
  const navigate = useNavigate(); // ✅ 2. navigate 함수를 사용할 수 있도록 설정합니다.
  const { user } = useUser();
  const [searchParams] = useSearchParams(); // ✅ URL 쿼리 파라미터 읽기
  
  // ✅ URL에서 지부 정보가 있으면 미리 선택하고 step 2로 이동, 없으면 에러 표시
  const branchFromUrl = searchParams.get('branch');
  console.log('🔍 MembershipPage Debug - branchFromUrl:', branchFromUrl);
  console.log('🔍 MembershipPage Debug - searchParams:', searchParams.toString());
  
  const [selectedBranch, setSelectedBranch] = useState(branchFromUrl || '');
  const [step, setStep] = useState(branchFromUrl ? 1 : 0); // 0 = 에러 상태, 1 = 프로모션 카드, 2 = 정보 입력, 3 = 결제
  const [branchCloseDate, setBranchCloseDate] = useState(null);
  const [apiData, setApiData] = useState(DEFAULT_API_DATA);

  // ✅ Staff/admin users should go directly to RSVP (events) instead of membership flow
  useEffect(() => {
    if (user?.isLoggedIn && ['ADMIN', 'STAFF', 'PRESIDENT', 'LEADER'].includes(user.role)) {
      console.log('🔍 Admin/Staff user detected, redirecting to events:', user.role);
      navigate('/events', { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => {
    const fetchCloseDate = async () => {
      if (!selectedBranch) return;
      try {
        const res = await axios.get(`/api/events?branch=${selectedBranch}`);
        const now = new Date();
        const future = (res.data || []).filter(e => new Date(e.eventDateTime) > now);
        if (future.length > 0) {
          const earliest = future.reduce((min, e) => new Date(e.eventDateTime) < new Date(min.eventDateTime) ? e : min, future[0]);
          setBranchCloseDate(new Date(earliest.eventDateTime).toISOString());
        } else {
          setBranchCloseDate(null);
        }
      } catch (e) {
        setBranchCloseDate(null);
      }
    };
    fetchCloseDate();
  }, [selectedBranch]);

  // ✅ 이벤트별 계좌 정보 가져오기 useEffect를 컴포넌트 최상위로 이동
  useEffect(() => {
    // TODO: 실제로는 백엔드에서 현재 활성 이벤트의 계좌 정보를 가져와야 함
    // 지금은 기본 지부 정보 사용
    setEventBankInfo(branchBankInfo[selectedBranch]);
  }, [selectedBranch]);

  // ✅ 백엔드에서 멤버십 가격 정보 가져오기
  useEffect(() => {
    const fetchPricingData = async () => {
      if (!selectedBranch) return;
      try {
        const response = await axios.get(`/api/memberships/pricing?branch=${selectedBranch}`);
        setApiData({
          ...DEFAULT_API_DATA,
          ...response.data
        });
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
        // 에러 시 기본 데이터 사용
        setApiData(DEFAULT_API_DATA);
      }
    };
    fetchPricingData();
  }, [selectedBranch]);

  // Redirect unauthenticated users to login page
  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login required</h1>
          <p className="text-gray-600 mb-6">Please log in to apply for membership.</p>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    userType: '', studentId: '', major: '', otherMajor: '', detailedMajor: '', phone: '', professionalStatus: '',
    industry: '', otherIndustry: '', country: '', otherCountry: '', stayDuration: '', foodAllergies: '', bankLast5: '', 
    howDidYouHear: '', friendReferralName: '', otherSource: '',
    networkingGoal: '', networkingDescription: '', otherNetworkingGoal: ''
  });
  
  // ✅ 이벤트별 계좌 정보 상태를 컴포넌트 최상위로 이동
  const [eventBankInfo, setEventBankInfo] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    
    // 기본 필드 검증
    if (selectedBranch === 'TAIPEI') {
      if (!formData.professionalStatus || !formData.phone) {
        alert("Please fill out your Status and Phone Number.");
        return;
      }
      // ✅ 산업 카테고리 검증
      if (formData.professionalStatus !== 'Student' && !formData.industry) {
        alert("Please select your industry.");
        return;
      }
      // ✅ 기타 산업 입력 검증
      if (formData.industry === 'Others' && !formData.otherIndustry) {
        alert("Please specify your industry.");
        return;
      }
      // ✅ Goal 검증
      if (formData.professionalStatus !== 'Student' && !formData.networkingGoal) {
        alert("Please select your main goal.");
        return;
      }
      // ✅ 기타 Goal 입력 검증
      if (formData.networkingGoal === 'Other' && !formData.otherNetworkingGoal) {
        alert("Please specify your goal.");
        return;
      }
      // ✅ 국적 Others 선택 시 상세 입력 검증
      if (formData.country === '— Others' && !formData.otherCountry) {
        alert("Please specify your country.");
        return;
      }
    } else {
      if (!formData.userType || !formData.studentId || !formData.major) {
        alert("Please fill out your Status, Student ID, and Major.");
        return;
      }
      // ✅ 국적 Others 선택 시 상세 입력 검증
      if (formData.country === '— Others' && !formData.otherCountry) {
        alert("Please specify your country.");
        return;
      }
    }
    
    // ✅ SLAM을 알게 된 경로 검증
    if (!formData.howDidYouHear) {
      alert("Please tell us how you heard about SLAM events.");
      return;
    }
    
    // 친구 추천인 경우 이름 필수
    if (formData.howDidYouHear === 'Friend referral' && !formData.friendReferralName) {
      alert("Please enter your friend's name who referred you.");
      return;
    }
    
    // 기타인 경우 상세 설명 필수
    if (formData.howDidYouHear === 'Other' && !formData.otherSource) {
      alert("Please specify how you heard about us.");
      return;
    }
    
    setStep(3); // 결제 단계로 이동 
  };

  const handleFinalSubmit = async () => {
    if (!paymentMethod) {
        return alert("Please select a payment method.");
    }
    if (paymentMethod === 'transfer' && !formData.bankLast5) {
        return alert("Please enter the last 5 digits of your bank account.");
    }

    const submissionData = {
        selectedBranch: selectedBranch,
        paymentMethod: paymentMethod,
        ...formData,
    };

    try {
        const response = await axios.post("/api/memberships/apply", submissionData);
        alert("Application submitted successfully! Our staff will review your application and notify you soon. Thank you!");
      navigate('/events'); // ✅ 3. 신청 성공 후 이벤트 목록 페이지로 이동합니다.
    } catch (error) {
        // ✅ 중복 신청 체크
        if (error.response?.status === 409 || error.response?.data?.includes("already")) {
            alert("You have already applied for membership. Please wait for staff approval!");
        } else {
        alert("An error occurred during submission: " + (error.response?.data || error.message));
        }
    }
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
          
          {/* ✅ 산업 카테고리 선택 */}
          {formData.professionalStatus && formData.professionalStatus !== 'Student' && (
            <>
              <select name="industry" value={formData.industry} onChange={handleChange} className="w-full p-2 border rounded bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-200" required>
                <option value="">Select your industry</option>
                {industryCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formData.industry === 'Others' && (
                <input 
                  type="text" 
                  name="otherIndustry" 
                  placeholder="Please specify your industry" 
                  value={formData.otherIndustry}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-200" 
                  required
                />
              )}
            </>
          )}

          {/* ✅ Goal 선택 (Professional 계열만 표시) */}
          {formData.professionalStatus && formData.professionalStatus !== 'Student' && (
            <>
              <select name="networkingGoal" value={formData.networkingGoal} onChange={handleChange} className="w-full p-2 border rounded bg-green-50 focus:bg-white focus:ring-2 focus:ring-green-200" required>
                <option value="">What's your main goal?</option>
                {/* 비즈니스 네트워킹 */}
                <option value="Business Partner">Business Partner</option>
                <option value="Client / Customer">Client / Customer</option>
                <option value="Employee / Team Member">Employee / Team Member</option>
                <option value="Investor">Investor</option>
                <option value="Mentor / Advisor">Mentor / Advisor</option>
                {/* 일반 네트워킹 */}
                <option value="Expand Social Network">Expand Social Network</option>
                <option value="Make New Friends">Make New Friends</option>
                <option value="Find Hobby Partners">Find Hobby Partners</option>
                {/* 데이팅 & 관계 */}
                <option value="Dating & Relationships">Dating & Relationships</option>
                <option value="Find Life Partner">Find Life Partner</option>
                {/* 기타 */}
                <option value="Cultural Exchange">Cultural Exchange</option>
                <option value="Language Exchange">Language Exchange</option>
                <option value="Other">Other</option>
              </select>

              {/* ✅ Other 선택 시 텍스트 입력 필드 */}
              {formData.networkingGoal === 'Other' && (
                <input 
                  type="text" 
                  name="otherNetworkingGoal" 
                  placeholder="Please specify your goal..." 
                  value={formData.otherNetworkingGoal}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-200 mt-2" 
                  required
                />
              )}
            </>
          )}
          <select name="userType" value={formData.userType} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Where are you from?</option>
              <option value="taiwan">Taiwan</option>
              <option value="foreigner">International</option>
          </select>
          {formData.userType === 'foreigner' && (
            <>
            <select name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Select your country</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
              {formData.country === '— Others' && (
                <input 
                  type="text" 
                  name="otherCountry" 
                  placeholder="Please specify your country" 
                  value={formData.otherCountry}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-200" 
                  required
                />
              )}
            </>
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
            <option value="chinese-language">Chinese Language Student</option>
          </select>
          {(formData.userType === 'international' || formData.userType === 'exchange') && (
            <>
            <select name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Select your country</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
              {formData.country === '— Others' && (
                <input 
                  type="text" 
                  name="otherCountry" 
                  placeholder="Please specify your country" 
                  value={formData.otherCountry}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-yellow-200" 
                  required
                />
              )}
            </>
          )}
          <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} className="w-full p-2 border rounded" required />
          <select name="major" value={formData.major} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Select your field of study</option>
            {unifiedMajors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {formData.major === 'Others' && (
            <input 
              type="text" 
              name="otherMajor" 
              placeholder="Please specify your field of study" 
              value={formData.otherMajor}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-2" 
              required
            />
          )}
          {/* ✅ 세부 전공 입력 (선택사항) - 대분류 선택 후 나타남 */}
          {formData.major && formData.major !== 'Others' && (
            <input 
              type="text" 
              name="detailedMajor" 
              placeholder="Detailed Major (Optional) - e.g., Computer Science, Business Administration, International Relations" 
              value={formData.detailedMajor}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200" 
            />
          )}
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </>
      )}
      <input type="text" name="foodAllergies" placeholder="Any food allergies?" value={formData.foodAllergies} onChange={handleChange} className="w-full p-2 border rounded" />
      
      {/* ✅ 네트워킹 목적 섹션 (Taipei 전용) */}
      {selectedBranch === 'TAIPEI' && formData.professionalStatus && formData.professionalStatus !== 'Student' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
            <span className="mr-2">💼</span>
            Business Connections (Optional)
          </h4>
          <p className="text-xs text-purple-600 mb-4 italic">
            For business owners and professionals looking to expand their network with specific goals
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                👉 I am looking to connect with:
              </label>
              <select 
                name="networkingGoal" 
                value={formData.networkingGoal} 
                onChange={handleChange} 
                className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-purple-200"
              >
                <option value="">Select your networking goal (optional)</option>
                <option value="Business Partner">🤝 Business Partner</option>
                <option value="Client / Customer">💼 Client / Customer</option>
                <option value="Employee / Team Member">👥 Employee / Team Member</option>
                <option value="Investor">💰 Investor</option>
                <option value="Mentor / Advisor">🎯 Mentor / Advisor</option>
              </select>
            </div>
            
            {formData.networkingGoal && (
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  👉 Tell us briefly what you're looking for and how both sides can benefit
                </label>
                <textarea
                  name="networkingDescription"
                  value={formData.networkingDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Looking for a marketing partner to expand my café brand. I can offer event spaces in return."
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-purple-200 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ✅ SLAM을 알게 된 경로 질문 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3">How did you hear about SLAM events?</h4>
        <select 
          name="howDidYouHear" 
          value={formData.howDidYouHear} 
          onChange={handleChange} 
          className="w-full p-2 border rounded mb-3" 
          required
        >
          <option value="">Please select one...</option>
          <option value="Instagram">📱 Instagram</option>
          <option value="Facebook">📘 Facebook</option>
          <option value="Friend referral">👥 Friend referral</option>
          <option value="Club expo">🎪 Club expo</option>
          <option value="Joined Previous membership">🔄 Joined Previous membership</option>
          <option value="Other">✏️ Other</option>
        </select>
        
        {/* 친구 추천인 이름 입력 */}
        {formData.howDidYouHear === 'Friend referral' && (
          <input 
            type="text" 
            name="friendReferralName" 
            placeholder="Friend's name who referred you"
            value={formData.friendReferralName} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-2" 
            required
          />
        )}
        
        {/* 기타 소스 입력 */}
        {formData.howDidYouHear === 'Other' && (
          <input 
            type="text" 
            name="otherSource" 
            placeholder="Please specify how you heard about us"
            value={formData.otherSource} 
            onChange={handleChange} 
            className="w-full p-2 border rounded mt-2" 
            required
          />
        )}
      </div>
      
      <button type="submit" className="mt-8 w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Next: Select Payment Method</button>
    </form>
  );

    const renderPaymentForm = () => {
    const price = apiData.currentPrice || (apiData.currentMembers < apiData.earlyBirdCap ? 800 : 900);
    
    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">Choose Your Payment Method</h3>
            
            <div className="space-y-4 mb-8">
                <div 
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        paymentMethod === 'transfer' 
                            ? 'border-blue-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setPaymentMethod('transfer')}
                >
                    <div className="flex items-start space-x-4">
                        <div className="text-3xl">💳</div>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg">Bank Transfer</div>
                            <div className="text-sm text-gray-600 mt-1">Secure online payment via bank transfer</div>
                            <div className="text-xs text-blue-600 mt-2">Quick and convenient</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                            paymentMethod === 'transfer' 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                        } flex items-center justify-center`}>
                            {paymentMethod === 'transfer' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                    </div>
                </div>
                
                <div 
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                >
                    <div className="flex items-start space-x-4">
                        <div className="text-3xl">💵</div>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg">Cash Payment</div>
                            <div className="text-sm text-gray-600 mt-1">Pay in person at your first event</div>
                            <div className="text-xs text-green-600 mt-2">Flexible and easy</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                            paymentMethod === 'cash' 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300'
                        } flex items-center justify-center`}>
                            {paymentMethod === 'cash' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                    </div>
                </div>
            </div>

            {paymentMethod === 'transfer' && (
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-center mb-4">
                        <p className="font-bold text-blue-800 text-lg">📋 Transfer Details</p>
                    </div>
                    <div className="space-y-2 text-sm bg-white p-4 rounded-lg border border-blue-100">
                        <p><strong>Amount:</strong> {price} NTD</p>
                        <p><strong>Bank:</strong> {eventBankInfo?.bank || "(822) Cathay United Bank"}</p>
                        <p><strong>Account:</strong> {eventBankInfo?.account || "123-456-7890"}</p>
                        <p><strong>Account Name:</strong> {eventBankInfo?.accountName || "SLAM"}</p>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                            Last 5 digits of your bank account (for verification):
                        </label>
                <input
                  type="text"
                  name="bankLast5"
                            placeholder="e.g., 12345"
                  value={formData.bankLast5}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setFormData(prev => ({ ...prev, bankLast5: onlyDigits }));
                  }}
                            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                  inputMode="numeric"
                  pattern="\\d{5}"
                  maxLength={5}
                  required
                />
                    </div>
                </div>
            )}
            
            {paymentMethod === 'cash' && (
                <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-center">
                        <p className="font-bold text-green-800 text-lg">💵 Cash Payment Details</p>
                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-100">
                            <p className="font-bold text-green-700">Amount: {price} NTD</p>
                            <p className="text-sm text-green-600 mt-2">
                                Pay at your first event or during designated collection times
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                                ✅ We'll send you collection details via email after registration
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="text-center mt-8">
                <button 
                    onClick={handleFinalSubmit} 
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    disabled={!paymentMethod}
                >
                    {paymentMethod ? '🎉 Complete Application' : '⬆️ Please select a payment method'}
            </button>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {step === 0 && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Direct Access Not Allowed</h2>
            <p className="text-gray-600 mb-6">Please select a branch from the Events page to join membership.</p>
            <Link 
              to="/events" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Go to Events Page
            </Link>
          </div>
        )}
        {step === 1 && (
          <div>
            <SlamPromotionCard
              data={{...apiData, selectedBranch, registrationCloseDate: branchCloseDate || apiData.registrationCloseDate}}
              onRegisterClick={() => setStep(2)}
            />

            <div className="text-center mt-6">
              <Link
                to="/events"
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Events</span>
              </Link>
            </div>
          </div>
        )}
        {step === 2 && (
            <div>
            {/* 정보 입력 폼을 카드로 감싸기 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto">
            {renderInfoForm()}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Promotion</span>
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
            <div>
            {/* 결제 폼을 카드로 감싸기 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto">
                {renderPaymentForm()}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to edit info</span>
              </button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}