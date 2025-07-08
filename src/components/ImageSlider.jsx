// src/components/ImageSlider.jsx
import React from 'react';

const images = [
  "/bar.jpg",
  "/event.jpg",
  "/event2.jpg",
  "/event3.jpg",
  "/outing.jpg",
  //"/picnic_photo2.jpg",
  //"/picnic_photo3.jpg"
];

// 무한 루프 효과를 위해 이미지 목록을 복제합니다.
const allSlides = [...images, ...images];

export default function ImageSlider() {
  return (
    <div className="slider">
      <div className="slide-track">
        {allSlides.map((src, index) => (
          <div className="slide" key={index}>
            <img src={src} alt={`SLAM activity ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}