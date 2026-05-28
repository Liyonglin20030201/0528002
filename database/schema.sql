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
-- 6. 消息通知模块
-- ============================================

-- 通知表
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    sender_id BIGINT NULL,
    notification_type VARCHAR(20) NOT NULL COMMENT '通知类型: comment/like/reply/system',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content VARCHAR(500) NOT NULL COMMENT '内容',
    related_type VARCHAR(20) NULL COMMENT '关联类型: experience/topic/news',
    related_id INT UNSIGNED NULL COMMENT '关联ID',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_recipient (recipient_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at),
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 会话表
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_users (user1_id, user2_id),
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- 私信表
CREATE TABLE private_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='私信表';

-- ============================================
-- 7. 学习计划模块
-- ============================================

-- 学习计划表
CREATE TABLE study_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT '计划名称',
    description TEXT COMMENT '计划描述',
    exam_type VARCHAR(20) NOT NULL COMMENT '备考类型: kaoyan/kaogong',
    target_date DATE NOT NULL COMMENT '目标日期',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active/completed/abandoned',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习计划表';

-- 待办事项表
CREATE TABLE todo_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT '待办事项',
    description TEXT COMMENT '详细描述',
    due_date DATE NULL COMMENT '截止日期',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' COMMENT '优先级: high/medium/low',
    is_completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成',
    completed_at DATETIME(6) NULL COMMENT '完成时间',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_plan (plan_id),
    INDEX idx_user (user_id),
    INDEX idx_completed (is_completed),
    FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办事项表';

-- ============================================
-- 8. 内容审核模块
-- ============================================

-- 举报表
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL COMMENT '内容类型: experience/topic/topic_reply/comment/resource',
    object_id INT UNSIGNED NOT NULL COMMENT '内容ID',
    reason VARCHAR(20) NOT NULL COMMENT '举报原因: spam/ads/inappropriate/plagiarism/other',
    description TEXT COMMENT '详细描述',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/resolved/dismissed',
    handler_id BIGINT NULL,
    result TEXT COMMENT '处理结果',
    created_at DATETIME(6) NOT NULL,
    resolved_at DATETIME(6) NULL,
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status),
    INDEX idx_content (content_type, object_id),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handler_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';

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

-- ============================================
-- 9. 学习进度统计模块
-- ============================================

-- 学习记录表
CREATE TABLE study_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL COMMENT '学习日期',
    duration INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '学习时长(分钟)',
    subject VARCHAR(50) DEFAULT '' COMMENT '学习科目',
    note VARCHAR(200) DEFAULT '' COMMENT '学习备注',
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_user_date_subject (user_id, date, subject),
    INDEX idx_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';

-- 打卡表
CREATE TABLE checkins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL COMMENT '打卡日期',
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_user_date (user_id, date),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡表';

-- ============================================
-- 10. 线上刷题模块
-- ============================================

