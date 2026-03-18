# 网络请求失败问题解决方案

## 问题描述
用户在访问 API 测试页面时遇到以下错误：
```json
{ 
   "error": "Failed to fetch", 
   "message": "网络请求失败，请检查 API 地址是否正确" 
}
```

## 问题原因分析
1. **浏览器安全限制**：直接使用 `file://` 协议打开 HTML 文件时，浏览器会限制跨域请求
2. **API 地址错误**：前端代码中的 API 基础地址配置不正确
3. **网络连接问题**：网络连接不稳定或防火墙设置限制
4. **服务器未运行**：后端服务或测试服务器未启动

## 解决方案

### 1. 确认后端服务运行状态
```bash
# 检查 Docker 容器状态
docker-compose ps

# 查看后端服务日志
docker-compose logs backend
```

### 2. 确认 API 可访问性
```bash
# 测试健康状态检查
curl http://localhost:6000/health

# 测试获取地点列表
curl http://localhost:6000/v1/locations
```

### 3. 使用本地 HTTP 服务器
**不要**直接双击 HTML 文件打开！请使用本地 HTTP 服务器：

```bash
# 启动本地 HTTP 服务器
./start-server.sh
```

### 4. 正确访问测试页面
使用以下地址访问测试页面：
- 基础测试页面：**http://localhost:8080/simple-test.html**
- 完整测试页面：**http://localhost:8080/api-test.html**
- 网络诊断工具：**http://localhost:8080/network-diagnostic.html**

### 5. 检查 API 地址配置
确保前端代码中的 API 基础地址正确：
```javascript
// API 基础 URL 应该是
const BASE_URL = 'http://localhost:6000/v1';
```

## 常见问题排查

### 问题 1：端口被占用
```bash
# 检查端口 6000 是否被占用
lsof -i :6000  # Linux/macOS
netstat -ano | findstr :6000  # Windows
```

### 问题 2：Docker 容器未运行
```bash
# 启动所有容器
docker-compose up -d
```

### 问题 3：CORS 配置错误
检查 `app.js` 中的 CORS 配置：
```javascript
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 测试步骤

1. **启动后端服务**：
   ```bash
   docker-compose up -d
   ```

2. **启动本地 HTTP 服务器**：
   ```bash
   ./start-server.sh
   ```

3. **访问测试页面**：
   - 打开浏览器，访问：http://localhost:8080/simple-test.html
   - 点击 "测试健康状态" 按钮
   - 点击 "测试获取地点" 按钮
   - 输入测试代码 "test"，点击 "测试登录" 按钮

4. **查看结果**：
   - 成功：显示绿色的成功消息
   - 失败：显示红色的错误消息和详细信息

## 技术支持
如果问题仍然存在，请提供以下信息以便进一步分析：
1. 浏览器类型和版本
2. 操作系统类型和版本
3. 完整的错误信息和截图
4. 浏览器开发者工具的控制台日志

**联系方式**：技术支持团队
