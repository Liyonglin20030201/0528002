import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Space, Empty, message, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { quizService } from '../services';

function WrongBook() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMastered, setShowMastered] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await quizService.getWrongQuestions({ is_mastered: showMastered ? undefined : 'false' });
      setQuestions(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [showMastered]);

  const handleToggle = async (id) => {
    try {
      await quizService.toggleMastered(id);
      message.success('状态已更新');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await quizService.deleteWrong(id);
      message.success('已移除');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card
        title="错题本"
        extra={
          <Space>
            <span>显示已掌握：</span>
            <Switch checked={showMastered} onChange={setShowMastered} />
            <Button onClick={() => navigate('/quiz')}>返回题库</Button>
          </Space>
        }
      >
        {questions.length === 0 ? (
          <Empty description="暂无错题，继续保持！" />
        ) : (
          <List
            loading={loading}
            dataSource={questions}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type={item.is_mastered ? 'default' : 'primary'}
                    size="small"
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.is_mastered ? '取消掌握' : '标记掌握'}
                  </Button>,
                  <Button size="small" danger onClick={() => handleDelete(item.id)}>移除</Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {item.is_mastered ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">已掌握</Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error">未掌握</Tag>
                      )}
                      <span>{item.question_detail?.content}</span>
                    </Space>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <div>
                        <Tag color="red">你的答案: {item.user_answer}</Tag>
                        <Tag color="green">正确答案: {item.question_detail?.answer}</Tag>
                      </div>
                      {item.question_detail?.explanation && (
                        <div style={{ marginTop: 8, color: '#666' }}>
                          解析：{item.question_detail.explanation}
                        </div>
                      )}
                      <div style={{ marginTop: 4 }}>
                        <Space>
                          {item.question_detail?.option_a && <span>A. {item.question_detail.option_a}</span>}
                          {item.question_detail?.option_b && <span>B. {item.question_detail.option_b}</span>}
                        </Space>
                        <br />
                        <Space>
                          {item.question_detail?.option_c && <span>C. {item.question_detail.option_c}</span>}
                          {item.question_detail?.option_d && <span>D. {item.question_detail.option_d}</span>}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default WrongBook;
