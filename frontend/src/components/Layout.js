import React, { useEffect, useState, useRef } from 'react';
import { Layout, Menu, Button, Space, Badge } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  NotificationOutlined,
  EditOutlined,
  CloudDownloadOutlined,
  CommentOutlined,
  UserOutlined,
  BellOutlined,
  ScheduleOutlined,
  LineChartOutlined,
  FormOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { messageService } from '../services';

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
  { key: '/news', icon: <NotificationOutlined />, label: <Link to="/news">资讯</Link> },
  { key: '/experience', icon: <EditOutlined />, label: <Link to="/experience">经验交流</Link> },
  { key: '/resources', icon: <CloudDownloadOutlined />, label: <Link to="/resources">资源下载</Link> },
  { key: '/topics', icon: <CommentOutlined />, label: <Link to="/topics">话题讨论</Link> },
  { key: '/studyplan', icon: <ScheduleOutlined />, label: <Link to="/studyplan">学习计划</Link> },
  { key: '/progress', icon: <LineChartOutlined />, label: <Link to="/progress">学习进度</Link> },
  { key: '/quiz', icon: <FormOutlined />, label: <Link to="/quiz">在线刷题</Link> },
  { key: '/points', icon: <TrophyOutlined />, label: <Link to="/points">积分等级</Link> },
];

function AppLayout({ children, user, onLogout }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = () => {
      messageService.getUnreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    };

    fetchUnread();
    timerRef.current = setInterval(fetchUnread, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginRight: '40px', whiteSpace: 'nowrap' }}>
          考研考公信息平台
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1 }}
        />
        <Space>
          {user ? (
            <>
              <Link to="/messages">
                <Badge count={unreadCount} size="small">
                  <Button type="text" icon={<BellOutlined />} style={{ color: '#fff' }} />
                </Badge>
              </Link>
              <Link to="/profile">
                <Button type="text" icon={<UserOutlined />} style={{ color: '#fff' }}>
                  {user.username}
                </Button>
              </Link>
              <Button type="text" style={{ color: '#fff' }} onClick={onLogout}>
                退出
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button type="primary">登录</Button></Link>
              <Link to="/register"><Button>注册</Button></Link>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 134px)' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        考研考公信息共享平台 ©2026
      </Footer>
    </Layout>
  );
}

export default AppLayout;
