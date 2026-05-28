import React, { useEffect, useState } from 'react';
import { Card, Descriptions, List, Tag, Empty, Spin, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { authService } from '../services';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([authService.getProfile(), authService.getFavorites()])
      .then(([profileRes, favRes]) => {
        setProfile(profileRes.data);
        setFavorites(favRes.data.results || favRes.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleRemoveFavorite = async (id) => {
    try {
      await authService.removeFavorite(id);
      setFavorites(favorites.filter(f => f.id !== id));
      message.success('已取消收藏');
    } catch {
      message.error('操作失败');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const examTypeMap = { kaoyan: '考研', kaogong: '考公', both: '都关注' };
  const contentTypeMap = { news: '资讯', experience: '经验帖', resource: '资源', topic: '话题' };

  const getLinkPath = (item) => {
    const pathMap = { news: '/news', experience: '/experience', resource: '/resources', topic: '/topics' };
    return `${pathMap[item.content_type]}/${item.object_id}`;
  };

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
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFavorite(item.id)}
                  >
                    取消收藏
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Link to={getLinkPath(item)}>
                      <Tag>{contentTypeMap[item.content_type]}</Tag>
                      {item.title}
                    </Link>
                  }
                  description={`收藏于 ${item.created_at?.slice(0, 10)}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default Profile;
