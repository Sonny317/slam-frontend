// src/pages/PartnershipPage.jsx
import React from 'react';

// 가짜 파트너 데이터
const partners = [
  { id: 1, name: "The Local Pub", benefit: "10% off all drinks", logo: "/partner_logo_1.png" },
  { id: 2, name: "Taipei Bistro", benefit: "Free appetizer with main course", logo: "/partner_logo_2.png" },
  { id: 3, name: "Gamer's Cafe", benefit: "1 hour free on weekdays", logo: "/partner_logo_3.png" },
];

export default function PartnershipPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Our Partners</h1>
      <p className="text-lg text-gray-600 text-center mb-10">
        SLAM members get exclusive benefits at these amazing places!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white rounded-lg shadow-md p-6 text-center">
            <img src={partner.logo} alt={`${partner.name} logo`} className="h-20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{partner.name}</h2>
            <p className="text-blue-600 font-bold">{partner.benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}