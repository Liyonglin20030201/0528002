import React, { useEffect, useState } from 'react';
import { Card, Tabs, List, Badge, Button, Space, Tag, message, Input, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BellOutlined, MessageOutlined, CheckOutlined } from '@ant-design/icons';
import { messageService } from '../services';

function Messages() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await messageService.getNotifications();
      setNotifications(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const loadConversations = async () => {
    try {
      const res = await messageService.getConversations();
      setConversations(res.data.results || res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadNotifications();
    loadConversations();
  }, []);

  const handleMarkRead = async (id) => {
    await messageService.markRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await messageService.markAllRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    message.success('已全部标为已读');
  };

  const handleStartChat = async () => {
    if (!newChatUserId.trim()) return;
    try {
      const res = await messageService.createConversation(parseInt(newChatUserId));
      navigate(`/messages/chat/${res.data.id}`);
    } catch {
      message.error('创建会话失败，请检查用户ID');
    }
  };

  const typeColors = { comment: 'blue', like: 'red', reply: 'green', system: 'orange' };
  const typeLabels = { comment: '评论', like: '点赞', reply: '回复', system: '系统' };

  const notificationTab = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleMarkAllRead} icon={<CheckOutlined />}>全部标为已读</Button>
      </div>
      <List
        loading={loading}
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            actions={!item.is_read ? [<Button size="small" onClick={() => handleMarkRead(item.id)}>标为已读</Button>] : []}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Badge dot={!item.is_read}>
                    <Tag color={typeColors[item.notification_type]}>{typeLabels[item.notification_type]}</Tag>
                  </Badge>
                  <span>{item.title}</span>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <span>{item.content}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>{item.created_at?.slice(0, 16).replace('T', ' ')}</span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  const conversationTab = (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入用户ID开始私聊"
          value={newChatUserId}
          onChange={e => setNewChatUserId(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleStartChat}>发起私聊</Button>
      </Space>
      <List
        dataSource={conversations}
        renderItem={item => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/messages/chat/${item.id}`)}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<MessageOutlined />} />}
              title={
                <Space>
                  <span>{item.user1_name} & {item.user2_name}</span>
                  {item.unread_count > 0 && <Badge count={item.unread_count} />}
                </Space>
              }
              description={item.last_message ? `${item.last_message.sender_name}: ${item.last_message.content}` : '暂无消息'}
            />
          </List.Item>
        )}
      />
    </div>
  );

  const items = [
    { key: 'notifications', label: <span><BellOutlined /> 通知</span>, children: notificationTab },
    { key: 'conversations', label: <span><MessageOutlined /> 私信</span>, children: conversationTab },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="消息中心">
        <Tabs items={items} />
      </Card>
    </div>
  );
}

export default Messages;
