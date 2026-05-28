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

export const messageService = {
  getNotifications: (params) => api.get('/messages/notifications/', { params }),
  getUnreadCount: () => api.get('/messages/notifications/unread_count/'),
  markRead: (id) => api.post(`/messages/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/messages/notifications/mark_all_read/'),
  getConversations: () => api.get('/messages/conversations/'),
  createConversation: (userId) => api.post('/messages/conversations/', { user_id: userId }),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, content) => api.post(`/messages/conversations/${conversationId}/send/`, { content }),
};

export const studyplanService = {
  getPlans: (params) => api.get('/studyplan/plans/', { params }),
  getPlanDetail: (id) => api.get(`/studyplan/plans/${id}/`),
  createPlan: (data) => api.post('/studyplan/plans/', data),
  updatePlan: (id, data) => api.patch(`/studyplan/plans/${id}/`, data),
  deletePlan: (id) => api.delete(`/studyplan/plans/${id}/`),
  togglePlanStatus: (id, status) => api.post(`/studyplan/plans/${id}/toggle_status/`, { status }),
  getTodos: (planId, params) => api.get(`/studyplan/plans/${planId}/todos/`, { params }),
  createTodo: (planId, data) => api.post(`/studyplan/plans/${planId}/todos/`, data),
  updateTodo: (planId, todoId, data) => api.patch(`/studyplan/plans/${planId}/todos/${todoId}/`, data),
  deleteTodo: (planId, todoId) => api.delete(`/studyplan/plans/${planId}/todos/${todoId}/`),
  toggleTodo: (planId, todoId) => api.post(`/studyplan/plans/${planId}/todos/${todoId}/toggle_complete/`),
};

export const moderationService = {
  createReport: (data) => api.post('/moderation/reports/', data),
  getMyReports: () => api.get('/moderation/reports/my_reports/'),
};

export const progressService = {
  getRecords: (params) => api.get('/progress/records/', { params }),
  createRecord: (data) => api.post('/progress/records/', data),
  updateRecord: (id, data) => api.patch(`/progress/records/${id}/`, data),
  deleteRecord: (id) => api.delete(`/progress/records/${id}/`),
  getStatistics: (params) => api.get('/progress/records/statistics/', { params }),
  getReminders: (params) => api.get('/progress/records/reminders/', { params }),
  getCheckins: (params) => api.get('/progress/checkin/', { params }),
  checkinToday: () => api.post('/progress/checkin/today/'),
  getStreak: () => api.get('/progress/checkin/streak/'),
};

export const quizService = {
  getBanks: (params) => api.get('/quiz/banks/', { params }),
  getBankDetail: (id) => api.get(`/quiz/banks/${id}/`),
  submitExam: (bankId, data) => api.post(`/quiz/banks/${bankId}/submit/`, data),
  getRecords: (params) => api.get('/quiz/records/', { params }),
  getWrongQuestions: (params) => api.get('/quiz/wrong/', { params }),
  toggleMastered: (id) => api.post(`/quiz/wrong/${id}/toggle_mastered/`),
  deleteWrong: (id) => api.delete(`/quiz/wrong/${id}/`),
};

export const pointsService = {
  getMyPoints: () => api.get('/points/my_points/'),
  getLogs: () => api.get('/points/logs/'),
  signIn: () => api.post('/points/sign_in/'),
  getLeaderboard: () => api.get('/points/leaderboard/'),
  getLevelInfo: () => api.get('/points/level_info/'),
};
