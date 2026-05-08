# 花境 (Flower Garden) 后端 API 文档

## 服务基本信息

- 服务器地址: `http://101.37.240.166:5000`
- 基础地址: `http://101.37.240.166:5000`
- API 前缀: `/v1/`
- 认证方式: JWT Bearer Token
- 文件访问: `http://101.37.240.166:5000/uploads/<filename>`
- 响应格式: `{code: 200, message: "ok", data: {...}}`

---

## 目录

1. [认证接口](#认证接口)
2. [用户接口](#用户接口)
3. [花卉接口](#花卉接口)
4. [地点与地图接口](#地点与地图接口)
5. [打卡接口](#打卡接口)
6. [评论接口](#评论接口)
7. [成就与称号接口](#成就与称号接口)
8. [辅助接口](#辅助接口)

---

## 认证接口

### 1. 用户注册

- 方法: `POST`
- 路径: `/v1/auth/register`
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
  "code": 201,
  "message": "User created successfully",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar_url": null,
      "role": "user",
      "level": 1,
      "exp": 0,
      "total_checkins": 0
    }
  }
}
```

#### 常见错误返回

- `400`: `{"code": 400, "message": "Missing required parameters", "data": null}`
- `400`: `{"code": 400, "message": "User already exists", "data": null}`

---

### 2. 用户登录

- 方法: `POST`
- 路径: `/v1/auth/login`
- 描述: 支持两种登录模式：账号密码 / 微信 code
- 请求头: `Content-Type: application/json`

#### 账号密码模式

```json
{
  "mode": "password",
  "username": "testuser",
  "password": "TestPass123"
}
```

#### 微信 code 模式

```json
{
  "mode": "wechat",
  "code": "<wechat_code>"
}
```

#### 成功返回示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar_url": null,
      "role": "user",
      "level": 1,
      "exp": 0,
      "total_checkins": 0
    }
  }
}
```

#### 错误返回

- `401`: `{"code": 401, "message": "Invalid username or password", "data": null}`

---

## 用户接口

### 3. 获取当前用户信息

- 方法: `GET`
- 路径: `/v1/users/me`
- 描述: 获取当前登录用户的基本信息、成就与称号
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 成功返回示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar_url": null,
    "role": "user",
    "level": 1,
    "exp": 0,
    "total_checkins": 0,
    "achievements": [],
    "titles": []
  }
}
```

---

### 4. 更新当前用户信息

- 方法: `PUT`
- 路径: `/v1/users/me`
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

- `200`: `{"code": 200, "message": "User info updated successfully", "data": null}`

---

## 花卉接口

### 5. 花卉列表

- 方法: `GET`
- 路径: `/v1/flowers`
- 描述: 获取花卉列表，可按状态或种类筛选
- 可选查询参数:
  - `status`：`dormant` / `budding` / `blooming` / `withering`
  - `species`：按种类模糊查询

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "species": "樱花",
      "scientific_name": "Prunus serrulata",
      "bloom_status": "blooming",
      "cover_image": "https://example.com/cherry_blossom.jpg"
    }
  ]
}
```

---

### 6. 花卉详情

- 方法: `GET`
- 路径: `/v1/flowers/<id>`
- 描述: 获取单个花卉的详细信息及所属地点列表

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
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
}
```

---

### 7. 花卉盛开状态

- 方法: `GET`
- 路径: `/v1/flowers/<id>/bloom-status`
- 描述: 获取花卉当前盛开状态与历史区间

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "current_status": "blooming",
    "historical_bloom_start": "03-01",
    "historical_bloom_end": "03-20"
  }
}
```

---

### 8. 花卉打卡列表

- 方法: `GET`
- 路径: `/v1/flowers/<id>/checkins`
- 描述: 获取指定花卉下的所有打卡帖子

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "bloom_report": "blooming",
      "content": "今天樱花很漂亮！",
      "images": ["http://101.37.240.166:5000/uploads/photo1.jpg"],
      "likes_count": 0,
      "created_at": "2026-04-15T15:00:00"
    }
  ]
}
```

---

## 地点与地图接口

### 9. 地点列表

- 方法: `GET`
- 路径: `/v1/locations`
- 描述: 获取地点列表，可传 `flower_id` 筛选包含该花卉的地点
- 可选参数:
  - `flower_id`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "name": "中央公园",
      "description": "城市中心的大型公园，有丰富的花卉资源",
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  ]
}
```

---

### 10. 地点详情

- 方法: `GET`
- 路径: `/v1/locations/<id>`
- 描述: 获取地点详细信息及该地点的花卉列表

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
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
}
```

---

### 11. 地点打卡列表

- 方法: `GET`
- 路径: `/v1/locations/<id>/checkins`
- 描述: 获取指定地点下的所有打卡帖子

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "bloom_report": "blooming",
      "content": "今天樱花很漂亮！",
      "images": ["http://101.37.240.166:5000/uploads/photo1.jpg"],
      "likes_count": 0,
      "created_at": "2026-04-15T15:00:00"
    }
  ]
}
```

---

### 12. 地图花卉列表

- 方法: `GET`
- 路径: `/v1/map/flowers`
- 描述: 获取所有花卉地点数据，用于地图展示

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
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
}
```

---

### 13. 地图筛选

- 方法: `GET`
- 路径: `/v1/map/filter`
- 描述: 根据 `flower_id` 获取对应地点坐标
- 必填参数:
  - `flower_id`

#### 请求示例

`/v1/map/filter?flower_id=1`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "place_id": 1,
      "place_name": "中央公园",
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  ]
}
```

---

## 打卡接口

### 14. 创建打卡

