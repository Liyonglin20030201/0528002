import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Space, Input, Select, Button } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined, LikeOutlined, CommentOutlined, PlusOutlined } from '@ant-design/icons';
import { experienceService } from '../services';

function ExperienceList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    experienceService.getList(filters).then(res => setPosts(res.data.results || [])).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="类型"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => setFilters({ ...filters, exam_type: v })}
          >
            <Select.Option value="kaoyan">考研</Select.Option>
            <Select.Option value="kaogong">考公</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索经验帖"
            style={{ width: 200 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
          <Link to="/experience/create">
            <Button type="primary" icon={<PlusOutlined />}>发表经验</Button>
          </Link>
        </Space>
      </Card>

      <List
        loading={loading}
        dataSource={posts}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Link to={`/experience/${item.id}`}>
                  <Tag color={item.exam_type === 'kaoyan' ? 'blue' : 'green'}>
                    {item.exam_type === 'kaoyan' ? '考研' : '考公'}
                  </Tag>
                  {item.title}
                </Link>
              }
              description={
                <Space>
                  <span>{item.author_name}</span>
                  <span><EyeOutlined /> {item.views}</span>
                  <span><LikeOutlined /> {item.likes}</span>
                  <span><CommentOutlined /> {item.comment_count}</span>
                  <span>{item.created_at?.slice(0, 10)}</span>
                  {item.tags && item.tags.split(',').map(tag => <Tag key={tag}>{tag}</Tag>)}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default ExperienceList;
