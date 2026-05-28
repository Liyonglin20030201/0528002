-- ============================================
-- 考研考公信息共享平台 - 数据库设计方案
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS exam_platform
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE exam_platform;

-- ============================================
-- 1. 用户模块
-- ============================================

-- 用户表（扩展 Django auth_user）
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME(6) NULL,
    is_superuser TINYINT(1) NOT NULL DEFAULT 0,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    date_joined DATETIME(6) NOT NULL,
    avatar VARCHAR(200) NULL,
    bio TEXT,
    exam_type VARCHAR(20) NOT NULL DEFAULT 'both' COMMENT '关注类型: kaoyan/kaogong/both',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_username (username),
    INDEX idx_exam_type (exam_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 收藏表
CREATE TABLE favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL COMMENT '内容类型: news/experience/resource/topic',
    object_id INT UNSIGNED NOT NULL COMMENT '关联对象ID',
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_user_content (user_id, content_type, object_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 2. 资讯模块
-- ============================================

-- 资讯分类表
CREATE TABLE news_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    category_type VARCHAR(20) NOT NULL COMMENT '所属类型: kaoyan/kaogong',
    INDEX idx_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资讯分类表';

-- 资讯表
CREATE TABLE news (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    category_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    source VARCHAR(100) DEFAULT '' COMMENT '信息来源',
    views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
    is_top TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_category (category_id),
    INDEX idx_created (created_at),
    INDEX idx_top_created (is_top, created_at),
    FULLTEXT INDEX ft_title_content (title, content),
    FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资讯表';

-- ============================================
-- 3. 经验交流模块
-- ============================================

-- 经验帖表
CREATE TABLE experience_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    author_id BIGINT NOT NULL,
    exam_type VARCHAR(20) NOT NULL COMMENT '类型: kaoyan/kaogong',
    tags VARCHAR(200) DEFAULT '' COMMENT '标签，逗号分隔',
    views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
    likes INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_author (author_id),
    INDEX idx_exam_type (exam_type),
    INDEX idx_created (created_at),
    FULLTEXT INDEX ft_title_content (title, content),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='经验帖表';

-- 经验帖评论表
CREATE TABLE experience_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL COMMENT '评论内容',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_post (post_id),
    FOREIGN KEY (post_id) REFERENCES experience_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='经验帖评论表';

-- ============================================
-- 4. 资源下载模块
-- ============================================

-- 资源分类表
CREATE TABLE resource_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    exam_type VARCHAR(20) NOT NULL COMMENT '所属类型: kaoyan/kaogong',
    INDEX idx_type (exam_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源分类表';

-- 资源表
CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '资源名称',
    description TEXT COMMENT '描述',
    category_id BIGINT NOT NULL,
    uploader_id BIGINT NOT NULL,
    file VARCHAR(200) NOT NULL COMMENT '文件路径',
    file_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(KB)',
    download_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '下载次数',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_category (category_id),
    INDEX idx_created (created_at),
    FULLTEXT INDEX ft_title_desc (title, description),
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源表';

-- ============================================
-- 5. 话题讨论模块
-- ============================================

-- 话题分类表
CREATE TABLE topic_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    category_type VARCHAR(20) NOT NULL COMMENT '分类类型: school/subject',
    description TEXT COMMENT '描述',
    INDEX idx_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话题分类表';

-- 话题表
CREATE TABLE topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '话题标题',
    content TEXT NOT NULL COMMENT '话题内容',
    category_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
    is_pinned TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_category (category_id),
    INDEX idx_pinned_created (is_pinned, created_at),
    FULLTEXT INDEX ft_title_content (title, content),
    FOREIGN KEY (category_id) REFERENCES topic_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话题表';

-- 话题回复表
CREATE TABLE topic_replies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL COMMENT '回复内容',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_topic (topic_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话题回复表';

-- ============================================
-- 初始数据
-- ============================================

-- 资讯分类
INSERT INTO news_categories (name, category_type) VALUES
('招生通知', 'kaoyan'),
('分数线', 'kaoyan'),
('院校动态', 'kaoyan'),
('招录公告', 'kaogong'),
('分数线', 'kaogong'),
('政策解读', 'kaogong');

-- 资源分类
INSERT INTO resource_categories (name, exam_type) VALUES
('历年真题', 'kaoyan'),
('复习笔记', 'kaoyan'),
('视频课程', 'kaoyan'),
('行测真题', 'kaogong'),
('申论真题', 'kaogong'),
('面试资料', 'kaogong');

-- 话题分类（按院校）
INSERT INTO topic_categories (name, category_type, description) VALUES
('北京大学', 'school', '北京大学考研交流'),
('清华大学', 'school', '清华大学考研交流'),
('复旦大学', 'school', '复旦大学考研交流'),
('浙江大学', 'school', '浙江大学考研交流'),
('中国人民大学', 'school', '人大考研交流');

-- 话题分类（按科目）
INSERT INTO topic_categories (name, category_type, description) VALUES
('数学', 'subject', '考研数学交流'),
('英语', 'subject', '考研英语交流'),
('政治', 'subject', '考研政治交流'),
('行测', 'subject', '公考行测交流'),
('申论', 'subject', '公考申论交流');
