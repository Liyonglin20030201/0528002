import React, { useEffect, useState } from 'react';
import { Card, Descriptions, List, Tag, Empty, Spin } from 'antd';
import { authService } from '../services';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([authService.getProfile(), authService.getFavorites()])
      .then(([profileRes, favRes]) => {
        setProfile(profileRes.data);
        setFavorites(favRes.data.results || favRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const examTypeMap = { kaoyan: '考研', kaogong: '考公', both: '都关注' };
  const contentTypeMap = { news: '资讯', experience: '经验帖', resource: '资源', topic: '话题' };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="个人信息" style={{ marginBottom: 24 }}>
        {profile && (
          <Descriptions column={2}>
            <Descriptions.Item label="用户名">{profile.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{profile.email || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="关注类型">{examTypeMap[profile.exam_type]}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{profile.created_at?.slice(0, 10)}</Descriptions.Item>
            <Descriptions.Item label="个人简介" span={2}>{profile.bio || '暂无'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card title="我的收藏">
        {favorites.length === 0 ? (
          <Empty description="暂无收藏" />
        ) : (
          <List
            dataSource={favorites}
            renderItem={item => (
              <List.Item>
                <Tag>{contentTypeMap[item.content_type]}</Tag>
                ID: {item.object_id} - 收藏于 {item.created_at?.slice(0, 10)}
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default Profile;
