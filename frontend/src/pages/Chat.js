import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Input, Button, Space, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { messageService } from '../services';

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const currentUser = localStorage.getItem('username');

  const loadMessages = async () => {
    try {
      const res = await messageService.getMessages(id);
      setMessages(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadMessages(); }, [id]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await messageService.sendMessage(id, content);
      setContent('');
      loadMessages();
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/messages')} />
            <span>私信会话</span>
          </Space>
        }
      >
        <div
          ref={listRef}
          style={{ height: 400, overflowY: 'auto', marginBottom: 16, padding: '0 8px' }}
        >
          <List
            dataSource={messages}
            renderItem={item => {
              const isMine = item.sender_name === currentUser;
              return (
                <List.Item style={{ justifyContent: isMine ? 'flex-end' : 'flex-start', border: 'none' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: isMine ? '#1890ff' : '#f0f0f0',
                    color: isMine ? '#fff' : '#000',
                  }}>
                    <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.7 }}>
                      {item.sender_name} · {item.created_at?.slice(11, 16)}
                    </div>
                    <div>{item.content}</div>
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input.TextArea
            rows={2}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
          />
        </Space.Compact>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          style={{ marginTop: 8 }}
        >
          发送
        </Button>
      </Card>
    </div>
  );
}

export default Chat;
