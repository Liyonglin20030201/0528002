import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Select, Space, Input } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { newsService } from '../services';

function NewsList() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    newsService.getCategories().then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    newsService.getList(filters).then(res => setNews(res.data.results || [])).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setFilters({ ...filters, category: v })}
          >
            {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
          </Select>
          <Select
            placeholder="类型"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => setFilters({ ...filters, category__category_type: v })}
          >
            <Select.Option value="kaoyan">考研</Select.Option>
            <Select.Option value="kaogong">考公</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索资讯"
            style={{ width: 200 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
        </Space>
      </Card>

      <List
        loading={loading}
        dataSource={news}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Link to={`/news/${item.id}`}>
                  {item.is_top && <Tag color="red">置顶</Tag>}
                  <Tag color="blue">{item.category_name}</Tag>
                  {item.title}
                </Link>
              }
              description={
                <Space>
                  <span>来源: {item.source || item.author_name}</span>
                  <span><EyeOutlined /> {item.views}</span>
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

export default NewsList;
