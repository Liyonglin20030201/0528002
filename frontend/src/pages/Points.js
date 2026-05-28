import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, List, Tag, Progress, Table, Space, message, Modal, Avatar } from 'antd';
import { TrophyOutlined, FireOutlined, StarOutlined, RiseOutlined, CrownOutlined } from '@ant-design/icons';
import { pointsService } from '../services';

function Points() {
  const [myPoints, setMyPoints] = useState(null);
  const [logs, setLogs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pointsRes, logsRes, boardRes, levelsRes] = await Promise.all([
        pointsService.getMyPoints(),
        pointsService.getLogs(),
        pointsService.getLeaderboard(),
        pointsService.getLevelInfo(),
      ]);
      setMyPoints(pointsRes.data);
      setLogs(logsRes.data);
      setLeaderboard(boardRes.data);
      setLevels(levelsRes.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSignIn = async () => {
    try {
      const res = await pointsService.signIn();
      message.success(`${res.data.detail}！获得 ${res.data.points_earned} 积分`);
      loadData();
    } catch (err) {
      message.info(err.response?.data?.detail || '签到失败');
    }
  };

  const levelColors = ['#bfbfbf', '#52c41a', '#1890ff', '#722ed1', '#eb2f96', '#fa8c16', '#f5222d', '#13c2c2', '#2f54eb', '#faad14', '#ff4d4f'];

  const nextLevel = levels.find(l => l.level === (myPoints?.level || 0) + 1);
  const currentLevelPoints = levels.find(l => l.level === (myPoints?.level || 1))?.points_required || 0;
  const progressPercent = nextLevel
    ? Math.round(((myPoints?.total_points || 0) - currentLevelPoints) / (nextLevel.points_required - currentLevelPoints) * 100)
    : 100;

  const columns = [
    { title: '行为', dataIndex: 'action_display', key: 'action' },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (v) => <span style={{ color: v > 0 ? '#52c41a' : '#f5222d' }}>+{v}</span>
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '时间', dataIndex: 'created_at', key: 'time', render: (t) => t?.slice(0, 16).replace('T', ' ') },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的积分"
              value={myPoints?.total_points || 0}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前等级"
              value={`Lv.${myPoints?.level || 1}`}
              prefix={<CrownOutlined style={{ color: levelColors[(myPoints?.level || 1) - 1] }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="连续签到"
              value={myPoints?.sign_in_streak || 0}
              suffix="天"
              prefix={<FireOutlined style={{ color: '#f5222d' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSignIn}
              disabled={myPoints?.last_sign_in === new Date().toISOString().slice(0, 10)}
              style={{ marginTop: 8 }}
            >
              每日签到
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="升级进度">
            <div style={{ marginBottom: 8 }}>
              <span>Lv.{myPoints?.level || 1}</span>
              <span style={{ float: 'right' }}>
                {nextLevel ? `Lv.${nextLevel.level} (需要${nextLevel.points_required}积分)` : '已满级'}
              </span>
            </div>
            <Progress percent={progressPercent} status="active" />
            <div style={{ marginTop: 8, color: '#999' }}>
              当前积分: {myPoints?.total_points || 0}
              {nextLevel && ` / 下一级需要: ${nextLevel.points_required}`}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="等级特权" size="small" style={{ maxHeight: 200, overflow: 'auto' }}>
            {levels.slice(0, 6).map(l => (
              <div key={l.level} style={{ marginBottom: 4, opacity: l.level <= (myPoints?.level || 1) ? 1 : 0.5 }}>
                <Tag color={l.level <= (myPoints?.level || 1) ? 'green' : 'default'}>Lv.{l.level}</Tag>
                <span>{l.privilege}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="积分记录">
            <Table
              loading={loading}
              columns={columns}
              dataSource={logs}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="积分排行榜" size="small">
            <List
              dataSource={leaderboard.slice(0, 10)}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <span style={{
                      fontWeight: 'bold',
                      color: index < 3 ? ['#f5222d', '#fa8c16', '#faad14'][index] : '#999',
                      width: 20, display: 'inline-block'
                    }}>
                      {index + 1}
                    </span>
                    <span>{item.username}</span>
                  </Space>
                  <Space>
                    <Tag color={levelColors[(item.level || 1) - 1]}>Lv.{item.level}</Tag>
                    <span>{item.total_points}分</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Points;
