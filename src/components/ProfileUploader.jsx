// src/components/ProfileUploader.jsx
import React, { useState } from "react";
import axios from "../api/axios"; // 커스텀 axios 인스턴스 사용한다고 가정

export default function ProfileUploader({ email }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요!");

    const formData = new FormData();
    formData.append("email", email); // 유저 식별용
    formData.append("file", file);   // 이미지 파일

    try {
      await axios.post("/api/users/upload-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("업로드 성공!");
    } catch (error) {
      alert("업로드 실패: " + (error?.response?.data || error.message));
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-2">프로필 업로드</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && <img src={previewUrl} alt="미리보기" className="mt-4 w-24 h-24 object-cover rounded-full" />}
      <button
        onClick={handleUpload}
        className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        업로드
      </button>
    </div>
  );
}
