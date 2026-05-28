import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Space, Spin, Button, List, Input, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeOutlined, LikeOutlined, LikeFilled, StarOutlined } from '@ant-design/icons';
import { experienceService, authService } from '../services';

const { Title, Paragraph } = Typography;

function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const loadPost = () => {
    experienceService.getDetail(id).then(res => setPost(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadPost(); }, [id]);

  const handleLike = async () => {
    try {
      const res = await experienceService.like(id);
      setPost({ ...post, likes: res.data.likes });
      setIsLiked(res.data.is_liked);
      message.success(res.data.is_liked ? '点赞成功' : '已取消点赞');
    } catch {
      message.error('请先登录');
    }
  };

  const handleFavorite = async () => {
    try {
      await authService.addFavorite({ content_type: 'experience', object_id: parseInt(id) });
      message.success('收藏成功');
    } catch {
      message.error('请先登录');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await experienceService.addComment(id, { content: comment });
      setComment('');
      loadPost();
      message.success('评论成功');
    } catch {
      message.error('请先登录');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!post) return <div>帖子不存在</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={3}>{post.title}</Title>
        <Space style={{ marginBottom: 16 }}>
          <Tag color={post.exam_type === 'kaoyan' ? 'blue' : 'green'}>
            {post.exam_type === 'kaoyan' ? '考研' : '考公'}
          </Tag>
          <span>作者: {post.author_name}</span>
          <span><EyeOutlined /> {post.views}</span>
          <span><LikeOutlined /> {post.likes}</span>
          <span>{post.created_at?.slice(0, 10)}</span>
        </Space>
        {post.tags && (
          <div style={{ marginBottom: 16 }}>
            {post.tags.split(',').map(tag => <Tag key={tag}>{tag.trim()}</Tag>)}
          </div>
        )}
        <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
          {post.content}
        </Paragraph>
        <Space>
          <Button
            type={isLiked ? 'primary' : 'default'}
            icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleLike}
          >
            {isLiked ? '已点赞' : '点赞'} ({post.likes})
          </Button>
          <Button icon={<StarOutlined />} onClick={handleFavorite}>收藏</Button>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Space>
      </Card>

      <Card title={`评论 (${post.comments?.length || 0})`} style={{ marginTop: 16 }}>
        <List
          dataSource={post.comments || []}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<span>{item.author_name} · {item.created_at?.slice(0, 10)}</span>}
                description={item.content}
              />
            </List.Item>
          )}
        />
        <Space.Compact style={{ width: '100%', marginTop: 16 }}>
          <Input.TextArea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="写下你的评论..."
          />
        </Space.Compact>
        <Button type="primary" onClick={handleComment} loading={submitting} style={{ marginTop: 8 }}>
          发表评论
        </Button>
      </Card>
    </div>
  );
}

export default ExperienceDetail;
