# 花卉打卡系统后端 API 文档

## 服务基本信息
- 服务器地址: `http://101.37.240.166:5555`
- 基础地址: `http://101.37.240.166:5555`
- 认证方式: JWT Bearer Token
- 文件访问: `http://101.37.240.166:5555/uploads/<filename>`

---

## 目录
1. [认证接口](#认证接口)
2. [花卉接口](#花卉接口)
3. [地点与地图接口](#地点与地图接口)
4. [打卡接口](#打卡接口)
5. [成就与称号接口](#成就与称号接口)
6. [辅助接口](#辅助接口)

---

## 认证接口

### 1. 用户注册
- 方法: `POST`
- 路径: `/api/user/register`
- 描述: 创建新用户并返回 JWT token
- 请求头: `Content-Type: application/json` 或 `multipart/form-data`

#### JSON 请求示例
```json
{
  "username": "testuser",
  "password": "TestPass123",
  "nickname": "测试用户",
  "avatar_url": "http://example.com/avatar.jpg"
}
```

#### 表单上传示例
- 字段:
  - `username` (必填)
  - `password` (必填)
  - `nickname` (必填)
  - `avatar_url` (可选)
  - `avatar` (可选，文件上传)

#### 成功返回示例
```json
{
  "id": 1,
  "username": "testuser",
  "nickname": "测试用户",
  "avatar_url": null,
  "role": "user",
  "access_token": "<jwt_token>",
  "message": "User created successfully"
}
```

#### 常见错误返回
- `400`: `{"message": "Missing required parameters"}`
- `400`: `{"message": "User already exists"}`

---

### 2. 用户登录
- 方法: `POST`
- 路径: `/api/user/login`
- 描述: 使用用户名/密码登录，返回 JWT token
- 请求头: `Content-Type: application/json`

#### 请求示例
```json
{
  "username": "testuser",
  "password": "TestPass123"
}
```

#### 成功返回示例
```json
{
  "id": 1,
  "username": "testuser",
  "nickname": "测试用户",
  "avatar_url": null,
  "role": "user",
  "access_token": "<jwt_token>"
}
```

#### 错误返回
- `401`: `{"message": "Invalid username or password"}`

---

### 3. 获取用户信息
- 方法: `GET`
- 路径: `/api/user/info`
- 描述: 获取当前登录用户的基本信息、成就与称号
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 成功返回示例
```json
{
  "id": 1,
  "nickname": "测试用户",
  "avatar_url": null,
  "role": "user",
  "achievements": [],
  "titles": []
}
```

---

### 4. 更新用户信息
- 方法: `PUT`
- 路径: `/api/user/info`
- 描述: 更新当前用户昵称和头像链接
- 请求头:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: application/json`

#### 请求示例
```json
{
  "nickname": "新昵称",
  "avatar_url": "http://example.com/new-avatar.jpg"
}
```

#### 成功返回
- `200`: `{"message": "User info updated successfully"}`

---

## 花卉接口

### 5. 花卉列表
- 方法: `GET`
- 路径: `/api/flowers`
- 描述: 获取花卉列表，可按状态或种类筛选
- 可选查询参数:
  - `status`：`dormant` / `budding` / `blooming` / `withering`
  - `species`：按种类模糊查询

#### 响应示例
```json
[
  {
    "id": 1,
    "species": "樱花",
    "scientific_name": "Prunus serrulata",
    "bloom_status": "blooming",
    "cover_image": "https://example.com/cherry_blossom.jpg"
  }
]
```

---

### 6. 花卉详情
- 方法: `GET`
- 路径: `/api/flowers/<id>`
- 描述: 获取单个花卉的详细信息及所属地点列表

#### 响应示例
```json
{
  "id": 1,
  "species": "樱花",
  "scientific_name": "Prunus serrulata",
  "family": "蔷薇科",
  "genus": "李属",
  "bloom_status": "blooming",
  "historical_bloom_start": "03-01",
  "historical_bloom_end": "03-20",
  "cover_image": "https://example.com/cherry_blossom.jpg",
  "description": "樱花是蔷薇科李属的落叶乔木...",
  "places": [
    {
      "id": 1,
      "name": "中央公园",
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  ]
}
```

---

### 7. 花卉盛开状态
- 方法: `GET`
- 路径: `/api/flowers/<id>/bloom-status`
- 描述: 获取花卉当前盛开状态与历史区间

#### 响应示例
```json
{
  "current_status": "blooming",
  "historical_bloom_start": "03-01",
  "historical_bloom_end": "03-20"
}
```

---

## 地点与地图接口

### 8. 地点列表
- 方法: `GET`
- 路径: `/api/places`
- 描述: 获取地点列表，可传 `flower_id` 筛选包含该花卉的地点
- 可选参数:
  - `flower_id`

#### 响应示例
```json
[
  {
    "id": 1,
    "name": "中央公园",
    "description": "城市中心的大型公园，有丰富的花卉资源",
    "latitude": 39.9042,
    "longitude": 116.4074
  }
]
```

---

### 9. 地点详情
- 方法: `GET`
- 路径: `/api/places/<id>`
- 描述: 获取地点详细信息及该地点的花卉列表

#### 响应示例
```json
{
  "id": 1,
  "name": "中央公园",
  "description": "城市中心的大型公园，有丰富的花卉资源",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "flowers": [
    {
      "id": 1,
      "species": "樱花",
      "bloom_status": "blooming"
    }
  ]
}
```

---

### 10. 地图花卉列表
- 方法: `GET`
- 路径: `/api/map/flowers`
- 描述: 获取所有花卉地点数据，用于地图展示

#### 响应示例
```json
[
  {
    "flower_place_id": 1,
    "flower_id": 1,
    "flower_name": "樱花",
    "place_id": 1,
    "place_name": "中央公园",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "bloom_status": "blooming"
  }
]
```

---

### 11. 地图筛选
- 方法: `GET`
- 路径: `/api/map/filter`
- 描述: 根据 `flower_id` 获取对应地点坐标
- 必填参数:
  - `flower_id`

#### 请求示例
`/api/map/filter?flower_id=1`

#### 响应示例
```json
[
  {
    "place_id": 1,
    "place_name": "中央公园",
    "latitude": 39.9042,
    "longitude": 116.4074
  }
]
```

---

## 打卡接口

### 12. 创建打卡
- 方法: `POST`
- 路径: `/api/checkins`
- 描述: 提交打卡记录，可上传图片文件
- 请求头: `Content-Type: multipart/form-data`

#### 必填字段
- `user_id`
- `flower_place_id`
- `bloom_report`：`dormant` / `budding` / `blooming` / `withering`

#### 可选字段
- `content`
- `images`：可上传多个文件

#### 示例说明
- `images` 上传后，返回 `images` 字段为图片 URL 列表

#### 成功返回示例
```json
{
  "id": 1,
  "message": "Checkin created successfully",
  "images": [
    "http://101.37.240.166:5555/uploads/photo1.jpg"
  ]
}
```

---

### 13. 打卡列表
- 方法: `GET`
- 路径: `/api/checkins`
- 描述: 获取打卡记录列表，可按时间、状态、地点筛选
- 可选查询参数:
  - `start_time`：ISO 格式，例如 `2026-04-15T00:00:00`
  - `end_time`
  - `status`
  - `place_id`

#### 响应示例
```json
[
  {
    "id": 1,
    "user_id": 1,
    "flower_place_id": 1,
    "bloom_report": "blooming",
    "content": "今天樱花很漂亮！",
    "images": ["http://101.37.240.166:5555/uploads/photo1.jpg"],
    "likes_count": 0,
    "created_at": "2026-04-15T15:00:00"
  }
]
```

---

### 14. 打卡详情
- 方法: `GET`
- 路径: `/api/checkins/<id>`
- 描述: 获取指定打卡的详细信息

#### 响应示例
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "nickname": "测试用户",
    "avatar_url": null
  },
  "flower": {
    "id": 1,
    "species": "樱花"
  },
  "place": {
    "id": 1,
    "name": "中央公园"
  },
  "bloom_report": "blooming",
  "content": "今天樱花很漂亮！",
  "images": ["http://101.37.240.166:5555/uploads/photo1.jpg"],
  "likes_count": 0,
  "created_at": "2026-04-15T15:00:00"
}
```

---

### 15. 打卡点赞
- 方法: `PUT`
- 路径: `/api/checkins/<id>/like`
- 描述: 给指定打卡记录点赞，返回更新后的点赞数量

#### 响应示例
```json
{
  "likes_count": 1
}
```

---

### 16. 花卉打卡列表
- 方法: `GET`
- 路径: `/api/flowers/<id>/checkins`
- 描述: 获取指定花卉下的所有打卡帖子

#### 响应示例
```json
[
  {
    "id": 1,
    "user_id": 1,
    "bloom_report": "blooming",
    "content": "今天樱花很漂亮！",
    "images": ["http://101.37.240.166:5555/uploads/photo1.jpg"],
    "likes_count": 0,
    "created_at": "2026-04-15T15:00:00"
  }
]
```

---

### 17. 地点打卡列表
- 方法: `GET`
- 路径: `/api/places/<id>/checkins`
- 描述: 获取指定地点下的所有打卡帖子

#### 响应示例
```json
[
  {
    "id": 1,
    "user_id": 1,
    "bloom_report": "blooming",
    "content": "今天樱花很漂亮！",
    "images": ["http://101.37.240.166:5555/uploads/photo1.jpg"],
    "likes_count": 0,
    "created_at": "2026-04-15T15:00:00"
  }
]
```

---

## 成就与称号接口

### 18. 成就列表
- 方法: `GET`
- 路径: `/api/achievements`
- 描述: 获取所有可用成就

#### 响应示例
```json
[
  {
    "id": 1,
    "description": "初次打卡"
  }
]
```

---

### 19. 当前用户成就
- 方法: `GET`
- 路径: `/api/user/achievements`
- 描述: 获取当前登录用户已获得的成就
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 响应示例
```json
[
  {
    "id": 1,
    "description": "初次打卡"
  }
]
```

---

### 20. 当前用户称号
- 方法: `GET`
- 路径: `/api/user/titles`
- 描述: 获取当前登录用户已获得的称号
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 响应示例
```json
[
  {
    "id": 1,
    "description": "花卉爱好者"
  }
]
```

---

## 辅助接口

### 21. 健康检查
- 方法: `GET`
- 路径: `/health`
- 描述: 服务健康检查
- 成功返回:
```json
{"status": "ok"}
```

### 22. 前端测试页面
- 方法: `GET`
- 路径: `/test`
- 描述: 返回 `test_frontend.html` 测试页面

---

## 注意事项
1. 请将前端请求头中 `Authorization` 设置为 `Bearer <jwt_token>`。
2. `avatar_url` 与 `images` 返回的图片地址均为 `http://101.37.240.166:5555/uploads/<filename>`。
3. 如果需要使用 MySQL，请确保 `DATABASE_URL` 在后端环境变量中配置为 `mysql+pymysql://username:password@host:port/database`。
4. 所有时间字段均采用 ISO 格式字符串返回，例如 `2026-04-15T15:00:00`。
