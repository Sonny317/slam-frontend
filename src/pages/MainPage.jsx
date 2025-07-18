import React from 'react';
import ImageSlider from '../components/ImageSlider';
import { Link } from 'react-router-dom';

// --- Placeholder Icons ---
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-600"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-600"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

// --- Mock Data ---
const testimonials = [
    { id: 1, name: "Jessica (Exchange Student)", rating: 5, comment: "SLAM helped me meet so many amazing local friends. It truly changed my semester!" },
    { id: 2, name: "Michael (Local Professional)", rating: 5, comment: "As a professional, it's hard to find a fun, casual group to practice English. SLAM was the perfect fit." },
    { id: 3, name: "Chloe (NTU Student)", rating: 5, comment: "The atmosphere is so relaxed! It's not a stressful study group. I've improved my English just by having fun and making friends." }
];

// --- Main Page Component ---
export default function App() { // 또는 MainPage()
  return (
    <div className="font-sans text-gray-800 bg-white">
      
      {/* ==================================================================
          [1단계: 시선을 압도하는 첫인사 - The Hero Section]
      ================================================================== */}
        {/* 1. Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center px-6 text-white overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
            <source src="/Landing_page.mp4" type="video/mp4" />
            Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 z-10"></div>
            <div className="relative z-20 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                Study Less, Achieve More? <br /> We pack <span className="text-blue-400">a world of connections</span> into a 2-hour meetup.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                <span className="font-semibold">Discover in 3 minutes:</span> The secret formula for connecting locals and foreigners in just 2 hours.
            </p>
            <div className="mt-12">
                <Link to="/events" className="bg-blue-600 text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Find Your Next Event
                </Link>
            </div>
            </div>
        </section>

      {/* ==================================================================
          [2단계: 즉각적인 신뢰 구축 - The Social Proof Bar]
      ================================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto text-center px-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Taipei's Fastest-Growing International Community</h2>

            <p className="text-lg text-gray-700 mb-12">
                From 6 to <span className="text-blue-600 font-bold">500+ members</span> in 3 years. Taipei's fastest-growing international community.
            </p>
            <br></br>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center">
                    <GlobeIcon />
                    <h3 className="font-bold text-xl mt-2">A Global Melting Pot</h3>
                    <p className="text-gray-600 mt-1">Meet friends from diverse cultures around the world every semester.</p>
                </div>
                <div className="flex flex-col items-center">
                    <TrendingUpIcon />
                    <h3 className="font-bold text-xl mt-2">The SLAM Standard: From NCCU to NTU</h3>
                    <p className="text-gray-600 mt-1">A proven model of connection, now at Taiwan's premier universities.</p>
                </div>
                <div className="flex flex-col items-center">
                    <UsersIcon />
                    <h3 className="font-bold text-xl mt-2">A Dynamic Mix</h3>
                    <p className="text-gray-600 mt-1">A golden <span className="text-blue-600 font-bold">6:4 ratio</span> of locals to internationals provides the ideal environment for exchange.</p>
                </div>
            </div>
            <br></br>
            <div className="px-6 pt-20">
                <img src="/group_photo.jpg" alt="SLAM Group Photo" className="rounded-xl shadow-lg max-w-4xl mx-auto" />
            </div>
        </div>
      </section>

      {/* ==================================================================
          [3단계: 마음을 파고드는 공감대 형성 - The "Aha!" Moment]
      ================================================================== */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                <span className="text-blue-600">Ever Felt This Way in Taipei?</span>
            </h2>
            <div className="space-y-4 text-lg text-gray-700 mb-12 leading-relaxed">
                <p>"90% of exchange students only make friends with other exchange students..."</p>
                <p>"Local students and professionals want to practice English, but can't find the right environment..."</p>
                <p>"It's hard to break into a new social circle, especially for working professionals in a new city..."</p>
            </div>
            <br></br>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                What's SLAM's <span className="text-blue-600">secret formula</span> that connects locals and foreigners in 2 hours?
            </h3>
            <br></br>
            <p className="text-lg text-gray-600 leading-relaxed">
                It’s not magic. It's by <span className="text-blue-600 font-semibold">design.</span> <br></br> We've crafted a unique environment <br></br>where language is just a tool, and genuine human connection is the goal.
            </p>
        </div>
      </section>

      {/* 3. Image Slider Section */}
      <section className="bg-gray-50 py-10">
        <ImageSlider />
      </section>

      {/* ==================================================================
          [4단계: 모든 의심을 해소하는 증거 - The Deep Dive]
      ================================================================== */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Why SLAM? Here’s a side-by-side look.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-2 border-green-300 bg-green-50 p-8 rounded-xl shadow-md">
                    <h3 className="font-bold text-2xl mb-4 text-green-700">With SLAM ✅</h3>
                    <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
                        <li>Build a diverse circle of friends <span className="text-blue-600 font-semibold">beyond your major or nationality.</span></li>
                        <li>Actually <span className="text-blue-600 font-semibold">use</span> the language you're learning in real conversations, every single week.</li>
                        <li>Connect with students and professionals who become your <span className="text-blue-600 font-semibold">future colleagues, co-founders, or lifelong friends.</span></li>
                        <li>Turn your time in Taiwan from 'just another study experience' into a <span className="text-blue-600 font-semibold">life-changing chapter.</span></li>
                    </ul>
                </div>
                <div className="border-2 border-red-200 bg-red-50 p-8 rounded-xl shadow-md">
                    <h3 className="font-bold text-2xl mb-4 text-red-600">Without SLAM ❌</h3>
                    <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
                        <li>Your contact list is full, but you still feel alone in a crowd.</li>
                        <li>Your language skills get rusty from lack of real conversation.</li>
                        <li>Your Taipei story ends with just bubble tea, night markets, and tourist spots.</li>
                        <li>You go back home thinking, "What if...?"</li>
                    </ul>
                </div>
            </div>

            <div className="text-center mt-24 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Don't Just Take Our Word For It.</h2>
                <p className="text-lg text-gray-600 mt-2">Hear From Our Members.</p>
            </div>
            
            {/* [동영상 수정] 크기 조절 및 코드 정리 */}
            <div className="mb-16">
                {/* 1. 크기 조절을 위한 컨테이너 추가: max-w-sm (최대 가로폭 24rem) 및 mx-auto (가운데 정렬) */}
                <div className="max-w-sm mx-auto bg-gray-900 p-2 rounded-xl shadow-2xl">
                    <video
                        className="w-full rounded-lg"
                        controls // 재생, 정지, 볼륨 등 컨트롤러를 보여줍니다.
                        poster="/interview_thumbnail.jpg" // 썸네일 이미지 경로 (public 폴더 기준)
                    >
                        {/* 2. 파일 형식 및 타입 수정: .mov -> .mp4, type="video/mov" -> type="video/mp4" */}
                        <source src="/interview.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                 <p className="text-center text-lg font-semibold mt-4 text-gray-800">
                    <span className="text-blue-600">Hear directly from SLAM members</span>, exchange and local students.
                </p>
            </div>

            <div className="space-y-8 max-w-3xl mx-auto">
                {testimonials.map(review => (
                    <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center mb-2">
                            <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
                        </div>
                        <p className="text-gray-800 italic text-lg mb-4 leading-relaxed">"{review.comment}"</p>
                        <p className="text-right font-semibold text-gray-700">- <span className="text-blue-600">{review.name}</span></p>
                    </div>
                ))}
            </div>

            <section className="py-20 px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Growing Network Across Taipei</h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2">SLAM NCCU</h3>
                        <p className="text-gray-600 leading-relaxed">The vibrant starting point of our community, uniting local and international students at National Chengchi University.</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2">SLAM NTU</h3>
                        <p className="text-gray-600 leading-relaxed">Expanding our reach to Taiwan's top university, creating even more diverse and dynamic language exchange opportunities.</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2">SLAM TAIPEI</h3>
                        <p className="text-gray-600 leading-relaxed">Our newest branch for students and young professionals across the city to connect, learn, and grow together.</p>
                    </div>
                </div>
            </section>
        </div>
      </section>

      {/* ==================================================================
          [5단계: 마지막 망설임 제거 - FAQ]
      ================================================================== */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Still Hesitating? Let's Clear Things Up.</h2>
            <div className="space-y-8">
                <div className="border-b pb-6">
                    <h3 className="font-bold text-xl text-blue-600">Q. My English/Chinese isn't fluent. Is that okay?</h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">A. Absolutely! You don't need to be fluent. As long as you have a basic conversational ability and the willingness to try, you'll fit right in. We believe confidence grows from connection, not perfection. SLAM is a safe space to practice, make mistakes, and improve with friends who will cheer you on, not judge you.</p>
                </div>
                <div className="border-b pb-6">
                    <h3 className="font-bold text-xl text-blue-600">Q. I'm a bit of an introvert. Will I fit in?</h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">A. Many of our members are! That's why we design our events around small-group activities. You won't get lost in the crowd. You'll have meaningful conversations and find your people, we promise.</p>
                </div>
                <div>
                    <h3 className="font-bold text-xl text-blue-600">Q. Is this only for students?</h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">A. Not at all! While SLAM started at universities, `SLAM TAIPEI` is our open community for students, young professionals, and anyone in the city looking for genuine connections and growth.</p>
                </div>
            </div>
        </div>
      </section>

      {/* ==================================================================
          [6단계: 부담 없는 최종 제안 - The Final CTA]
      ================================================================== */}
      <section className="py-24 px-6 text-center bg-gray-800 text-white">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-400">
                Haven't signed up for SLAM yet?<div></div>Your social life deserves better.
            </h2>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Sign up to get involved in the unique commuity in Taipei.
            </p>
            <Link to="/signup" className="bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get Notified for the Next Event
            </Link>
        </div>
      </section>

    </div>
  );
}
