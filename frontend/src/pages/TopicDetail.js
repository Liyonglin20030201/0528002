import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Space, Spin, Button, List, Input, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeOutlined, StarOutlined } from '@ant-design/icons';
import { topicService, authService } from '../services';

const { Title, Paragraph } = Typography;

function TopicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTopic = () => {
    topicService.getDetail(id).then(res => setTopic(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadTopic(); }, [id]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await topicService.addReply(id, { content: reply });
      setReply('');
      loadTopic();
      message.success('回复成功');
    } catch {
      message.error('请先登录');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFavorite = async () => {
    try {
      await authService.addFavorite({ content_type: 'topic', object_id: parseInt(id) });
      message.success('收藏成功');
    } catch {
      message.error('请先登录');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!topic) return <div>话题不存在</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={3}>{topic.title}</Title>
        <Space style={{ marginBottom: 16 }}>
          <Tag color="purple">{topic.category_name}</Tag>
          <span>作者: {topic.author_name}</span>
          <span><EyeOutlined /> {topic.views}</span>
          <span>{topic.created_at?.slice(0, 10)}</span>
          <Button icon={<StarOutlined />} size="small" onClick={handleFavorite}>收藏</Button>
        </Space>
        <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
          {topic.content}
        </Paragraph>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </Card>

      <Card title={`回复 (${topic.replies?.length || 0})`} style={{ marginTop: 16 }}>
        <List
          dataSource={topic.replies || []}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<span>{item.author_name} · {item.created_at?.slice(0, 10)}</span>}
                description={item.content}
              />
            </List.Item>
          )}
        />
        <Input.TextArea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="写下你的回复..."
          style={{ marginTop: 16 }}
        />
        <Button type="primary" onClick={handleReply} loading={submitting} style={{ marginTop: 8 }}>
          发表回复
        </Button>
      </Card>
    </div>
  );
}

export default TopicDetail;
