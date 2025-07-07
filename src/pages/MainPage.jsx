// src/pages/MainPage.jsx
import React from 'react';
import ImageSlider from '../components/ImageSlider';
import { Link } from 'react-router-dom';

// MVP를 위해, 실제 데이터 대신 가짜 데이터를 사용합니다.
const testimonials = [
    { id: 1, name: "Jessica (Exchange Student)", rating: 5, comment: "I was worried I'd only hang out with other exchange students, but SLAM helped me meet so many amazing local friends. It truly changed my semester!" },
    { id: 2, name: "Michael (Local Professional)", rating: 5, comment: "As a professional, it's hard to find a fun, casual group to practice English. SLAM was the perfect fit. Great events and even better people." },
    { id: 3, name: "Chloe (NTU Student)", rating: 5, comment: "The atmosphere is so relaxed! It's not a stressful study group. I've improved my English just by having fun and making friends." }
];

export default function MainPage() {
  return (
    <div className="font-sans text-gray-800 bg-white"> {/* 전체 배경을 흰색으로 */}

      {/* 1. Hero Section (Hooking) - 수정된 부분 */}
      <section className="text-center px-6 py-24"> {/* 배경 이미지를 빼고, 패딩(여백)을 줍니다. */}
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4 text-gray-900">
          {/* 핵심 문구에만 다른 색상을 줍니다. */}
          <span className="text-blue-600">Study Less, Achieve More.</span>
          <br />
          The International Party Community
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Welcome to SLAM, the premier platform for language enthusiasts. <br></br>Engage in a party with language lovers and belong to our relaxed community.
        </p>
        <div className="mt-8">
          <Link to="/events/pilot" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
            Join Our Next Event
          </Link>
        </div>
      </section>

      {/* ===== 단체사진 섹션 추가 ===== */}
      <div className="px-6 py-10">
      <img src="/group_photo.jpg" alt="SLAM Group Photo" className="rounded-xl shadow-lg max-w-4xl mx-auto" />
      </div>

      {/* 2. Authority Section (Our Branches) */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">Our Growing Network Across Taipei</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">SLAM NCCU</h3>
            <p className="text-gray-600">The vibrant starting point of our community, uniting local and international students at National Chengchi University.</p>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">SLAM NTU</h3>
            <p className="text-gray-600">Expanding our reach to Taiwan's top university, creating even more diverse and dynamic language exchange opportunities.</p>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-2">SLAM TAIPEI</h3>
            <p className="text-gray-600">Our newest branch for students and young professionals across the city to connect, learn, and grow together.</p>
          </div>
        </div>
      </section>

      {/* 3. Problem & Solution Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Ever Felt This Way in Taipei?</h2>
          <div className="space-y-6 text-lg text-center text-gray-700">
            <p>"90% of exchange students only make friends with other exchange students..."</p>
            <p>"Local students and professionals want to practice English, but can't find the right environment..."</p>
            <p>"It's hard to break into a new social circle, especially for working professionals in a new city..."</p>
          </div>
<br></br>
          <div className="text-center my-12">
            <h2 className="text-3xl font-bold text-gray-800">
              We Broke The Barrier.
            </h2>
            <p className="text-lg text-gray-500 mt-2">SLAM is your bridge to a global network.</p>
          </div>



          {/* ===== 동적 이미지 슬라이더 삽입 ===== */}
          <ImageSlider />


          <h2 className="text-3xl font-bold text-center mb-6">This Is How SLAM Changes Your Game.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="border-2 border-gray-200 p-8 rounded-lg">
            <h3 className="font-bold text-xl mb-4 text-blue-600">With SLAM ✅</h3>
            <ul className="list-disc list-inside space-y-2">
                <li>Meet genuine local & international friends.</li>
                <li>Practice the language you want in a fun, party-like setting.</li>
                <li>Build a real, diverse social and professional network.</li>
                <li>Create unforgettable memories during your time in Taiwan.</li>
              </ul>
            </div>
            <div className="border-2 border-gray-200 p-8 rounded-lg bg-gray-50">
              <h3 className="font-bold text-xl mb-4 text-red-500">Without SLAM ❌</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Hanging out only with people from your own background.</li>
                <li>Losing your language skills from lack of practice.</li>
                <li>Missing the chance to truly experience local culture.</li>
                <li>Going back home with regrets.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Authority Section (Testimonials / Reviews) */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Don't Just Take Our Word For It</h2>
          <div className="space-y-8">
            {testimonials.map(review => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
                </div>
                <p className="text-gray-800 italic mb-4">"{review.comment}"</p>
                <p className="text-right font-semibold text-gray-600">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 5. Final CTA Section */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Social Life?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Your path to an unforgettable journey in Taipei starts here. Spots for our events are limited and fill up fast. Don't miss out!
        </p>
        <Link to="/signup" className="bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-green-600 transition-transform transform hover:scale-105">
          Sign Up Now & Get Notified!
        </Link>
      </section>
    </div>
  );
}

