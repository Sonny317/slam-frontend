// src/components/ShareMenu.jsx
import React from 'react';

export default function ShareMenu({ title, text, url, variant = 'icon' }) {
  const handleShare = async (e) => {
    e?.preventDefault?.();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (_) {
      // ignore and fallback
    }

    try {
      if (url && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      } else if (url) {
        // Very old fallback
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      alert('Unable to share.');
    }
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleShare}
        className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <span>🔗</span>
        <span>Share</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
      title="Share"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
    </button>
  );
}


