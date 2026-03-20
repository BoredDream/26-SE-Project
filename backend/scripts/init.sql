-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_flower CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_flower;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid      VARCHAR(64)  NOT NULL UNIQUE COMMENT '微信openid',
  nickname    VARCHAR(50)  NOT NULL DEFAULT '',
  avatar_url  VARCHAR(500) DEFAULT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建花卉地点表
CREATE TABLE IF NOT EXISTS locations (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(100)  NOT NULL COMMENT '地点名称',
  description            TEXT          DEFAULT NULL,
  latitude               DECIMAL(10,7) NOT NULL,
  longitude              DECIMAL(10,7) NOT NULL,
  flower_species         VARCHAR(100)  NOT NULL COMMENT '花卉品种',
  bloom_status           ENUM('dormant','budding','blooming','withering') NOT NULL DEFAULT 'dormant',
  historical_bloom_start VARCHAR(20)   DEFAULT NULL COMMENT '如 03-01',
  historical_bloom_end   VARCHAR(20)   DEFAULT NULL COMMENT '如 03-20',
  cover_image            VARCHAR(500)  DEFAULT NULL,
  checkin_count          INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '用于热力图',
  status_updated_at      DATETIME      DEFAULT NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建用户打卡表
CREATE TABLE IF NOT EXISTS checkins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  location_id    INT UNSIGNED NOT NULL,
  bloom_report   ENUM('budding','blooming','withering') DEFAULT NULL COMMENT '用户报告的花期状态',
  content        TEXT         DEFAULT NULL COMMENT '图文描述，最多500字',
  images         JSON         DEFAULT NULL COMMENT '三级图片URL对象数组',
  likes_count    INT UNSIGNED NOT NULL DEFAULT 0,
  gps_verified   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'GPS校验是否通过',
  user_latitude  DECIMAL(10,7) DEFAULT NULL,
  user_longitude DECIMAL(10,7) DEFAULT NULL,
  audit_status   ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  is_visible     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_location_created (location_id, created_at DESC),
  INDEX idx_audit_status (audit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_location (user_id, location_id),
  FOREIGN KEY (user_id)     REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  location_id    INT UNSIGNED NOT NULL,
  flower_species VARCHAR(100) NOT NULL COMMENT '冗余字段，方便展示',
  grade          ENUM('gold','silver') NOT NULL,
  checkin_id     INT UNSIGNED NOT NULL COMMENT '触发该成就的打卡记录',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_species (user_id, flower_species),
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建称号表
CREATE TABLE IF NOT EXISTS titles (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  title_key  VARCHAR(50)  NOT NULL COMMENT '如 explorer / photographer',
  title_name VARCHAR(50)  NOT NULL COMMENT '如 花卉观察员',
  awarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_title (user_id, title_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建探花使荣誉表
CREATE TABLE IF NOT EXISTS pioneer_honors (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  location_id  INT UNSIGNED NOT NULL,
  bloom_season VARCHAR(20)  NOT NULL COMMENT '如 2026-spring',
  checkin_id   INT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_location_season (location_id, bloom_season),
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始管理员用户
INSERT INTO users (openid, nickname, role) VALUES ('admin_openid', '管理员', 'admin') ON DUPLICATE KEY UPDATE nickname='管理员';

-- 插入测试数据：花卉地点
INSERT INTO locations (name, description, latitude, longitude, flower_species, bloom_status, historical_bloom_start, historical_bloom_end, cover_image) VALUES
('樱花大道', '校园里最美的樱花大道，每年三月绽放', 23.129163, 113.264435, '樱花', 'blooming', '03-01', '03-20', 'https://example.com/cherry.jpg'),
('荷花池', '校园中心的荷花池，夏季荷花盛开', 23.128000, 113.265000, '荷花', 'dormant', '06-01', '09-01', 'https://example.com/lotus.jpg'),
('菊花坛', '秋季菊花展览的主要场地', 23.127000, 113.264000, '菊花', 'dormant', '10-01', '11-30', 'https://example.com/chrysanthemum.jpg');
