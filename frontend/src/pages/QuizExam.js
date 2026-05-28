import React, { useEffect, useState, useRef } from 'react';
import { Card, Radio, Button, Space, Tag, Progress, Modal, Result, Statistic, Row, Col, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';
import { quizService } from '../services';

function QuizExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadBank = async () => {
      try {
        const res = await quizService.getBankDetail(id);
        setBank(res.data);
        const now = new Date().toISOString();
        setStartedAt(now);
      } catch {
        message.error('加载题库失败');
      } finally { setLoading(false); }
    };
    loadBank();
  }, [id]);

  useEffect(() => {
    if (startedAt && !result) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startedAt, result]);

  useEffect(() => {
    if (bank?.time_limit > 0 && elapsed >= bank.time_limit * 60 && !result) {
      handleSubmit();
    }
  }, [elapsed]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await quizService.submitExam(id, {
        answers,
        started_at: startedAt,
      });
      setResult(res.data);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch {
      message.error('提交失败');
    } finally { setSubmitting(false); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <Card loading />;
  if (!bank) return null;

  const questions = bank.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card>
          <Result
            status={result.score >= 60 ? 'success' : 'warning'}
            title={`考试完成！得分：${result.score}分`}
            subTitle={`答对 ${result.correct_count}/${result.total} 题，用时 ${formatTime(result.duration)}`}
            extra={[
              <Button type="primary" key="back" onClick={() => navigate('/quiz')}>返回题库</Button>,
              <Button key="wrong" onClick={() => navigate('/quiz/wrong')}>查看错题</Button>,
            ]}
          >
            <Row gutter={16}>
              <Col span={8}><Statistic title="正确率" value={Math.round(result.correct_count / result.total * 100)} suffix="%" /></Col>
              <Col span={8}><Statistic title="用时" value={formatTime(result.duration)} /></Col>
              <Col span={8}><Statistic title="得分" value={result.score} suffix="/100" /></Col>
            </Row>
          </Result>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <span>{bank.name}</span>
            <Tag>{currentIndex + 1}/{questions.length}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Tag icon={<ClockCircleOutlined />} color={bank.time_limit > 0 && elapsed > bank.time_limit * 50 ? 'red' : 'blue'}>
              {formatTime(elapsed)}
              {bank.time_limit > 0 && ` / ${formatTime(bank.time_limit * 60)}`}
            </Tag>
            <span>已答: {answeredCount}/{questions.length}</span>
          </Space>
        }
      >
        <Progress percent={Math.round(answeredCount / questions.length * 100)} size="small" style={{ marginBottom: 24 }} />

        {currentQuestion && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{currentQuestion.question_type === 'single' ? '单选' : currentQuestion.question_type === 'multiple' ? '多选' : '判断'}</Tag>
              <span style={{ fontSize: 16 }}>{currentIndex + 1}. {currentQuestion.content}</span>
            </div>

            <Radio.Group
              value={answers[currentQuestion.id]}
              onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQuestion.option_a && (
                  <Radio value="A" style={{ display: 'block', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 8 }}>
                    A. {currentQuestion.option_a}
                  </Radio>
                )}
                {currentQuestion.option_b && (
                  <Radio value="B" style={{ display: 'block', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 8 }}>
                    B. {currentQuestion.option_b}
                  </Radio>
                )}
                {currentQuestion.option_c && (
                  <Radio value="C" style={{ display: 'block', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 8 }}>
                    C. {currentQuestion.option_c}
                  </Radio>
                )}
                {currentQuestion.option_d && (
                  <Radio value="D" style={{ display: 'block', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 8 }}>
                    D. {currentQuestion.option_d}
                  </Radio>
                )}
              </Space>
            </Radio.Group>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
            上一题
          </Button>
          <Space>
            {currentIndex < questions.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
                下一题
              </Button>
            ) : (
              <Button type="primary" danger onClick={() => {
                Modal.confirm({
                  title: '确认交卷',
                  content: `已答 ${answeredCount}/${questions.length} 题，确认提交？`,
                  onOk: handleSubmit,
                });
              }}>
                交卷
              </Button>
            )}
          </Space>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8, color: '#999' }}>题目导航：</div>
          <Space wrap>
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                size="small"
                type={answers[q.id] ? 'primary' : 'default'}
                onClick={() => setCurrentIndex(idx)}
                style={{ fontWeight: idx === currentIndex ? 'bold' : 'normal' }}
              >
                {idx + 1}
              </Button>
            ))}
          </Space>
        </div>
      </Card>
    </div>
  );
}

export default QuizExam;
