import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { experienceService } from '../services';

function ExperienceCreate() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await experienceService.create(values);
      message.success('发布成功');
      navigate('/experience');
    } catch {
      message.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Card title="发表经验帖">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="exam_type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="选择类型">
              <Select.Option value="kaoyan">考研</Select.Option>
              <Select.Option value="kaogong">考公</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="如: 数学,英语,政治" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={12} placeholder="分享你的备考经验..." />
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

export default ExperienceCreate;
