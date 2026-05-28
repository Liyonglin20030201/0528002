import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Space, Spin, Button, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeOutlined, StarOutlined } from '@ant-design/icons';
import { newsService, authService } from '../services';

const { Title, Paragraph } = Typography;

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getDetail(id).then(res => setNews(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    try {
      await authService.addFavorite({ content_type: 'news', object_id: parseInt(id) });
      message.success('收藏成功');
    } catch {
      message.error('请先登录');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!news) return <div>资讯不存在</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={3}>{news.title}</Title>
        <Space style={{ marginBottom: 16 }}>
          <Tag color="blue">{news.category_name}</Tag>
          <span>来源: {news.source || news.author_name}</span>
          <span><EyeOutlined /> {news.views}</span>
          <span>{news.created_at?.slice(0, 10)}</span>
          <Button icon={<StarOutlined />} size="small" onClick={handleFavorite}>收藏</Button>
        </Space>
        <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
          {news.content}
        </Paragraph>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </Card>
    </div>
  );
}

export default NewsDetail;