-- 题库表
CREATE TABLE question_banks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '题库名称',
    exam_type VARCHAR(20) NOT NULL COMMENT '考试类型: kaoyan/kaogong',
    subject VARCHAR(50) NOT NULL COMMENT '科目',
    year INT UNSIGNED NULL COMMENT '年份',
    description TEXT COMMENT '描述',
    question_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '题目数量',
    time_limit INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '限时(分钟)',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_exam_type (exam_type),
    INDEX idx_subject (subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库表';

-- 题目表
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_id BIGINT NOT NULL,
    question_type VARCHAR(10) NOT NULL DEFAULT 'single' COMMENT '题型: single/multiple/judge',
    content TEXT NOT NULL COMMENT '题目内容',
    option_a VARCHAR(500) DEFAULT '' COMMENT '选项A',
    option_b VARCHAR(500) DEFAULT '' COMMENT '选项B',
    option_c VARCHAR(500) DEFAULT '' COMMENT '选项C',
    option_d VARCHAR(500) DEFAULT '' COMMENT '选项D',
    answer VARCHAR(10) NOT NULL COMMENT '正确答案',
    explanation TEXT COMMENT '解析',
    `order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '题目顺序',
    INDEX idx_bank (bank_id),
    FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表';

-- 考试记录表
CREATE TABLE exam_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_id BIGINT NOT NULL,
    score INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '得分',
    total INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总题数',
    correct_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '正确数',
    duration INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '用时(秒)',
    started_at DATETIME(6) NOT NULL COMMENT '开始时间',
    finished_at DATETIME(6) NOT NULL COMMENT '结束时间',
    INDEX idx_user (user_id),
    INDEX idx_bank (bank_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试记录表';

-- 错题表
CREATE TABLE wrong_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    user_answer VARCHAR(10) NOT NULL COMMENT '用户答案',
    added_at DATETIME(6) NOT NULL COMMENT '加入时间',
    is_mastered TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已掌握',
    UNIQUE KEY uk_user_question (user_id, question_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='错题表';

-- ============================================
-- 11. 积分等级模块
-- ============================================

-- 用户积分表
CREATE TABLE user_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    total_points INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总积分',
    level INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '等级',
    sign_in_streak INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '连续签到天数',
    last_sign_in DATE NULL COMMENT '上次签到日期',
    INDEX idx_points (total_points),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分表';

-- 积分记录表
CREATE TABLE points_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL COMMENT '行为: sign_in/post/comment/like_received/upload_resource/quiz_complete/checkin',
    points INT NOT NULL COMMENT '积分变动',
    description VARCHAR(200) DEFAULT '' COMMENT '描述',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

-- ============================================
-- 刷题初始数据
-- ============================================

-- 考研数学真题示例
INSERT INTO question_banks (name, exam_type, subject, year, description, question_count, time_limit, created_at) VALUES
('2024年考研数学一真题', 'kaoyan', '数学', 2024, '2024年全国硕士研究生入学考试数学一真题精选', 10, 30, NOW()),
('2024年考研英语一真题', 'kaoyan', '英语', 2024, '2024年全国硕士研究生入学考试英语一阅读精选', 10, 20, NOW()),
('2024年国考行测真题', 'kaogong', '行测', 2024, '2024年国家公务员考试行测逻辑判断精选', 10, 15, NOW());

INSERT INTO questions (bank_id, question_type, content, option_a, option_b, option_c, option_d, answer, explanation, `order`) VALUES
(1, 'single', '设函数f(x)在x=0处可导，且f(0)=0，则lim(x→0) f(x)/x 等于', 'f''(0)', '0', '1', '不存在', 'A', '由导数定义，f''(0) = lim(x→0) [f(x)-f(0)]/x = lim(x→0) f(x)/x', 1),
(1, 'single', '下列级数中收敛的是', '∑(1/n)', '∑(1/n²)', '∑((-1)^n)', '∑(n)', 'B', 'p级数∑(1/n^p)当p>1时收敛，此处p=2>1', 2),
(1, 'single', '设A为3阶矩阵，|A|=2，则|2A|等于', '4', '8', '16', '2', 'C', '|kA| = k^n|A|，其中n为阶数，所以|2A| = 2³×2 = 16', 3),
(1, 'single', '曲线y=x³在点(1,1)处的切线方程为', 'y=3x-2', 'y=3x+2', 'y=x', 'y=2x-1', 'A', 'y''=3x²，在x=1处y''=3，切线方程y-1=3(x-1)即y=3x-2', 4),
(1, 'single', '不定积分∫x·e^x dx等于', 'x·e^x - e^x + C', 'x·e^x + e^x + C', 'e^x + C', 'x²·e^x + C', 'A', '分部积分：∫x·e^x dx = x·e^x - ∫e^x dx = x·e^x - e^x + C', 5),
(1, 'single', '设z=x²y+xy²，则∂z/∂x等于', '2xy+y²', 'x²+2xy', '2xy+2xy', '2x+y²', 'A', '对x求偏导，y视为常数：∂z/∂x = 2xy + y²', 6),
(1, 'single', '微分方程y''+y=0的通解为', 'y=C₁cosx+C₂sinx', 'y=C₁e^x+C₂e^-x', 'y=C₁+C₂x', 'y=C₁e^x', 'A', '特征方程r²+1=0，r=±i，通解为y=C₁cosx+C₂sinx', 7),
(1, 'single', '行列式|1 2; 3 4|的值为', '-2', '2', '10', '-10', 'A', '1×4 - 2×3 = 4 - 6 = -2', 8),
(1, 'single', '设随机变量X~N(0,1)，则P(X>0)等于', '0.5', '0.25', '1', '0', 'A', '标准正态分布关于0对称，P(X>0) = 0.5', 9),
(1, 'single', '函数f(x)=x²在区间[-1,1]上的最大值为', '1', '0', '-1', '2', 'A', 'f(-1)=1，f(0)=0，f(1)=1，最大值为1', 10),
(2, 'single', 'The word "elaborate" in paragraph 1 is closest in meaning to', 'complex', 'simple', 'brief', 'unclear', 'A', 'elaborate意为"精心制作的，复杂的"，与complex意思最接近', 1),
(2, 'single', 'According to the passage, the main purpose of the study was to', 'prove a theory', 'explore a phenomenon', 'challenge existing beliefs', 'propose a solution', 'B', '根据文章内容，研究的主要目的是探索一个现象', 2),
(2, 'single', 'The author''s attitude toward the findings can be described as', 'skeptical', 'cautiously optimistic', 'indifferent', 'strongly opposed', 'B', '作者对研究结果持谨慎乐观态度', 3),
(2, 'single', 'Which of the following is NOT mentioned in the passage?', 'environmental impact', 'economic benefits', 'social implications', 'political consequences', 'D', '文章未提及政治后果', 4),
(2, 'single', 'The phrase "in the wake of" most likely means', 'following', 'despite', 'before', 'regardless of', 'A', 'in the wake of意为"在...之后"', 5),
(2, 'single', 'It can be inferred from the passage that', 'more research is needed', 'the problem is solved', 'no solution exists', 'the issue is exaggerated', 'A', '从文章可以推断出还需要更多研究', 6),
(2, 'single', 'The word "paramount" in the text means', 'most important', 'least significant', 'somewhat relevant', 'barely noticeable', 'A', 'paramount意为"至高无上的，最重要的"', 7),
(2, 'single', 'The passage is primarily organized by', 'cause and effect', 'comparison and contrast', 'chronological order', 'problem and solution', 'D', '文章主要按照问题和解决方案的方式组织', 8),
(2, 'single', 'What does "they" refer to in paragraph 3?', 'researchers', 'participants', 'critics', 'readers', 'A', '根据上下文，they指的是研究者', 9),
(2, 'single', 'The best title for this passage would be', 'A New Approach to Old Problems', 'The End of an Era', 'A Complete Guide', 'An Impossible Task', 'A', '最佳标题应概括文章主旨', 10),
(3, 'single', '所有金属都能导电，铜是金属，所以铜能导电。这是什么推理?', '演绎推理', '归纳推理', '类比推理', '因果推理', 'A', '大前提+小前提→结论，属于典型的演绎推理三段论', 1),
(3, 'single', '如果天下雨，则地面湿。地面湿，则以下哪项正确?', '天下雨了', '可能天下雨了', '天没下雨', '不确定', 'B', '肯定后件不能必然肯定前件，只能说可能', 2),
(3, 'single', '甲乙丙三人中只有一人做了好事。甲说："是乙做的"，乙说："不是我做的"，丙说："不是我做的"。如果只有一人说了真话，则做好事的是', '甲', '乙', '丙', '无法确定', 'C', '假设丙做了好事，则甲假乙真丙假，只有一人说真话，符合', 3),
(3, 'single', '某单位有工人60人，其中高级工30人，中级工20人，初级工10人。高级工月薪5000元，中级工月薪3000元，初级工月薪2000元。该单位工人的平均月薪为', '3500元', '3833元', '4000元', '3667元', 'B', '(30×5000+20×3000+10×2000)/60 = 230000/60 ≈ 3833元', 4),
(3, 'single', '1, 4, 9, 16, 25, (  )', '30', '35', '36', '49', 'C', '规律为n²：1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36', 5),
(3, 'single', '与"并非所有学生都通过了考试"等值的是', '所有学生都没通过考试', '有的学生没通过考试', '没有学生通过考试', '所有学生都通过了考试', 'B', '"并非所有S都是P"等值于"有的S不是P"', 6),
(3, 'single', '甲比乙大2岁，乙比丙大4岁，丙比丁小1岁。则甲比丁大', '5岁', '7岁', '3岁', '1岁', 'A', '甲=乙+2，乙=丙+4，丙=丁-1。甲=丁-1+4+2=丁+5，大5岁', 7),
(3, 'single', '如果"有些大学生是党员"为真，则下列必然为真的是', '所有大学生都是党员', '有些大学生不是党员', '有些党员是大学生', '所有党员都是大学生', 'C', '特称肯定判断换位后仍为特称肯定判断', 8),
(3, 'single', '某年3月1日是星期三，那年5月1日是星期几?', '星期一', '星期二', '星期三', '星期四', 'A', '3月有31天，4月有30天，3月1日到5月1日共61天。61÷7=8...5，星期三+5=星期一', 9),
(3, 'single', '办公室有5人：张、王、李、赵、刘。已知：张和王至少去一人，李和赵最多去一人，如果赵不去则刘也不去。如果张不去，则去的人是', '王、李', '王、赵、刘', '王、李、赵', '王、李、刘', 'A', '张不去→王去；赵和李最多去一人；假设赵去→刘去但需验证；最终王和李去', 10);
