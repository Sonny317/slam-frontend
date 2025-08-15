// src/pages/BrandStoryPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// 각 섹션을 위한 재사용 가능한 제목 컴포넌트
const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-8 md:mb-16">
    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{title}</h2>
    {subtitle && <p className="mt-3 md:mt-4 text-base md:text-xl text-gray-500">{subtitle}</p>}
  </div>
);

export default function BrandStoryPage() {
  const { user } = useUser(); 
  return (
    <div className="bg-white font-sans">
      <main className="mx-auto">
        
        {/* Hero Section */}
        <section className="relative text-center py-16 md:py-24 lg:py-32 px-4 md:px-6 flex items-center justify-center min-h-[80vh] md:min-h-screen text-white">
          <img 
            src="https://cdn.pixabay.com/photo/2024/02/23/10/18/friends-8591589_1280.jpg" 
            alt="Diverse friends talking and laughing" 
            className="absolute inset-0 w-full h-full object-cover z-0 filter blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10"></div>
          
          <div className="relative z-20 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 md:mb-10">
              When was the last time you <span className="text-blue-400">truly connected?</span>
            </h1>
            <div className="space-y-6 md:space-y-8">
              <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed px-4">
                We pass by countless people every day, but finding someone you can truly open up to is rare.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mx-4">
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium">
                  I found mine in the most unexpected place—and that's how SLAM began.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder's Story */}
<section className="py-12 md:py-16 lg:py-24 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 md:px-6">
    <SectionHeader
      title="How Choosing a Different Path Changed Everything"
      subtitle="The story that could be yours"
    />

    {/* 모바일 1열 → lg부터 2열. 이미지 블록은 1개만 사용 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
      {/* Left: Story Text — 폭 제한(가독성) */}
      <div className="space-y-6 md:space-y-8 lg:col-start-1 lg:max-w-[40rem] lg:pr-4">
        <div className="space-y-3">
          <p className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
            Most 18-year-olds sit in a university lecture hall.
          </p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 leading-relaxed">
            I chose a different seat — at a small English academy desk in Vietnam.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            That year changed everything: two years on a working holiday in Australia,
            travels through 21 countries, and one realization that has stayed with me ever since:
          </p>
        </div>

        <blockquote className="border-l-4 border-blue-500 pl-6 md:pl-8 py-4 md:py-6 my-8 md:my-10 bg-blue-50 rounded-r-lg">
          <p className="text-lg md:text-xl italic text-gray-700 leading-relaxed">
            <strong>"The environment shapes the person — and the person shapes the environment."</strong>
          </p>
        </blockquote>
      </div>

      {/* Right: Images — 데스크톱에서 sticky */}
      <div className="lg:col-start-2 lg:row-span-2 lg:sticky lg:top-24">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <img src="/About_us1.jpg" alt="Friends from around the world"
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg md:rounded-xl shadow-lg" />
          <img src="/About_us2.jpg" alt="A picnic with SLAM members"
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg md:rounded-xl shadow-lg" />
          <img src="/About_us3.jpg" alt="SLAM members laughing together"
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg md:rounded-xl shadow-lg" />
          <img src="/About_us4.jpg" alt="International and local friends"
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg md:rounded-xl shadow-lg" />
        </div>
      </div>

      {/* Left: 이어지는 본문 — 폭 제한 유지 */}
      <div className="space-y-6 lg:col-start-1 lg:max-w-[40rem] lg:pr-4">
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
        In an English-speaking country, your language skills can stagnate if you stay in your comfort zone.

<br></br><br></br>
It means even in Taiwan, the right environment — meeting new people and using English every day — can change not just your fluency, but your worldview.
        </p>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          What mattered most wasn’t perfect grammar or accent — it was the courage to step out, connect with people,
          create moments worth remembering, and carry those memories as strength for years to come.
        </p>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center p-6 md:p-8 rounded-xl shadow-lg">
          <p className="text-xl md:text-2xl font-bold leading-relaxed">
            We call this the SLAM Experience.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


        {/* Mission & Philosophy */}
        <section className="py-12 md:py-16 lg:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16 md:space-y-24">
            {/* The "Aha!" Moment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="md:pr-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">The Question That Started It All</h2>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 italic mb-4 md:mb-6 leading-snug">
                  “Why should these SLAM Experience moments happen only when traveling?”
                </p>
                <div className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed space-y-4">
                  <p>After my travels, I served in the military in Korea. Later, I came to Taiwan to study. Here, I realized something:</p>
                  <p>If we can create these connections abroad, <strong>why not make them part of our local life?</strong></p>
                  <p>SLAM exists to be the <strong>bridge that connects locals and internationals</strong>—turning a city into a space for global friendship.</p>
                </div>
              </div>
              <img src="/About_us5.jpg" alt="People playing a game at a SLAM event" className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl md:rounded-2xl shadow-lg" />
            </div>

            {/* Our Core Philosophy */}
            {/* Our Core Philosophy */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
  <div className="lg:max-w-[40rem] lg:pr-4">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
      Our Philosophy: Study Less, Achieve More
    </h2>
    <div className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed space-y-5">
      <p>
        <span className="text-blue-600 font-semibold">
          In SLAM, language is just a tool to connect people.
        </span>
      </p>
      <p>
        True achievement is <strong>building memories that travel with you</strong>—across countries
        and across time.
      </p>
      <p>
        It could be meeting a foreign friend in Taipei today, then visiting their home country years
        later and creating another chapter of your story together.
      </p>
      <p>
        That’s the SLAM Experience—<strong>learning less from books, and more from life itself.</strong>
      </p>
    </div>
  </div>

  <img
    src="/SLAMMEET10.jpg"
    alt="A large group photo of SLAM members"
    className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl md:rounded-2xl shadow-lg"
  />
</div>

          </div>
        </section>

        {/* Proof Section */}
        <section className="py-12 md:py-16 lg:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <SectionHeader 
              title="The Numbers Don’t Lie" 
              subtitle="Real results from real connections:"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
              <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg">
                <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600">500+</p>
                <p className="mt-2 text-sm md:text-base lg:text-lg font-semibold">Total Members</p>
                <p className="text-xs md:text-sm text-gray-500 mt-2">From just 6 to over 500 members in 3 years. We're not just growing—we're exploding.</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg">
                <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600">3</p>
                <p className="mt-2 text-sm md:text-base lg:text-lg font-semibold">Fast-Growing Communities</p>
                <p className="text-xs md:text-sm text-gray-500 mt-2">NCCU → NTU → Taipei in just 3 years. Our proven model is unstoppable.</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg">
                <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600">∞</p>
                <p className="mt-2 text-sm md:text-base lg:text-lg font-semibold">Lifelong Connections</p>
                 <p className="text-xs md:text-sm text-gray-500 mt-2">Because the friendships you make here don’t end when the event does.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-12 md:py-16 lg:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <SectionHeader 
              title="Find Your Tribe" 
              subtitle="From one small campus circle to three thriving communities—here’s where you’ll find us:"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <img src="/nccu.png" alt="SLAM NCCU Logo" className="w-12 h-12 md:w-16 md:h-16 mx-auto object-contain" />
                <h4 className="text-xl md:text-2xl font-semibold text-blue-600">SLAM NCCU</h4>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Where our journey began—the place that showed us the life-changing power of genuine connections.</p>
              </div>
              <div className="space-y-4">
                <img src="/ntu.png" alt="SLAM NTU Logo" className="w-12 h-12 md:w-16 md:h-16 mx-auto object-contain" />
                <h4 className="text-xl md:text-2xl font-semibold text-blue-600">SLAM NTU</h4>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Taiwan's top university, where ambitious minds from around the world connect and inspire each other.</p>
              </div>
              <div className="space-y-4">
                <img src="/taipei.png" alt="SLAM TAIPEI Logo" className="w-12 h-12 md:w-16 md:h-16 mx-auto object-contain" />
                <h4 className="text-xl md:text-2xl font-semibold text-blue-600">SLAM TAIPEI</h4>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Where the city connects. For professionals, freelancers, and business owners to network, collaborate, and build lasting friendships.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16 lg:py-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Ready to Find Your People?</h2>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              You never know—the next stranger you meet could become a part of your life story. Join the party where English is just the excuse. The real magic? Finding friends who make every day feel like an adventure.
            </p>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 font-bold py-3 md:py-4 px-8 md:px-12 rounded-full text-lg md:text-xl hover:bg-gray-100 transition-all transform hover:scale-105 inline-block shadow-lg"
            >
              Start Your Story Today
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}