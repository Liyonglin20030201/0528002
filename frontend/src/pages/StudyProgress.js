import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Table, message, Progress, Tag, Space, Empty } from 'antd';
import { CheckCircleOutlined, FireOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { progressService } from '../services';

function StudyProgress() {
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, streakRes, recordsRes] = await Promise.all([
        progressService.getStatistics({ days: 30 }),
        progressService.getStreak(),
        progressService.getRecords(),
      ]);
      setStats(statsRes.data);
      setStreak(streakRes.data);
      setRecords(recordsRes.data.results || recordsRes.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCheckin = async () => {
    try {
      const res = await progressService.checkinToday();
      message.success(res.data.detail);
      loadData();
    } catch (err) {
      message.info(err.response?.data?.detail || '打卡失败');
    }
  };

  const handleAddRecord = async (values) => {
    try {
      await progressService.createRecord({
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      });
      message.success('学习记录已添加');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch {
      message.error('添加失败');
    }
  };

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (t) => t || '未分类' },
    { title: '时长(分钟)', dataIndex: 'duration', key: 'duration' },
    { title: '备注', dataIndex: 'note', key: 'note' },
  ];

  const maxDuration = stats?.daily_stats?.length > 0
    ? Math.max(...stats.daily_stats.map(d => d.total_duration))
    : 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="连续打卡"
              value={streak?.streak || 0}
              suffix="天"
              prefix={<FireOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计打卡"
              value={streak?.total_checkins || 0}
              suffix="天"
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月学习"
              value={stats?.total_duration || 0}
              suffix="分钟"
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="日均学习"
              value={stats?.avg_duration || 0}
              suffix="分钟"
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title="今日打卡"
            extra={
              <Space>
                <Button type="primary" onClick={handleCheckin} disabled={streak?.checked_today}>
                  {streak?.checked_today ? '今日已打卡' : '立即打卡'}
                </Button>
                <Button onClick={() => setModalOpen(true)}>记录学习</Button>
              </Space>
            }
          >
            {streak?.checked_today ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#52c41a', fontSize: 16 }}>
                <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} /><br />
                今日已完成打卡，继续保持！
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                今日还未打卡，快来打卡记录你的学习吧！
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="近30天学习时长">
            {stats?.daily_stats?.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 150, gap: 2 }}>
                {stats.daily_stats.map((day, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${maxDuration > 0 ? (day.total_duration / maxDuration) * 120 : 0}px`,
                        backgroundColor: '#1890ff',
                        borderRadius: '2px 2px 0 0',
                        minHeight: day.total_duration > 0 ? 4 : 0,
                      }}
                      title={`${day.date}: ${day.total_duration}分钟`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无学习记录" />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="科目分布">
            {stats?.subject_stats?.length > 0 ? (
              <div>
                {stats.subject_stats.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.subject || '未分类'}</span>
                      <span>{item.total_duration}分钟</span>
                    </div>
                    <Progress
                      percent={stats.total_duration > 0 ? Math.round(item.total_duration / stats.total_duration * 100) : 0}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="学习记录">
        <Table
          loading={loading}
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal title="添加学习记录" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAddRecord} initialValues={{ date: dayjs() }}>
          <Form.Item name="date" label="学习日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="学习时长(分钟)" rules={[{ required: true, message: '请输入时长' }]}>
            <InputNumber min={1} max={720} style={{ width: '100%' }} placeholder="例如：120" />
          </Form.Item>
          <Form.Item name="subject" label="学习科目">
            <Select placeholder="选择科目" allowClear>
              <Select.Option value="数学">数学</Select.Option>
              <Select.Option value="英语">英语</Select.Option>
              <Select.Option value="政治">政治</Select.Option>
              <Select.Option value="专业课">专业课</Select.Option>
              <Select.Option value="行测">行测</Select.Option>
              <Select.Option value="申论">申论</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="学习备注">
            <Input placeholder="今天学了什么..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>添加记录</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StudyProgress;
