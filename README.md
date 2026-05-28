# 考研考公信息共享平台

一个面向考研和考公群体的信息共享平台，提供资讯浏览、经验交流、资源下载和话题讨论功能。

## 技术栈

- **后端**: Python Django 4.2 + Django REST Framework
- **前端**: React 18 + Ant Design 5 + React Router 6
- **数据库**: MySQL 8.0
- **认证**: JWT (SimpleJWT)

## 项目结构

```
├── backend/                # Django 后端
│   ├── config/            # 项目配置
│   │   ├── settings.py    # Django 设置
│   │   ├── urls.py        # 主路由
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/         # 用户模块：注册、登录、收藏
│   │   ├── news/          # 资讯模块：招生通知、分数线
│   │   ├── experience/    # 经验交流：发帖、评论、点赞
│   │   ├── resources/     # 资源下载：上传、下载文件
│   │   └── topics/        # 话题讨论：按院校/科目分类
│   ├── media/             # 上传文件存储
│   ├── manage.py
│   └── requirements.txt
├── frontend/              # React 前端
│   ├── public/
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务层
│   │   ├── App.js         # 应用主组件
│   │   └── index.js       # 入口文件
│   └── package.json
├── database/
│   └── schema.sql         # 数据库建表脚本与初始数据
└── README.md
```

## 功能模块

| 模块 | 功能 | API 前缀 |
|------|------|----------|
| 用户系统 | 注册、JWT登录、个人中心、收藏 | `/api/users/` |
| 资讯板块 | 考研/考公招生通知、分数线浏览 | `/api/news/` |
| 经验交流 | 发帖、评论、点赞、搜索 | `/api/experience/` |
| 资源下载 | 文件上传、分类浏览、下载 | `/api/resources/` |
| 话题讨论 | 按院校/科目分类、发帖回复 | `/api/topics/` |

## 环境准备

### 必需软件

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

## 运行指导

### 1. 数据库初始化

```bash
# 登录 MySQL 执行建表脚本
mysql -u root -p < database/schema.sql
```

或在 MySQL 命令行中：
```sql
source database/schema.sql;
```

> 注意：也可以跳过此步，使用 Django migrate 自动建表（推荐）。

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 修改数据库配置（可选）
# 编辑 config/settings.py 中的 DATABASES 配置，修改用户名和密码

# 创建数据库（如果没用 schema.sql）
# 在 MySQL 中执行: CREATE DATABASE exam_platform CHARACTER SET utf8mb4;

# 数据库迁移
python manage.py makemigrations users news experience resources topics
python manage.py migrate

# 创建超级管理员
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

后端将运行在 http://127.0.0.1:8000

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将运行在 http://localhost:3000

### 4. 初始化分类数据

使用 Django Admin 后台 (http://127.0.0.1:8000/admin/) 添加分类数据，或者如果已执行 `schema.sql` 则初始数据已自动导入。

如果使用 Django migrate 方式建表，可通过以下命令导入初始分类：

```bash
python manage.py shell
```

```python
from apps.news.models import NewsCategory
from apps.resources.models import ResourceCategory
from apps.topics.models import TopicCategory

# 资讯分类
NewsCategory.objects.bulk_create([
    NewsCategory(name='招生通知', category_type='kaoyan'),
    NewsCategory(name='分数线', category_type='kaoyan'),
    NewsCategory(name='院校动态', category_type='kaoyan'),
    NewsCategory(name='招录公告', category_type='kaogong'),
    NewsCategory(name='分数线', category_type='kaogong'),
    NewsCategory(name='政策解读', category_type='kaogong'),
])

# 资源分类
ResourceCategory.objects.bulk_create([
    ResourceCategory(name='历年真题', exam_type='kaoyan'),
    ResourceCategory(name='复习笔记', exam_type='kaoyan'),
    ResourceCategory(name='视频课程', exam_type='kaoyan'),
    ResourceCategory(name='行测真题', exam_type='kaogong'),
    ResourceCategory(name='申论真题', exam_type='kaogong'),
    ResourceCategory(name='面试资料', exam_type='kaogong'),
])

# 话题分类
TopicCategory.objects.bulk_create([
    TopicCategory(name='北京大学', category_type='school', description='北京大学考研交流'),
    TopicCategory(name='清华大学', category_type='school', description='清华大学考研交流'),
    TopicCategory(name='复旦大学', category_type='school', description='复旦大学考研交流'),
    TopicCategory(name='数学', category_type='subject', description='考研数学交流'),
    TopicCategory(name='英语', category_type='subject', description='考研英语交流'),
    TopicCategory(name='政治', category_type='subject', description='考研政治交流'),
    TopicCategory(name='行测', category_type='subject', description='公考行测交流'),
    TopicCategory(name='申论', category_type='subject', description='公考申论交流'),
])
```

## API 接口说明

### 认证相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/users/register/` | 用户注册 |
| POST | `/api/users/login/` | 登录获取 JWT Token |
| POST | `/api/users/token/refresh/` | 刷新 Token |
| GET/PATCH | `/api/users/profile/` | 获取/更新个人信息 |
| GET/POST | `/api/users/favorites/` | 收藏列表/添加收藏 |
| DELETE | `/api/users/favorites/{id}/` | 取消收藏 |

### 资讯
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/news/` | 资讯列表（支持分页、筛选、搜索） |
| GET | `/api/news/{id}/` | 资讯详情 |
| GET | `/api/news/categories/` | 资讯分类列表 |

### 经验交流
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/experience/posts/` | 经验帖列表 |
| POST | `/api/experience/posts/` | 发表经验帖（需登录） |
| GET | `/api/experience/posts/{id}/` | 帖子详情 |
| POST | `/api/experience/posts/{id}/like/` | 点赞 |
| GET/POST | `/api/experience/posts/{id}/comments/` | 评论列表/发评论 |

### 资源下载
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resources/` | 资源列表 |
| POST | `/api/resources/` | 上传资源（需登录，multipart/form-data） |
| POST | `/api/resources/{id}/download/` | 获取下载链接 |
| GET | `/api/resources/categories/` | 资源分类 |

### 话题讨论
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/topics/` | 话题列表 |
| POST | `/api/topics/` | 发起话题（需登录） |
| GET | `/api/topics/{id}/` | 话题详情含回复 |
| GET/POST | `/api/topics/{id}/replies/` | 回复列表/发表回复 |
| GET | `/api/topics/categories/` | 话题分类（支持按 category_type 筛选） |

### 通用查询参数

- `page`: 页码
- `page_size`: 每页数量（默认10）
- `search`: 搜索关键词
- `ordering`: 排序字段（如 `-created_at`, `views`）

## 数据库配置

默认配置在 `backend/config/settings.py` 中：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_platform',
        'USER': 'root',
        'PASSWORD': 'root',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

请根据实际环境修改用户名和密码。

## 注意事项

1. 开发环境 `DEBUG=True`，生产部署时需改为 `False` 并配置 `ALLOWED_HOSTS`
2. `SECRET_KEY` 在生产环境中应使用环境变量管理
3. 文件上传存储在 `backend/media/` 目录，生产环境建议使用对象存储
4. CORS 默认允许所有来源，生产环境应限制为前端域名
