// src/pages/BrandStoryPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandStoryPage() {
  return (
    <div className="bg-white font-sans">
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="space-y-16">
          {/* Step 1: Asking a Question */}
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              When was the last time you felt truly excited to meet someone new?
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              We pass by countless people every day, but it's always hard to find a 'real connection'—someone you can open up to and who broadens your world. SLAM's story began with that exact same feeling.
            </p>
          </section>

          {/* Step 2: The Founder's Journey */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Founder's Journey</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                I didn't take the usual path. After high school, I got on a plane to Vietnam to learn English. There, for the first time in my life, I made a "foreign friend." That experience led me to a bigger world, Australia, and that journey then led me to Europe.
              </p>
          {/* ===== 이미지 갤러리 (가로 배열) ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <img src="/About_us1.jpg" alt="Friends from around the world" className="w-full h-48 object-cover rounded-lg shadow-md" />
            <img src="/About_us2.jpg" alt="A picnic with SLAM members" className="w-full h-48 object-cover rounded-lg shadow-md" />
            <img src="/About_us3.jpg" alt="SLAM members laughing together" className="w-full h-48 object-cover rounded-lg shadow-md" />
            <img src="/About_us4.jpg" alt="International and local friends" className="w-full h-48 object-cover rounded-lg shadow-md" />
          </div>
              
              <p>
                With just a backpack, I traveled through 21 countries, meeting new friends in countless hostels. At the end of all my travels, I realized one thing. What truly changed my life wasn't perfect English, but the courage to open my heart first. Those special memories gave me a strong belief.
              </p>
            </div>
          </section>

          {/* Step 3: The "Aha!" Moment & Mission */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The "Aha!" Moment</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p className="text-2xl font-semibold text-blue-600 italic">
                "Why do these magical moments have to happen only on special, expensive trips? Can't I bring that feeling right here, to our daily lives in Taipei?"
              </p>
              <p>
                That single question was the start of SLAM. It was sad to see foreigners in Taipei having a hard time making local friends, and locals missing chances to connect. I wanted to give them the same joy of connection that I had felt.
              </p>
            </div>
          </section>
          
          {/* Step 4: Our Core Philosophy */}
          <section>
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Philosophy</h2>
             <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p className="text-2xl font-semibold text-gray-800">
                    SLAM stands for <span className="text-blue-600">'Study Less, Achieve More.'</span>
                </p>
                <p>
                    We refuse to see language as something you just 'study'. We believe language is the most powerful and fun 'tool' for connecting people's hearts. That's why SLAM is not a traditional 'language exchange.' We are a party-style community based on language games, creating natural laughter and genuine connections.
                </p>
                {/* 여기에 '게임 사진'이나 '바 같이 간 사진'을 넣으면 좋습니다. */}
                {/* ===== 이미지 높이 조절 ===== */}
                <img src="/About_us5.jpg" alt="People playing a game at a SLAM event" className="w-full max-h-[800px] object-cover rounded-lg shadow-md my-8" />
             </div>
          </section>

          {/* Step 5: The Overwhelming Proof */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Overwhelming Proof</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>Our sincere desire for connection was met with an explosive response.</p>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-bold">Proven Success:</span> In just two years, SLAM expanded from NCCU to Taiwan's top university, NTU.</li>
                <li><span className="font-bold">Overwhelming Popularity:</span> Every semester, over 100 people apply for just 80 spots.</li>
                <li><span className="font-bold">The Ideal Environment:</span> We broke the stereotype and created an ideal 6:4 ratio of local and international members.</li>
              </ul>
              {/* 여기에 '단체 사진'을 넣으면 가장 효과적입니다. */}
              <img src="/about_us6.jpg" alt="A large group photo of SLAM members" className="rounded-lg shadow-md my-8" />
            </div>
          </section>

          {/* Step 6: Our Vision & CTA */}
          <section className="text-center bg-gray-100 p-8 sm:p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision for You</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're now starting 'SLAM TAIPEI' for everyone—students, young professionals, and experts. We invite you to a party where you'll find lifelong friends, not just study a language.
            </p>
            <Link to="/signup" className="bg-blue-600 text-white font-bold py-4 px-10 rounded-full text-xl hover:bg-blue-700 transition-transform transform hover:scale-105 inline-block">
              Become Part of Our Story
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}
