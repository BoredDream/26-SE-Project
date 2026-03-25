-- 校园花卉打卡系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_flower CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_flower;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    avatar_url VARCHAR(255) DEFAULT NULL COMMENT '用户头像URL',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 花卉表
CREATE TABLE IF NOT EXISTS flowers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '花卉名称',
    scientific_name VARCHAR(100) DEFAULT NULL COMMENT '学名',
    description TEXT DEFAULT NULL COMMENT '花卉描述',
    blooming_season VARCHAR(50) DEFAULT NULL COMMENT '花期',
    image_url VARCHAR(255) DEFAULT NULL COMMENT '花卉图片URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='花卉表';

-- 3. 地点表
CREATE TABLE IF NOT EXISTS places (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '地点名称',
    latitude DECIMAL(10, 8) NOT NULL COMMENT '纬度',
    longitude DECIMAL(11, 8) NOT NULL COMMENT '经度',
    address VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
    checkin_count INT DEFAULT 0 COMMENT '打卡次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地点表';

-- 4. 花卉地点关联表
CREATE TABLE IF NOT EXISTS flower_places (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flower_id INT NOT NULL COMMENT '花卉ID',
    place_id INT NOT NULL COMMENT '地点ID',
    bloom_status ENUM('not_blooming', 'blooming', 'over') DEFAULT 'not_blooming' COMMENT '花期状态',
    last_bloom_report TIMESTAMP DEFAULT NULL COMMENT '上次花期报告时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (flower_id) REFERENCES flowers(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    UNIQUE KEY uk_flower_place (flower_id, place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='花卉地点关联表';

-- 5. 打卡表
CREATE TABLE IF NOT EXISTS checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    flower_place_id INT NOT NULL COMMENT '花卉地点ID',
    bloom_report ENUM('not_blooming', 'blooming', 'over') DEFAULT NULL COMMENT '花期报告',
    content TEXT DEFAULT NULL COMMENT '打卡内容',
    images JSON DEFAULT NULL COMMENT '打卡图片列表',
    gps_verified BOOLEAN DEFAULT FALSE COMMENT 'GPS验证状态',
    user_latitude DECIMAL(10, 8) DEFAULT NULL COMMENT '用户打卡纬度',
    user_longitude DECIMAL(11, 8) DEFAULT NULL COMMENT '用户打卡经度',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    is_visible BOOLEAN DEFAULT TRUE COMMENT '是否可见（软删除）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flower_place_id) REFERENCES flower_places(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡表';

-- 6. 打卡点赞表
CREATE TABLE IF NOT EXISTS checkin_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    checkin_id INT NOT NULL COMMENT '打卡ID',
    user_id INT NOT NULL COMMENT '点赞用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_checkin_user (checkin_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡点赞表';

-- 7. 打卡举报表
CREATE TABLE IF NOT EXISTS checkin_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    checkin_id INT NOT NULL COMMENT '打卡ID',
    user_id INT NOT NULL COMMENT '举报用户ID',
    reason VARCHAR(255) NOT NULL COMMENT '举报原因',
    status ENUM('pending', 'processed', 'dismissed') DEFAULT 'pending' COMMENT '处理状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡举报表';

-- 8. 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    flower_place_id INT NOT NULL COMMENT '花卉地点ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '订阅时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flower_place_id) REFERENCES flower_places(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_flower_place (user_id, flower_place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅表';

-- 9. 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '成就名称',
    description TEXT NOT NULL COMMENT '成就描述',
    icon_url VARCHAR(255) DEFAULT NULL COMMENT '成就图标URL',
    condition_type ENUM('checkin_count', 'flower_type_count', 'continuous_days') NOT NULL COMMENT '成就条件类型',
    condition_value INT NOT NULL COMMENT '成就条件值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';

-- 10. 用户成就关联表
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    achievement_id INT NOT NULL COMMENT '成就ID',
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就关联表';

-- 11. 头衔表
CREATE TABLE IF NOT EXISTS titles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '头衔名称',
    description TEXT DEFAULT NULL COMMENT '头衔描述',
    icon_url VARCHAR(255) DEFAULT NULL COMMENT '头衔图标URL',
    required_points INT NOT NULL COMMENT '所需积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='头衔表';

-- 12. 用户头衔关联表
CREATE TABLE IF NOT EXISTS user_titles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    title_id INT NOT NULL COMMENT '头衔ID',
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
    is_current BOOLEAN DEFAULT FALSE COMMENT '是否为当前使用头衔',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_title (user_id, title_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户头衔关联表';

-- 插入初始数据
-- 1. 插入管理员用户
INSERT INTO users (openid, nickname, role) VALUES ('admin_openid', '管理员', 'admin') ON DUPLICATE KEY UPDATE nickname = '管理员', role = 'admin';

-- 2. 插入示例花卉
INSERT INTO flowers (name, scientific_name, description, blooming_season) VALUES 
('樱花', 'Prunus serrulata', '樱花是蔷薇科樱属几种植物的统称，在《中国植物志》新修订的名称中专指东京樱花，亦称日本樱花。', '3-4月'),
('郁金香', 'Tulipa gesneriana', '郁金香是百合科郁金香属的多年生草本植物，具球茎。', '3-5月'),
('玫瑰', 'Rosa rugosa', '玫瑰是蔷薇科蔷薇属多种植物的通称。', '5-6月')
ON DUPLICATE KEY UPDATE scientific_name = VALUES(scientific_name), description = VALUES(description), blooming_season = VALUES(blooming_season);

-- 3. 插入示例地点
INSERT INTO places (name, latitude, longitude, address) VALUES 
('图书馆前广场', 39.9087, 116.3975, '图书馆前广场'),
('教学楼中庭', 39.9092, 116.3980, '主教学楼中庭'),
('宿舍区花园', 39.9078, 116.3965, '学生宿舍区中央花园')
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), address = VALUES(address);

-- 4. 插入示例花卉地点关联
INSERT INTO flower_places (flower_id, place_id, bloom_status) VALUES 
(1, 1, 'blooming'),
(2, 2, 'not_blooming'),
(3, 3, 'blooming')
ON DUPLICATE KEY UPDATE bloom_status = VALUES(bloom_status);

-- 5. 插入示例成就
INSERT INTO achievements (name, description, condition_type, condition_value) VALUES 
('初次打卡', '完成第一次打卡', 'checkin_count', 1),
('花卉爱好者', '打卡5种不同花卉', 'flower_type_count', 5),
('连续打卡', '连续打卡3天', 'continuous_days', 3)
ON DUPLICATE KEY UPDATE description = VALUES(description), condition_type = VALUES(condition_type), condition_value = VALUES(condition_value);

-- 6. 插入示例头衔
INSERT INTO titles (name, description, required_points) VALUES 
('新手', '刚加入的新手用户', 0),
('花卉达人', '打卡经验丰富的用户', 100),
('校园花卉专家', '对校园花卉了如指掌的用户', 500)
ON DUPLICATE KEY UPDATE description = VALUES(description), required_points = VALUES(required_points);