- 方法: `POST`
- 路径: `/v1/checkins`
- 描述: 提交打卡记录，可上传图片文件
- 请求头: `Content-Type: multipart/form-data`
- 认证: `Authorization: Bearer <jwt_token>`

#### 必填字段

- `flower_place_id`
- `bloom_report`：`dormant` / `budding` / `blooming` / `withering`

#### 可选字段

- `content`
- `images`：可上传多个文件

#### 成功返回示例

```json
{
  "code": 201,
  "message": "Checkin created successfully",
  "data": {
    "id": 1,
    "images": [
      "http://101.37.240.166:5000/uploads/photo1.jpg"
    ]
  }
}
```

---

### 15. 打卡列表

- 方法: `GET`
- 路径: `/v1/checkins`
- 描述: 获取打卡记录列表，可按时间、状态、地点筛选
- 可选查询参数:
  - `start_time`：ISO 格式，例如 `2026-04-15T00:00:00`
  - `end_time`
  - `status`
  - `place_id`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "flower_place_id": 1,
      "bloom_report": "blooming",
      "content": "今天樱花很漂亮！",
      "images": ["http://101.37.240.166:5000/uploads/photo1.jpg"],
      "likes_count": 0,
      "created_at": "2026-04-15T15:00:00"
    }
  ]
}
```

---

### 16. 打卡详情

- 方法: `GET`
- 路径: `/v1/checkins/<id>`
- 描述: 获取指定打卡的详细信息

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
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
    "images": ["http://101.37.240.166:5000/uploads/photo1.jpg"],
    "likes_count": 0,
    "created_at": "2026-04-15T15:00:00"
  }
}
```

---

### 17. 点赞打卡

- 方法: `POST`
- 路径: `/v1/checkins/<id>/like`
- 描述: 给指定打卡记录点赞
- 认证: `Authorization: Bearer <jwt_token>`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "likes_count": 1
  }
}
```

---

### 18. 取消点赞

- 方法: `POST`
- 路径: `/v1/checkins/<id>/dislike`
- 描述: 取消对指定打卡记录的点赞
- 认证: `Authorization: Bearer <jwt_token>`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "likes_count": 0
  }
}
```

---

## 评论接口

### 19. 获取评论列表

- 方法: `GET`
- 路径: `/v1/checkins/<checkin_id>/comments`
- 描述: 获取指定打卡下的所有评论

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "checkin_id": 1,
      "user_id": 2,
      "content": "好漂亮！",
      "created_at": "2026-04-15T16:00:00"
    }
  ]
}
```

---

### 20. 发表评论

- 方法: `POST`
- 路径: `/v1/checkins/<checkin_id>/comments`
- 描述: 对指定打卡发表评论
- 认证: `Authorization: Bearer <jwt_token>`
- 请求头: `Content-Type: application/json`

#### 请求示例

```json
{
  "content": "好漂亮！"
}
```

#### 成功返回

```json
{
  "code": 201,
  "message": "Comment created successfully",
  "data": {
    "id": 1,
    "checkin_id": 1,
    "content": "好漂亮！",
    "created_at": "2026-04-15T16:00:00"
  }
}
```

---

### 21. 删除评论

- 方法: `DELETE`
- 路径: `/v1/checkins/<checkin_id>/comments/<comment_id>`
- 描述: 删除指定评论（仅评论作者可删除）
- 认证: `Authorization: Bearer <jwt_token>`

#### 成功返回

- `200`: `{"code": 200, "message": "Comment deleted successfully", "data": null}`

---

## 成就与称号接口

### 22. 成就列表

- 方法: `GET`
- 路径: `/v1/achievements`
- 描述: 获取所有可用成就

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "name": "初次打卡",
      "description": "完成第一次打卡",
      "icon": "https://example.com/icon.png",
      "condition_type": "checkin_count",
      "condition_value": 1
    }
  ]
}
```

---

### 23. 当前用户成就

- 方法: `GET`
- 路径: `/v1/users/me/achievements`
- 描述: 获取当前登录用户已获得的成就
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "name": "初次打卡",
      "description": "完成第一次打卡",
      "icon": "https://example.com/icon.png"
    }
  ]
}
```

---

### 24. 当前用户称号

- 方法: `GET`
- 路径: `/v1/users/me/titles`
- 描述: 获取当前登录用户已获得的称号
- 请求头:
  - `Authorization: Bearer <jwt_token>`

#### 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "name": "花卉爱好者",
      "description": "完成第一次打卡",
      "icon": "https://example.com/icon.png"
    }
  ]
}
```

---

## 辅助接口

### 25. 健康检查

- 方法: `GET`
- 路径: `/v1/health`
- 描述: 服务健康检查

#### 成功返回

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "status": "ok"
  }
}
```

---

### 26. 文件上传

- 方法: `POST`
- 路径: `/v1/upload`
- 描述: 上传文件，返回文件访问 URL
- 请求头: `Content-Type: multipart/form-data`
- 字段: `file` (文件)

#### 成功返回

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "url": "http://101.37.240.166:5000/uploads/filename.jpg"
  }
}
```

---

### 27. 获取上传文件

- 方法: `GET`
- 路径: `/uploads/<filename>`
- 描述: 获取上传的静态文件（图片等）

---

## 注意事项

1. 所有 API 端点统一使用 `/v1/` 前缀（文件访问 `/uploads/` 除外）
2. 响应格式统一为 `{code, message, data}`
3. 需要认证的接口需在请求头携带 `Authorization: Bearer <jwt_token>`
4. 图片地址格式为 `http://101.37.240.166:5000/uploads/<filename>`
5. 所有时间字段均采用 ISO 8601 格式返回，例如 `2026-04-15T15:00:00`
