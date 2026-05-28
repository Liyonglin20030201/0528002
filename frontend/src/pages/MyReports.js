import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Space, Spin } from 'antd';
import { moderationService } from '../services';

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moderationService.getMyReports()
      .then(res => setReports(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { pending: 'processing', resolved: 'success', dismissed: 'default' };
  const statusLabels = { pending: '待处理', resolved: '已处理', dismissed: '已驳回' };
  const reasonLabels = { spam: '垃圾信息', ads: '广告', inappropriate: '不当内容', plagiarism: '抄袭', other: '其他' };
  const typeLabels = { experience: '经验帖', topic: '话题', topic_reply: '话题回复', comment: '评论', resource: '资源' };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="我的举报记录">
        <List
          dataSource={reports}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Tag>{typeLabels[item.content_type]}</Tag>
                    <span>#{item.object_id}</span>
                    <Tag color={statusColors[item.status]}>{statusLabels[item.status]}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <span>举报原因: {reasonLabels[item.reason]}</span>
                    {item.description && <span>描述: {item.description}</span>}
                    {item.result && <span>处理结果: {item.result}</span>}
                    <span style={{ color: '#999', fontSize: 12 }}>{item.created_at?.slice(0, 16).replace('T', ' ')}</span>
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

export default MyReports;
