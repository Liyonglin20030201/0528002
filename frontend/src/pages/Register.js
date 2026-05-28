import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        message.error(firstError || '注册失败');
      } else {
        message.error('注册失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <Card title="用户注册">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="password_confirm" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="exam_type" label="关注类型" initialValue="both">
            <Select>
              <Select.Option value="kaoyan">考研</Select.Option>
              <Select.Option value="kaogong">考公</Select.Option>
              <Select.Option value="both">都关注</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>注册</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">去登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
