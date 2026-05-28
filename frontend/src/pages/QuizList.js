import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Space, Select, Row, Col, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons';
import { quizService } from '../services';

function QuizList() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [records, setRecords] = useState([]);

  const loadBanks = async () => {
    setLoading(true);
    try {
      const [banksRes, recordsRes] = await Promise.all([
        quizService.getBanks(filter),
        quizService.getRecords(),
      ]);
      setBanks(banksRes.data.results || banksRes.data);
      setRecords(recordsRes.data.results || recordsRes.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadBanks(); }, [filter]);

  const totalExams = records.length;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length)
    : 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="已完成考试" value={totalExams} suffix="次" prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="平均得分" value={avgScore} suffix="分" prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Button type="primary" block style={{ marginTop: 8 }} onClick={() => navigate('/quiz/wrong')}>
              错题本
            </Button>
          </Card>
        </Col>
      </Row>

      <Card
        title="题库列表"
        extra={
          <Space>
            <Select placeholder="考试类型" allowClear style={{ width: 120 }}
              onChange={v => setFilter({ ...filter, exam_type: v })}>
              <Select.Option value="kaoyan">考研</Select.Option>
              <Select.Option value="kaogong">考公</Select.Option>
            </Select>
            <Select placeholder="科目" allowClear style={{ width: 120 }}
              onChange={v => setFilter({ ...filter, subject: v })}>
              <Select.Option value="数学">数学</Select.Option>
              <Select.Option value="英语">英语</Select.Option>
              <Select.Option value="政治">政治</Select.Option>
              <Select.Option value="行测">行测</Select.Option>
              <Select.Option value="申论">申论</Select.Option>
            </Select>
          </Space>
        }
      >
        <List
          loading={loading}
          dataSource={banks}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="primary" onClick={() => navigate(`/quiz/exam/${item.id}`)}>
                  开始答题
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{item.name}</span>
                    <Tag color={item.exam_type === 'kaoyan' ? 'blue' : 'green'}>
                      {item.exam_type === 'kaoyan' ? '考研' : '考公'}
                    </Tag>
                    <Tag>{item.subject}</Tag>
                    {item.year && <Tag color="orange">{item.year}年</Tag>}
                  </Space>
                }
                description={
                  <Space>
                    <span>{item.description}</span>
                    <Tag icon={<FileTextOutlined />}>{item.question_count}题</Tag>
                    {item.time_limit > 0 && <Tag icon={<ClockCircleOutlined />}>{item.time_limit}分钟</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default QuizList;
