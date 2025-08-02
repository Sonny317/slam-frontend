import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from '../context/UserContext';

export default function MyPage() {
    const { user, updateUserImage } = useUser();
    
    const [userDetails, setUserDetails] = useState({
        userId: null,
        name: "",
        bio: "",
        posts: [],
        comments: [],
        membership: null,
    });
    const [showQrCode, setShowQrCode] = useState(false);
    const qrCodeValue = JSON.stringify({ userId: userDetails.userId, name: userDetails.name });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/users/me");
                const data = response.data;
                setUserDetails({
                    userId: data.userId,
                    name: data.name,
                    bio: data.bio || "자기소개를 작성해주세요.",
                    posts: [{ id: 1, title: "My 3-day trip itinerary for Hualien", date: "2025-07-12" }],
                    comments: [{ id: 1, content: "Sounds fun! I can join after 3 PM.", postTitle: "Anyone up for bouldering..." }],
                    membership: data.memberships && data.memberships.length > 0 ? { branch: data.memberships.join(', '), validUntil: "2025-12-31" } : null,
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        if(user.isLoggedIn) {
            fetchUserData();
        }
    }, [user.isLoggedIn]);

    const handleImageSelectAndUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/users/profile/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Profile image updated successfully.");
            const newImagePath = response.data.profileImage;
            if (newImagePath) {
                updateUserImage(newImagePath);
            }
        } catch (error) {
            alert("Upload failed: " + (error.response?.data?.message || error.message));
        }
    };

    const handleBioSave = async () => {
        try {
            const response = await axios.post("/api/users/profile/bio", {
                bio: userDetails.bio,
            });
            alert("Bio saved successfully.");
            setUserDetails(prev => ({ ...prev, bio: response.data.bio }));
        } catch (error) {
            alert("Save failed: " + (error.response?.data || "An error occurred."));
        }
    };

    const handleBioChange = (e) => {
        setUserDetails(prevDetails => ({ ...prevDetails, bio: e.target.value }));
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* ... JSX 코드는 동일 ... */}
        </div>
    );
}