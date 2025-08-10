import axios from './axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', {
      email,
      password,
    });

    const { token, profileImage, name, role } = response.data;

    // Use localStorage to persist auth info
    localStorage.setItem("userEmail", email);
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    
    return response.data;
  } catch (error) {
    // Clear all auth info if login fails
    localStorage.clear();
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || "Registration failed";
  }
};

export const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post("/auth/send-verification-code", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkEmail = async (email) => {
  try {
    const response = await axios.get('/api/auth/check-email', { params: { email } });
    return response.data; // { available: boolean }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resolveAuthorsBatch = async (authors) => {
  try {
    const response = await axios.post('/api/users/resolve-batch', { authors });
    return response.data; // { [author]: { found, userId, name, email, profileImage } }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify code API (used by Verify button)
export const verifyCode = async (email, code) => {
  try {
    const response = await axios.post('/auth/verify-code', { email, code });
    return response.data; // { valid: boolean }
  } catch (error) {
    throw error.response?.data || error;
  }
};