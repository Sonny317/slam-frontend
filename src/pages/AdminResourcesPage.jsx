// src/pages/AdminResourcesPage.jsx
import React from 'react';

const resources = [
  { title: 'Instagram & Google Drive', description: 'Access main accounts and shared files.', link: '#' },
  { title: 'Canva Templates', description: 'Official templates for posts and stories.', link: '#' },
  { title: 'SLAM Logos', description: 'Download high-resolution logo files.', link: '#' },
  { title: 'Club Rules & Guidelines', description: 'Official rules for all members and staff.', link: '#' },
  { title: 'AI Tools for PR Team', description: 'Links to GPTS for content creation.', link: '#' },
  { title: 'AI Tools for EP Team', description: 'Links to GPTS for event planning.', link: '#' },
];

export default function AdminResourcesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Materials & Rules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(res => (
          <a href={res.link} key={res.title} target="_blank" rel="noopener noreferrer" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-blue-600">{res.title}</h2>
            <p className="text-gray-600 mt-2">{res.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
