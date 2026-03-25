# 使用Node.js 18 Debian基础镜像，更容易安装sharp依赖
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装npm依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production

# 复制项目文件
COPY . .

# 创建uploads目录
RUN mkdir -p uploads

# 暴露端口（根据环境变量或配置文件）
EXPOSE 6000

# 启动应用
CMD ["npm", "start"]
