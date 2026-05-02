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

// Admin endpoints
export const adminGetUsers = () => api.get('/auth/admin/users');
export const adminGetReviews = () => api.get('/auth/admin/reviews');
export const adminGetStats = () => api.get('/auth/admin/stats');
export const adminUpdateUserRole = (id, role) => api.patch(`/auth/admin/users/${id}/role`, { role });
export const adminDeleteUser = (id) => api.delete(`/auth/admin/users/${id}`);
export const adminDeleteReview = (id) => api.delete(`/auth/admin/reviews/${id}`);


// Friend endpoints
export const getFriends = () => api.get('/friends');
export const getPendingRequests = () => api.get('/friends/pending');
export const getSentRequests = () => api.get('/friends/sent');
export const sendFriendRequest = (userId) => api.post(`/friends/request/${userId}`);
export const respondToFriendRequest = (id, action) => api.patch(`/friends/respond/${id}`, { action });
export const removeFriendApi = (userId) => api.delete(`/friends/${userId}`);

// Collaborative list endpoints
export const getMyCollabLists = () => api.get('/collab');
export const getCollabList = (id) => api.get(`/collab/${id}`);
export const createCollabList = (data) => api.post('/collab', data);
export const deleteCollabList = (id) => api.delete(`/collab/${id}`);
export const addItemToCollab = (id, data) => api.post(`/collab/${id}/items`, data);
export const removeItemFromCollab = (id, tmdbId) => api.delete(`/collab/${id}/items/${tmdbId}`);
export const voteCollabItem = (id, tmdbId) => api.post(`/collab/${id}/items/${tmdbId}/vote`);
export default api;