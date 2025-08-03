// src/pages/MainPage.jsx

import React from 'react';
import ImageSlider from '../components/ImageSlider';
import { Link } from 'react-router-dom';

// --- Placeholder Icons ---
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-blue-600"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-blue-600"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-blue-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

// --- Mock Data ---
const testimonials = [
    { id: 1, name: "Jessica (Exchange Student)", rating: 5, comment: "SLAM helped me meet so many amazing local friends. It truly changed my semester!" },
    { id: 2, name: "Michael (Local Professional)", rating: 5, comment: "SLAM was the starting point for so many of my local friendships. My time in Taiwan would have been completely different without this community."},
    { id: 3, name: "Chloe (NTU Student)", rating: 5, comment: "The atmosphere is so relaxed! It's not a stressful study group. I've improved my English just by having fun and making friends." }
];

// --- Main Page Component ---
export default function MainPage() {
  return (
    <div className="font-sans text-gray-800 bg-white">
     
    {/* SECTION 1: Hero Hook - Mobile Optimized */}
    <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 text-white overflow-hidden">
    <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
        <source src="/Landing.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    
    {/* Enhanced overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10"></div>
    
    {/* Additional dark overlay for mobile */}
    <div className="absolute inset-0 bg-black/20 sm:bg-black/10 z-15"></div>
    
    <div className="relative z-20 max-w-5xl mx-auto py-8 sm:py-0">
        {/* Main headline with better mobile sizing */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-6 drop-shadow-lg">
        Study Less Achieve More
        </h1>
        
        {/* Subtext with improved mobile readability */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 drop-shadow-md">
        Tired of superficial connections?
        <br /><br />
        Transform your social life in a <span className="text-blue-300 font-bold bg-black/30 px-1 rounded">2-hour party</span>.
        <br /><br />
        We don't just host events; we <span className="text-blue-300 font-bold bg-black/30 px-1 rounded">design connections</span>.
        </p>
        
        {/* CTA button with enhanced mobile visibility */}
        <div className="mt-6 sm:mt-8 mb-8 sm:mb-0">
        <Link 
            to="/events" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-blue-500 hover:border-blue-400"
        >
            Find Your Next Event
        </Link>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 sm:hidden">
        <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
        </div>
    </div>
    </section>

    {/* SECTION 2: Problem Trinity - Optimized */}
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white">
    <div className="max-w-4xl mx-auto">
        {/* Title - Mobile optimized size */}
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-left">
        Ever Felt This Way in Taipei?
        </h2>
        
        {/* Content - Left aligned for better readability */}
        <div className="space-y-6 text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
        <p className="text-left">
            "<span className="text-blue-600 font-bold">90% of exchange students</span> only make friends with other exchange students before returning home..."
        </p>
        
        <p className="text-left">
            "Local students and professionals want to keep using their English, but can't find the <span className="text-blue-600 font-bold">right environment</span>..."
        </p>
        
        <p className="text-left">
            "It's always <span className="text-blue-600 font-bold">awkward to break into</span> a new social circle, especially for working professionals..."
        </p>
        </div>

    </div>
    
    </section>

<section className="relative py-16 md:py-20 px-4 sm:px-6 h-[60vh] md:h-[70vh] lg:h-[80vh]">
  <div className="absolute inset-0 bg-cover bg-no-repeat" 
       style={{
         backgroundImage: "url('/Lonely.jfif')",
         backgroundPosition: 'center center',
         backgroundSize: 'cover'
       }}>
  </div>
  <div className="absolute inset-0 bg-black/50"></div>
  
  <div className="relative z-10 max-w-3xl mx-auto text-center text-white h-full flex items-center justify-center">
    <div>
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Sound Familiar?
      </h3>
      <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
        You're not alone in feeling this way. Thousands of students and professionals in Taipei face the same challenge every day.
      </p>
    </div>
  </div>
</section>

      

      {/* SECTION 3: Solution Steps */}

      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">The <span className="text-blue-600">3-Step Formula</span> SLAM Uses to Transform Your Social Life</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                <div>
                    <h3 className="font-bold text-2xl mb-2 text-blue-600">Step 1: Get Connected</h3>
                    <p className="text-gray-600 leading-relaxed">Sign up and instantly access our <span className="text-blue-600 font-semibold">curated community</span>. No more awkward first encounters, just a network of friendly faces ready to meet you.</p>
                </div>
                <div>
                    <h3 className="font-bold text-2xl mb-2 text-blue-600">Step 2: Experience the Party</h3>
                    <p className="text-gray-600 leading-relaxed">Forget boring study groups. Our events are <span className="text-blue-600 font-semibold">high-energy parties</span> built around language games. This is where the walls come down and real connections begin.</p>
                </div>
                <div>
                    <h3 className="font-bold text-2xl mb-2 text-blue-600">Step 3: Build Your Story</h3>
                    <p className="text-gray-600 leading-relaxed">The party is just the start. Take the friendships you make and build <span className="text-blue-600 font-semibold">unforgettable memories</span>—exploring Taipei, joining sports activities, and creating your own adventures together.</p>
                </div>
            </div>
        </div>
        {/* Added Group Photo */}
        <div className="px-4 pt-12 md:px-6 md:pt-20">
            <img src="/group_photo.jpg" alt="SLAM Group Photo" className="rounded-xl shadow-lg w-full md:max-w-4xl mx-auto" />
        </div>
      </section>
    
      {/* SECTION 4: Social Proof & Authority */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Our Proof: Growth, Numbers, and Real Voices</h2>         
          {/* By the Numbers - 3개로 통합 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="flex flex-col items-center">
              <GlobeIcon className="w-16 h-16 text-blue-600 mb-4" />
              <p className="text-5xl md:text-6xl font-extrabold text-blue-600">500+</p>
              <h3 className="font-bold text-xl mt-2 mb-2">Total Members</h3>
              <p className="text-gray-600">From <span className="text-blue-600 font-semibold">6 to 500+</span> members in 3 years. We're not just growing, we're <span className="text-blue-600 font-bold">exploding</span>.</p>
            </div>             
            <div className="flex flex-col items-center">
              <UsersIcon className="w-16 h-16 text-blue-600 mb-4" />
              <p className="text-5xl md:text-6xl font-extrabold text-blue-600">6:4</p>
              <h3 className="font-bold text-xl mt-2 mb-2">Perfect Balance</h3>
              <p className="text-gray-600">The <span className="text-blue-600 font-bold">scientifically perfect</span> local-to-international ratio for ideal language exchange.</p>
            </div>             
            <div className="flex flex-col items-center">
              <TrendingUpIcon className="w-16 h-16 text-blue-600 mb-4" />
              <p className="text-5xl md:text-6xl font-extrabold text-blue-600">3</p>
              <h3 className="font-bold text-xl mt-2 mb-2">Fast Growing </h3>
              <p className="text-gray-600"><span className="text-blue-600 font-semibold">NCCU → NTU → Taipei</span> in just 3 years. Our proven model is <span className="text-blue-600 font-bold">unstoppable</span>.</p>
            </div>
          </div>

          {/* Our Growing Network - 간소화 */}
          <div className="mt-20">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">Our formula for connection isn't just an idea. <span className="text-blue-600">It works!</span></h3>
              <p className="text-lg text-gray-600 mb-12">Proven by our <span className="text-blue-600 font-semibold">rapid expansion</span> across Taiwan's top universities.</p>
         
              
              {/* 3. Image Slider Section */}
              <section className="bg-gray-50 py-10 mb-12">
                <ImageSlider />
              </section>
          </div>
        </div>
      </section>

      {/* Why SLAM? Comparison Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Why <span className="text-blue-600">SLAM</span>? Here's a side-by-side look.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="border-2 border-green-300 bg-green-50 p-8 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-2xl mb-6 text-green-700">🎯 With SLAM 🙂</h3>
                    <ul className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                        <li>
                            <h4 className="font-bold">✓ Future-Proof Network</h4>
                            <p className="mt-1 pl-6">Connect with a diverse circle of friends beyond your major or nationality - your future business partners, travel buddies, and lifelong confidants.</p>
                        </li>
                        <li>
                            <h4 className="font-bold">✓ Natural Practice Environment</h4>
                            <p className="mt-1 pl-6">Use languages naturally through genuine friendships, not awkward study sessions - laugh, debate, and bond in real conversations.</p>
                        </li>
                        <li>
                            <h4 className="font-bold">✓ Story Worth Telling</h4>
                            <p className="mt-1 pl-6">Create legendary memories with real locals and internationals you'll share for decades - not just tourist snapshots with strangers.</p>
                        </li>
                    </ul>
                </div>
                <div className="border-2 border-red-200 bg-red-50 p-8 rounded-2xl shadow-lg">
                    <h3 className="font-bold text-2xl mb-6 text-red-600">🎯 Without SLAM 😔</h3>
                    <ul className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
                        <li>
                            <h4 className="font-bold">✗ Same Circle Trap</h4>
                            <p className="mt-1 pl-6">Only hang out with people from your same major or nationality - missing the life-changing connections happening right next to you.</p>
                        </li>
                        <li>
                            <h4 className="font-bold">✗ Language Decay</h4>
                            <p className="mt-1 pl-6">Your language skills slowly rust away from lack of real conversation while fluent opportunities walk past you daily.</p>
                        </li>
                        <li>
                            <h4 className="font-bold">✗ What-If Syndrome</h4>
                            <p className="mt-1 pl-6">Fly home with that haunting regret: "What if I had connected with those amazing people I saw but never met?"</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Interview & Reviews Section */}
      <section className="py-24 sm:py-28 bg-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Watch our SLAM Story</h2>
            <div className="mb-20">
              <div className="max-w-md mx-auto bg-gray-900 p-2 rounded-xl shadow-2xl">
                  <video className="w-full rounded-lg" controls poster="/interview_thumbnail.jpg">
                      <source src="/interview.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                  </video>
              </div>
              <p className="text-center text-lg font-semibold mt-10 text-gray-800">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Members Review</h2>
              </p>
            </div>

            {/* Updated Reviews Section - All Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-gray-50 p-6 rounded-xl shadow-md">
                        <div className="flex mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-xl">★</span>
                            ))}
                        </div>
                        <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                        <p className="font-semibold text-blue-600">- {testimonial.name}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* SECTION 5: Pricing Anchor */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">The Other Ways to Make "Friends" in Taipei... And What They <span className="text-blue-600">Really Cost</span>.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div><h3 className="font-bold text-xl">General Language Meetups</h3><p className="text-gray-600 mt-2">Cost: <span className="text-blue-600 font-bold">300+ NTD.</span> Result: Awkward silences and Limited conversation opportunities.</p></div>
                <div><h3 className="font-bold text-xl">A Single Night Out</h3><p className="text-gray-600 mt-2">Cost: <span className="text-blue-600 font-bold">1000+ NTD.</span> Result: Enjoyable moments with fleeting connections.</p></div>
                <div><h3 className="font-bold text-xl">Premium Dating Apps</h3><p className="text-gray-600 mt-2">Cost: <span className="text-blue-600 font-bold">600+ NTD.</span> Result: Time spent browsing rather than connecting. </p></div>
            </div>
            <p className="mt-12 text-lg text-gray-800 font-semibold">The SLAM Way: We promise a time of <span className="text-blue-600">genuine friendships and priceless experiences,</span> for less than the cost of one night out.</p>
        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="py-20 sm:py-24 bg-white px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Still Hesitating? It's Okay. Everyone Asks These <span className="text-blue-600">Questions</span>.</h2>
            <div className="space-y-8">
                <div className="border-b pb-6">
                    <h3 className="font-bold text-lg sm:text-xl text-blue-600">Q. My English/Chinese isn't fluent. Is that okay?</h3>
                    <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">A. Absolutely! <span className="font-bold">Courage to connect is more important than perfection.</span> SLAM is a safe space to practice, make mistakes, and improve with friends who will cheer you on, not judge you.</p>
                </div>
                <div className="border-b pb-6">
                    <h3 className="font-bold text-lg sm:text-xl text-blue-600">Q. I'm a bit of an introvert. Will I fit in?</h3>
                    <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">A. Many of our members are! That's why our events are designed around <span className="font-bold">small-group activities.</span> You won't get lost in the crowd. You'll have meaningful conversations and find your people, we promise.</p>
                </div>
                <div className="border-b pb-6">
                    <h3 className="font-bold text-lg sm:text-xl text-blue-600">Q. Is this only for students?</h3>
                    <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">A. Not at all! SLAM TAIPEI is our open community for students, young professionals, and experts—anyone in the city who wants to connect as a 'person' <span className="font-bold">beyond age, nationality, or job title.</span></p>
                </div>
                 <div>
                    <h3 className="font-bold text-lg sm:text-xl text-blue-600">Q. How to Join SLAM?</h3>
                    <div className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed space-y-2">
                      <p><strong>Step 1: Sign Up (30 seconds) →</strong> Create your free account.</p>
                      <p><strong>Step 2: Book Your Spot (2 minutes) →</strong> Browse events, choose your branch, and complete the membership payment to secure your spot.</p>
                      <p><strong>Step 3: Show Up & Connect (2 hours) →</strong> Walk in nervous, walk out with new best friends.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 text-center bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Your social life deserves better.
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                Sign up to get involved in the <span className="text-blue-400 font-bold">unique community</span> in Taipei.
            </p>
            <Link to="/signup" className="bg-blue-500 text-white font-bold py-4 px-12 rounded-full text-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Become Part of Our Story
            </Link>
        </div>
      </section>
    </div>
  );
}