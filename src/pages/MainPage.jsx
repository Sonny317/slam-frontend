// src/pages/MainPage.jsx
import React from "react";
import MainHeader from "../components/MainHeader"; // 경로 주의

export default function MainPage() {
  return (
    <div className="font-sans text-gray-900">
      <MainHeader />

      <section className="relative py-20 px-6 text-white rounded-xl mx-auto mt-8 max-w-5xl overflow-hidden">
        <img src="/slam_logo_web_rgb.jpg" alt="SLAM Hero Logo" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
        <div className="relative z-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Connect, Learn, and Grow with a Community
          </h1>
          <p className="text-lg sm:text-xl">
            Join SLAM, the premier platform for language enthusiasts. Engage in cultural exchange, attend events, and improve your language skills.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
          Join a Vibrant Community of Language Learners
        </h2>
        <p className="text-center text-lg mb-12 max-w-3xl mx-auto">
          SLAM is more than just a language exchange platform; it's a global community of passionate learners.
          Connect with native speakers, participate in exciting events, and embark on a journey of cultural discovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-xl">100K+ Members</h3>
            <p className="text-sm text-gray-600 mt-2">
              Connect with a diverse community of language learners from around the globe.
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-xl">500+ Activities</h3>
            <p className="text-sm text-gray-600 mt-2">
              Participate in a wide range of activities, from online chats to in-person meetups.
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">🌍</div>
            <h3 className="font-semibold text-xl">200+ Languages</h3>
            <p className="text-sm text-gray-600 mt-2">
              Explore and learn over 200 languages with native speakers and fellow enthusiasts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
