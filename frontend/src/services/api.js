// API service — all calls to our Express backend
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Watchlist endpoints
export const getWatchlist = () => api.get('/watchlist');
export const addToWatchlist = (data) => api.post('/watchlist', data);
export const removeFromWatchlist = (tmdbId) => api.delete(`/watchlist/${tmdbId}`);
export const markAsWatched = (tmdbId) => api.patch(`/watchlist/${tmdbId}/watched`);
export const voteForMovie = (tmdbId) => api.post(`/watchlist/${tmdbId}/vote`);

// Review endpoints
export const getReviews = (tmdbId) => api.get(`/reviews/${tmdbId}`);
export const createReview = (tmdbId, data) => api.post(`/reviews/${tmdbId}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Badge endpoints
export const getMyBadges = () => api.get('/badges/me');

// Compatibility endpoints
export const getAllUsers = () => api.get('/auth/users');
export const getCompatibility = (userId) => api.get(`/auth/compatibility/${userId}`);

export default api;