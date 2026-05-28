import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Upload, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import { resourceService } from '../services';

function ResourceUpload() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    resourceService.getCategories().then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('请选择文件');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('category', values.category);
    formData.append('file', fileList[0].originFileObj);
    try {
      await resourceService.upload(formData);
      message.success('上传成功');
      navigate('/resources');
    } catch {
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title="上传资源">
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="资源名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如: 2025年考研数学一真题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="资源简要描述" />
          </Form.Item>
          <Form.Item label="文件" required>
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>上传</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ResourceUpload;
