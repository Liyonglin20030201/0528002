import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { topicService } from '../services';

function TopicCreate() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    topicService.getCategories().then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await topicService.create(values);
      message.success('发布成功');
      navigate('/topics');
    } catch {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card title="发起话题">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="话题标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入话题标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择话题分类">
              {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={10} placeholder="详细描述你的话题..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>发布</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default TopicCreate;
