import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import ExperienceList from './pages/ExperienceList';
import ExperienceDetail from './pages/ExperienceDetail';
import ExperienceCreate from './pages/ExperienceCreate';
import ResourceList from './pages/ResourceList';
import ResourceUpload from './pages/ResourceUpload';
import TopicList from './pages/TopicList';
import TopicDetail from './pages/TopicDetail';
import TopicCreate from './pages/TopicCreate';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import StudyPlan from './pages/StudyPlan';
import StudyPlanDetail from './pages/StudyPlanDetail';
import MyReports from './pages/MyReports';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <AppLayout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/experience" element={<ExperienceList />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/experience/create" element={user ? <ExperienceCreate /> : <Navigate to="/login" />} />
            <Route path="/resources" element={<ResourceList />} />
            <Route path="/resources/upload" element={user ? <ResourceUpload /> : <Navigate to="/login" />} />
            <Route path="/topics" element={<TopicList />} />
            <Route path="/topics/:id" element={<TopicDetail />} />
            <Route path="/topics/create" element={user ? <TopicCreate /> : <Navigate to="/login" />} />
            <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/messages/chat/:id" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/studyplan" element={user ? <StudyPlan /> : <Navigate to="/login" />} />
            <Route path="/studyplan/:id" element={user ? <StudyPlanDetail /> : <Navigate to="/login" />} />
            <Route path="/my-reports" element={user ? <MyReports /> : <Navigate to="/login" />} />
          </Routes>
        </AppLayout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
