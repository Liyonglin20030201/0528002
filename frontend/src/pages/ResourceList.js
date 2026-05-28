import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Space, Input, Select, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { resourceService } from '../services';

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    resourceService.getCategories().then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    resourceService.getList(filters).then(res => setResources(res.data.results || [])).finally(() => setLoading(false));
  }, [filters]);

  const handleDownload = async (id) => {
    try {
      const res = await resourceService.download(id);
      window.open(res.data.download_url, '_blank');
    } catch {
      message.error('下载失败');
    }
  };

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
            onChange={(v) => setFilters({ ...filters, category__exam_type: v })}
          >
            <Select.Option value="kaoyan">考研</Select.Option>
            <Select.Option value="kaogong">考公</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索资源"
            style={{ width: 200 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
          <Link to="/resources/upload">
            <Button type="primary" icon={<UploadOutlined />}>上传资源</Button>
          </Link>
        </Space>
      </Card>

      <List
        loading={loading}
        grid={{ gutter: 16, column: 3 }}
        dataSource={resources}
        renderItem={item => (
          <List.Item>
            <Card
              title={item.title}
              extra={<Tag>{item.category_name}</Tag>}
              actions={[
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(item.id)}
                >
                  下载 ({item.download_count})
                </Button>
              ]}
            >
              <p>{item.description || '暂无描述'}</p>
              <Space>
                <span>大小: {item.file_size} KB</span>
                <span>上传者: {item.uploader_name}</span>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default ResourceList;
