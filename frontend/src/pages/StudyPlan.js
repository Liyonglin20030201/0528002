import React, { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, DatePicker, Tag, Progress, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { studyplanService } from '../services';

function StudyPlan() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await studyplanService.getPlans();
      setPlans(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadPlans(); }, []);

  const handleCreate = async (values) => {
    try {
      await studyplanService.createPlan({
        ...values,
        target_date: values.target_date.format('YYYY-MM-DD'),
      });
      message.success('计划创建成功');
      setModalOpen(false);
      form.resetFields();
      loadPlans();
    } catch {
      message.error('创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await studyplanService.deletePlan(id);
      message.success('已删除');
      loadPlans();
    } catch {
      message.error('删除失败');
    }
  };

  const statusColors = { active: 'processing', completed: 'success', abandoned: 'default' };
  const statusLabels = { active: '进行中', completed: '已完成', abandoned: '已放弃' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card
        title="我的学习计划"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建计划</Button>}
      >
        <List
          loading={loading}
          grid={{ gutter: 16, column: 2 }}
          dataSource={plans}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/studyplan/${item.id}`)}
                actions={[
                  <DeleteOutlined key="delete" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} />,
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      <span>{item.title}</span>
                      <Tag color={statusColors[item.status]}>{statusLabels[item.status]}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Tag color={item.exam_type === 'kaoyan' ? 'blue' : 'green'}>
                          {item.exam_type === 'kaoyan' ? '考研' : '考公'}
                        </Tag>
                        <span>目标: {item.target_date}</span>
                      </Space>
                      <Progress
                        percent={item.todo_total > 0 ? Math.round((item.todo_completed / item.todo_total) * 100) : 0}
                        size="small"
                        format={() => `${item.todo_completed}/${item.todo_total}`}
                      />
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="新建学习计划"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}>
            <Input placeholder="如：考研数学复习计划" />
          </Form.Item>
          <Form.Item name="description" label="计划描述">
            <Input.TextArea rows={3} placeholder="描述你的学习目标..." />
          </Form.Item>
          <Form.Item name="exam_type" label="备考类型" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="选择类型">
              <Select.Option value="kaoyan">考研</Select.Option>
              <Select.Option value="kaogong">考公</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="target_date" label="目标日期" rules={[{ required: true, message: '请选择目标日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>创建计划</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StudyPlan;
