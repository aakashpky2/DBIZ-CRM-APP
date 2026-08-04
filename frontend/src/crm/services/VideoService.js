import api from './api';

export const fetchVideos = (category = '') => api.get(`/learning/videos${category ? `?category=${encodeURIComponent(category)}` : ''}`);
export const addVideo = (youtube_url, category) => api.post('/learning/videos', { youtube_url, category });
export const updateVideo = (id, youtube_url, category) => api.put(`/learning/videos/${id}`, { youtube_url, category });
export const deleteVideo = (id) => api.delete(`/learning/videos/${id}`);
