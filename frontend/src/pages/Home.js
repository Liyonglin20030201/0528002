import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { NotificationOutlined, EditOutlined, CloudDownloadOutlined, CommentOutlined } from '@ant-design/icons';
import { newsService, experienceService } from '../services';

function Home() {
  const [latestNews, setLatestNews] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    newsService.getList({ page_size: 5 }).then(res => setLatestNews(res.data.results || [])).catch(() => {});
    experienceService.getList({ page_size: 5 }).then(res => setLatestPosts(res.data.results || [])).catch(() => {});
  }, []);

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="资讯动态" prefix={<NotificationOutlined />} value="最新政策" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="经验交流" prefix={<EditOutlined />} value="学长学姐分享" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="资源下载" prefix={<CloudDownloadOutlined />} value="真题笔记" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="话题讨论" prefix={<CommentOutlined />} value="按校分类" /></Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="最新资讯" extra={<Link to="/news">更多</Link>}>
            <List
              dataSource={latestNews}
              renderItem={item => (
                <List.Item>
                  <Link to={`/news/${item.id}`}>
                    {item.is_top && <Tag color="red">置顶</Tag>}
                    {item.title}
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最新经验帖" extra={<Link to="/experience">更多</Link>}>
            <List
              dataSource={latestPosts}
              renderItem={item => (
                <List.Item>
                  <Link to={`/experience/${item.id}`}>
                    <Tag color={item.exam_type === 'kaoyan' ? 'blue' : 'green'}>
                      {item.exam_type === 'kaoyan' ? '考研' : '考公'}
                    </Tag>
                    {item.title}
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
