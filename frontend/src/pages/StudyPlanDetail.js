import React, { useEffect, useState } from 'react';
import { Card, List, Button, Checkbox, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { studyplanService } from '../services';

function StudyPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadPlan = async () => {
    try {
      const res = await studyplanService.getPlanDetail(id);
      setPlan(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadPlan(); }, [id]);

  const handleToggle = async (todoId) => {
    try {
      await studyplanService.toggleTodo(id, todoId);
      loadPlan();
    } catch {
      message.error('操作失败');
    }
  };

  const handleAddTodo = async (values) => {
    try {
      await studyplanService.createTodo(id, {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
      });
      message.success('添加成功');
      setModalOpen(false);
      form.resetFields();
      loadPlan();
    } catch {
      message.error('添加失败');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await studyplanService.deleteTodo(id, todoId);
      message.success('已删除');
      loadPlan();
    } catch {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await studyplanService.togglePlanStatus(id, status);
      loadPlan();
      message.success('状态已更新');
    } catch {
      message.error('更新失败');
    }
  };

  const priorityColors = { high: 'red', medium: 'orange', low: 'blue' };
  const priorityLabels = { high: '高', medium: '中', low: '低' };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!plan) return <div>计划不存在</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/studyplan')} />
            <span>{plan.title}</span>
            <Tag color={plan.exam_type === 'kaoyan' ? 'blue' : 'green'}>
              {plan.exam_type === 'kaoyan' ? '考研' : '考公'}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Select value={plan.status} onChange={handleStatusChange} style={{ width: 100 }}>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="abandoned">已放弃</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加待办</Button>
          </Space>
        }
      >
        {plan.description && <p style={{ color: '#666', marginBottom: 16 }}>{plan.description}</p>}
        <p style={{ marginBottom: 16 }}>目标日期: <Tag>{plan.target_date}</Tag></p>

        <List
          dataSource={plan.todos || []}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTodo(item.id)}
                />
              ]}
            >
              <Space>
                <Checkbox
                  checked={item.is_completed}
                  onChange={() => handleToggle(item.id)}
                />
                <span style={{ textDecoration: item.is_completed ? 'line-through' : 'none', color: item.is_completed ? '#999' : '#000' }}>
                  {item.title}
                </span>
                <Tag color={priorityColors[item.priority]}>{priorityLabels[item.priority]}</Tag>
                {item.due_date && <Tag>{item.due_date}</Tag>}
              </Space>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="添加待办事项"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTodo}>
          <Form.Item name="title" label="事项名称" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="如：刷完高数第三章" />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="due_date" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>添加</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StudyPlanDetail;
