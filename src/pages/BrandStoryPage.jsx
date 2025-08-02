// src/pages/BrandStoryPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// 각 섹션을 위한 재사용 가능한 제목 컴포넌트
const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="mt-4 text-xl text-gray-500">{subtitle}</p>}
  </div>
);

export default function BrandStoryPage() {
  return (
    <div className="bg-white font-sans">
      <main className="mx-auto">
        
        {/* Step 1: Asking a Question (새로운 배경 이미지 및 블러/그라데이션 적용) */}
        <section className="relative text-center py-32 sm:py-48 px-6 flex items-center justify-center min-h-screen text-white">
          {/* 배경 이미지 */}
          <img 
            src="https://cdn.pixabay.com/photo/2024/02/23/10/18/friends-8591589_1280.jpg" 
            alt="Diverse friends talking and laughing" 
            className="absolute inset-0 w-full h-full object-cover z-0 filter blur-sm"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10"></div>
          
          <div className="relative z-20">
            <h1 className="text-5xl sm:text-7xl font-black leading-tight">
              When was the last time you felt truly <span className="text-blue-400">excited</span> to meet someone new?
            </h1>
            <p className="mt-10 text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              We pass by countless people every day, but it's always hard to find a 'real connection'—someone you can open up to and who broadens your world. SLAM's story began with that exact same feeling.
            </p>
          </div>
        </section>

        {/* Step 2: The Founder's Journey (텍스트-이미지 레이아웃 변경) */}
        <section className="py-24 sm:py-28 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeader title="The Founder's Journey" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* 왼쪽: 스토리 텍스트 */}
              <div className="space-y-6">
                <p className="text-2xl font-semibold text-gray-800 leading-relaxed">
                  I didn't take the usual path. After high school, I got on a plane to Vietnam to learn English. There, for the first time in my life, I made a "foreign friend."
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  That experience led me to a bigger world, Australia, and that journey then led me to Europe. With just a backpack, I traveled through 21 countries, meeting new friends in countless hostels.
                </p>
                <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8">
                  <p className="text-xl italic text-gray-700">
                    What truly changed my life wasn't perfect English, but the <span className="font-semibold text-blue-600">courage to open my heart first.</span> Those special memories gave me a strong belief.
                  </p>
                </blockquote>
              </div>
              {/* 오른쪽: 이미지 갤러리 */}
              <div className="grid grid-cols-2 gap-4">
                <img src="/About_us1.jpg" alt="Friends from around the world" className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform" />
                <img src="/About_us2.jpg" alt="A picnic with SLAM members" className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform" />
                <img src="/About_us3.jpg" alt="SLAM members laughing together" className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform" />
                <img src="/About_us4.jpg" alt="International and local friends" className="w-full h-80 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 & 4: Mission & Philosophy */}
        <section className="py-24 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 space-y-24">
            {/* The "Aha!" Moment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="md:pr-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">The "Aha!" Moment</h2>
                <p className="text-3xl font-bold text-blue-600 italic mb-6 leading-snug">
                  "Why do these magical moments have to happen only on special trips?"
                </p>
                <p className="text-xl text-gray-600 leading-relaxed">
                  That single question was the start of SLAM. I wanted to give everyone in Taipei the same joy of connection that I had felt during my travels.
                </p>
              </div>
              <img src="/About_us5.jpg" alt="People playing a game at a SLAM event" className="w-full h-full object-cover rounded-2xl shadow-lg" />
            </div>

            {/* Our Core Philosophy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <img src="/about_us6.jpg" alt="A large group photo of SLAM members" className="w-full h-full object-cover rounded-2xl shadow-lg md:order-2" />
              <div className="md:pl-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Philosophy</h2>
                <p className="text-3xl font-bold text-gray-800 mb-6 leading-snug">
                  SLAM stands for <span className="text-blue-600">'Study Less, Achieve More.'</span>
                </p>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We believe language is a 'tool' for connecting people's hearts. That's why SLAM is a party-style community, creating natural laughter and genuine connections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5: The Overwhelming Proof */}
        <section className="py-24 sm:py-28 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeader title="The Overwhelming Proof" subtitle="Our formula for connection isn't just an idea—it works."/>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <p className="text-6xl font-extrabold text-blue-600">2</p>
                <p className="mt-2 text-lg font-semibold">Years of Proven Success</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <p className="text-6xl font-extrabold text-blue-600">100+</p>
                <p className="mt-2 text-lg font-semibold">Applicants Every Semester</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <p className="text-6xl font-extrabold text-blue-600">6:4</p>
                <p className="mt-2 text-lg font-semibold">Golden Ratio of Members</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative text-center py-24 sm:py-28 px-4 flex items-center justify-center min-h-screen text-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                  <h4 className="text-2xl font-semibold mb-2 text-blue-600">SLAM NCCU</h4>
                  <p className="text-gray-600 leading-relaxed">The vibrant <span className="text-blue-600 font-semibold">starting point</span> of our community, uniting students at National Chengchi University.</p>
              </div>
              <div>
                  <h4 className="text-2xl font-semibold mb-2 text-blue-600">SLAM NTU</h4>
                  <p className="text-gray-600 leading-relaxed">Expanding our reach to <span className="text-blue-600 font-semibold">Taiwan's top university</span>, creating even more dynamic opportunities.</p>
              </div>
              <div>
                  <h4 className="text-2xl font-semibold mb-2 text-blue-600">SLAM TAIPEI</h4>
                  <p className="text-gray-600 leading-relaxed">Our <span className="text-blue-600 font-semibold">newest branch</span> for students and young professionals across the city to connect.</p>
              </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gray-800 text-white p-16 sm:p-24 my-10">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Vision for You</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              We invite you to a party where you'll find lifelong friends, not just study a language. Experience the special connection you only felt while traveling, now regularly in Taipei.
            </p>
            <Link to="/signup" className="bg-blue-600 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-blue-700 transition-transform transform hover:scale-105 inline-block">
              Become Part of Our Story
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
