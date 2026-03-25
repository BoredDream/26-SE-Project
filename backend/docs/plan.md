## 📋 缺失API清单

### 一、用户管理模块 🔴 高优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/users/me` | 获取当前登录用户信息 | users |
| `PUT /v1/users/me` | 更新当前用户信息（昵称、头像等） | users |
| `GET /v1/admin/users` | 管理员获取用户列表（分页、筛选） | users |
| `PATCH /v1/admin/users/:id/role` | 管理员修改用户角色 | users |
| `DELETE /v1/admin/users/:id` | 管理员删除/封禁用户 | users |

---

### 二、花卉管理模块 🔴 高优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/flowers` | 获取花卉列表（支持搜索、筛选、分页） | flowers |
| `GET /v1/flowers/:id` | 获取单个花卉详情 | flowers |
| `POST /v1/flowers` | 创建花卉信息（管理员） | flowers |
| `PUT /v1/flowers/:id` | 更新花卉信息（管理员） | flowers |
| `DELETE /v1/flowers/:id` | 删除花卉（管理员） | flowers |
| `POST /v1/upload/flower-image` | 花卉封面图片上传 | 腾讯云COS |

---

### 三、打卡管理模块 🔴 高优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/checkins/:id` | 获取单个打卡详情 | checkins |
| `PUT /v1/checkins/:id` | 更新打卡内容（用户自己的） | checkins |
| `DELETE /v1/checkins/:id` | 删除打卡（用户自己的/管理员） | checkins |
| `GET /v1/checkins/me` | 获取当前用户的打卡列表 | checkins |
| `GET /v1/checkins/place/:placeId` | 获取某地点的打卡列表 | checkins |
| `GET /v1/checkins/flower/:flowerId` | 获取某花卉的打卡列表 | checkins |
| `POST /v1/upload/checkin-image` | 打卡图片上传 | 腾讯云COS |
| `GET /v1/checkins/:id/likes` | 获取打卡点赞用户列表 | checkins |

---

### 四、花期投票模块 🟡 中优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/locations/:id/vote/record` | 获取当前用户的投票记录 | 需新建投票记录表 |
| `DELETE /v1/locations/:id/vote` | 取消/修改投票 | 需新建投票记录表 |
| `GET /v1/locations/:id/vote/stats` | 获取投票统计信息 | flowers |

> ⚠️ **注意**：数据库结构中没有独立的投票记录表，建议添加 `votes` 表来追踪用户投票历史

---

### 五、成就与称号模块 🟡 中优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/achievements/progress` | 获取成就解锁进度 | achievements |
| `GET /v1/titles/user/:id` | 获取指定用户的称号 | titles |
| `POST /v1/admin/titles` | 管理员授予用户称号 | titles |
| `DELETE /v1/admin/titles/:id` | 管理员撤销称号 | titles |
| `GET /v1/achievements/types` | 获取所有成就类型定义 | 需配置表 |

---

### 六、订阅与通知模块 🟡 中优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/subscriptions/:id` | 获取单个订阅详情 | subscriptions |
| `PUT /v1/subscriptions/:id` | 更新订阅设置 | subscriptions |
| `POST /v1/subscriptions/batch` | 批量订阅 | subscriptions |
| `DELETE /v1/subscriptions/batch` | 批量取消订阅 | subscriptions |
| `POST /v1/notifications/test` | 测试消息推送（开发用） | - |

> ⚠️ **注意**：缺少花期变化通知的推送机制，建议集成微信订阅消息或添加消息队列

---

### 七、地图与位置服务 🟡 中优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/locations/nearby` | 获取附近花卉地点（按GPS） | places |
| `GET /v1/locations/search` | 搜索地点（关键词、花卉类型） | places, flowers |
| `GET /v1/locations/heatmap` | 获取打卡热力图数据 | places, checkins |
| `POST /v1/locations/verify-gps` | GPS位置校验接口 | - |

---

### 八、统计与分析模块 🟢 低优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/stats/user` | 用户个人统计（打卡数、成就数等） | 多表 |
| `GET /v1/stats/flower/:id` | 单花卉统计（打卡数、投票数等） | 多表 |
| `GET /v1/stats/trend` | 打卡趋势分析（按时间） | checkins |
| `GET /v1/stats/ranking` | 用户排行榜 | users, checkins |

---

### 九、文件上传模块 🔴 高优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `POST /v1/upload/avatar` | 用户头像上传 | 腾讯云COS |
| `POST /v1/upload/multiple` | 批量图片上传 | 腾讯云COS |
| `DELETE /v1/upload/:fileId` | 删除已上传文件 | 腾讯云COS |

---

### 十、系统管理模块 🟢 低优先级

| 缺失API | 说明 | 关联表 |
|--------|------|--------|
| `GET /v1/admin/logs` | 系统操作日志查询 | 需新建日志表 |
| `GET /v1/admin/config` | 系统配置管理 | 需新建配置表 |
| `PUT /v1/admin/config` | 更新系统配置 | 需新建配置表 |
| `POST /v1/admin/backup` | 数据库备份触发 | - |
| `GET /v1/admin/health` | 服务健康检查 | - |
---
补充的数据库表
```sql
-- 投票记录表
CREATE TABLE votes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    flower_place_id INT UNSIGNED NOT NULL,
    vote_status ENUM('dormant','budding','blooming','withering') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_flower_place (user_id, flower_place_id)
);

-- 系统配置表
CREATE TABLE system_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(200),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 操作日志表
CREATE TABLE operation_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT UNSIGNED,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

请添加缺少的API与数据库表，并同步更新README，test_api.sh