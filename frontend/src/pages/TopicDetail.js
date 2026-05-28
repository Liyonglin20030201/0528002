import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Space, Spin, Button, List, Input, message, Modal, Select, Form } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { EyeOutlined, StarOutlined, FlagOutlined } from '@ant-design/icons';
import { topicService, authService, moderationService } from '../services';

const { Title, Paragraph } = Typography;

function TopicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

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

  const handleReport = async (values) => {
    try {
      await moderationService.createReport({ content_type: 'topic', object_id: parseInt(id), ...values });
      message.success('举报已提交');
      setReportOpen(false);
    } catch {
      message.error('举报失败，请先登录');
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
          <Button icon={<FlagOutlined />} size="small" danger onClick={() => setReportOpen(true)}>举报</Button>
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

      <Modal title="举报内容" open={reportOpen} onCancel={() => setReportOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={handleReport}>
          <Form.Item name="reason" label="举报原因" rules={[{ required: true, message: '请选择举报原因' }]}>
            <Select placeholder="选择原因">
              <Select.Option value="spam">垃圾信息</Select.Option>
              <Select.Option value="ads">广告</Select.Option>
              <Select.Option value="inappropriate">不当内容</Select.Option>
              <Select.Option value="plagiarism">抄袭</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={3} placeholder="补充说明（选填）" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交举报</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TopicDetail;
