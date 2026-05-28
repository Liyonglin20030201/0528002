import api from './api';

export const authService = {
  login: (data) => api.post('/users/login/', data),
  register: (data) => api.post('/users/register/', data),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  getFavorites: () => api.get('/users/favorites/'),
  addFavorite: (data) => api.post('/users/favorites/', data),
  removeFavorite: (id) => api.delete(`/users/favorites/${id}/`),
};

export const newsService = {
  getCategories: () => api.get('/news/categories/'),
  getList: (params) => api.get('/news/', { params }),
  getDetail: (id) => api.get(`/news/${id}/`),
};

export const experienceService = {
  getList: (params) => api.get('/experience/posts/', { params }),
  getDetail: (id) => api.get(`/experience/posts/${id}/`),
  create: (data) => api.post('/experience/posts/', data),
  like: (id) => api.post(`/experience/posts/${id}/like/`),
  getComments: (postId) => api.get(`/experience/posts/${postId}/comments/`),
  addComment: (postId, data) => api.post(`/experience/posts/${postId}/comments/`, data),
};

export const resourceService = {
  getCategories: () => api.get('/resources/categories/'),
  getList: (params) => api.get('/resources/', { params }),
  upload: (formData) => api.post('/resources/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  download: (id) => api.post(`/resources/${id}/download/`),
};

export const topicService = {
  getCategories: (params) => api.get('/topics/categories/', { params }),
  getList: (params) => api.get('/topics/', { params }),
  getDetail: (id) => api.get(`/topics/${id}/`),
  create: (data) => api.post('/topics/', data),
  getReplies: (topicId) => api.get(`/topics/${topicId}/replies/`),
  addReply: (topicId, data) => api.post(`/topics/${topicId}/replies/`, data),
};
