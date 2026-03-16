-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS campus_flower CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE campus_flower;

-- 创建地点表
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    flower_species VARCHAR(50) NOT NULL,
    flower_species_en VARCHAR(50),
    bloom_status ENUM('dormant', 'budding', 'blooming', 'withering') DEFAULT 'dormant',
    historical_bloom_start DATE,
    historical_bloom_end DATE,
    cover_image VARCHAR(255),
    checkin_count INT DEFAULT 0,
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50) DEFAULT '',
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建打卡表
CREATE TABLE IF NOT EXISTS checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    bloom_report ENUM('budding', 'blooming', 'withering'),
    content TEXT,
    images JSON,
    user_latitude DECIMAL(10, 6),
    user_longitude DECIMAL(10, 6),
    gps_verified TINYINT(1) DEFAULT 0,
    likes_count INT DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,
    audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    audit_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flower_species VARCHAR(50) NOT NULL,
    location_id INT NOT NULL,
    grade ENUM('gold', 'silver') DEFAULT 'silver',
    unlock_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_flower_location (user_id, flower_species, location_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    checkin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_checkin (user_id, checkin_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE
);

-- 创建订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_location (user_id, location_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 创建举报表
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    checkin_id INT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status ENUM('pending', 'handled', 'ignored') DEFAULT 'pending',
    handle_note TEXT,
    handled_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE
);

-- 创建称号表
CREATE TABLE IF NOT EXISTS titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title_key VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_title (user_id, title_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户称号关联表
CREATE TABLE IF NOT EXISTS user_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title_key VARCHAR(50) NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户活跃称号的唯一索引
-- 暂时移除部分索引，后续可以通过应用逻辑控制每个用户只有一个活跃称号


-- 创建索引以提高查询性能
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_checkins_user_location ON checkins(user_id, location_id);
CREATE INDEX idx_checkins_location ON checkins(location_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_likes_checkin ON likes(checkin_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_reports_checkin ON reports(checkin_id);
CREATE INDEX idx_reports_status ON reports(status);

-- 插入默认数据
INSERT INTO locations (name, description, latitude, longitude, flower_species) VALUES
('樱花大道', '校园内著名的樱花大道', 39.9042, 116.4074, '樱花'),
('牡丹园', '种植了各种颜色的牡丹', 39.9043, 116.4075, '牡丹'),
('紫藤长廊', '夏日清凉的紫藤花廊', 39.9044, 116.4076, '紫藤');
