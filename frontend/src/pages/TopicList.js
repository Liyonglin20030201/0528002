import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Space, Input, Select, Button } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined, CommentOutlined, PlusOutlined } from '@ant-design/icons';
import { topicService } from '../services';

function TopicList() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    topicService.getCategories().then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    topicService.getList(filters).then(res => setTopics(res.data.results || [])).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="分类"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setFilters({ ...filters, category: v })}
          >
            {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Select
            placeholder="分类类型"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => setFilters({ ...filters, category__category_type: v })}
          >
            <Select.Option value="school">按院校</Select.Option>
            <Select.Option value="subject">按科目</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索话题"
            style={{ width: 200 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
          <Link to="/topics/create">
            <Button type="primary" icon={<PlusOutlined />}>发起话题</Button>
          </Link>
        </Space>
      </Card>

      <List
        loading={loading}
        dataSource={topics}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Link to={`/topics/${item.id}`}>
                  {item.is_pinned && <Tag color="red">置顶</Tag>}
                  <Tag color="purple">{item.category_name}</Tag>
                  {item.title}
                </Link>
              }
              description={
                <Space>
                  <span>{item.author_name}</span>
                  <span><EyeOutlined /> {item.views}</span>
                  <span><CommentOutlined /> {item.reply_count} 回复</span>
                  <span>{item.created_at?.slice(0, 10)}</span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default TopicList;
