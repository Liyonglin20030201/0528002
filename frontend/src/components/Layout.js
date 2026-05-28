import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  NotificationOutlined,
  EditOutlined,
  CloudDownloadOutlined,
  CommentOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
  { key: '/news', icon: <NotificationOutlined />, label: <Link to="/news">资讯</Link> },
  { key: '/experience', icon: <EditOutlined />, label: <Link to="/experience">经验交流</Link> },
  { key: '/resources', icon: <CloudDownloadOutlined />, label: <Link to="/resources">资源下载</Link> },
  { key: '/topics', icon: <CommentOutlined />, label: <Link to="/topics">话题讨论</Link> },
];

function AppLayout({ children, user, onLogout }) {
  const location = useLocation();

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
