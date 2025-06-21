import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const uploadImage = async (imageFile) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_URL}/api/gallerie`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getImages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/gallerie`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  uploadImage,
  getImages
};