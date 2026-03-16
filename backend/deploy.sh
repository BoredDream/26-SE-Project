#!/bin/bash

# 校园花卉地图后端部署脚本
# 版本：1.0
# 日期：2026-03-15

echo "========================================"
echo "校园花卉地图后端部署脚本"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否以root用户运行
echo -e "${BLUE}检查用户权限...${NC}"
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误：请以root用户运行此脚本${NC}"
    exit 1
fi

# 检查系统要求
echo -e "${BLUE}检查系统要求...${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js未安装，正在安装...${NC}"
    apt update && apt install -y nodejs npm
else
    echo -e "${GREEN}✓ Node.js已安装$(node -v)${NC}"
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL未安装，正在安装...${NC}"
    apt update && apt install -y mysql-server mysql-client
    systemctl start mysql
    systemctl enable mysql
else
    echo -e "${GREEN}✓ MySQL已安装${NC}"
fi

# 检查Redis
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}Redis未安装，正在安装...${NC}"
    apt update && apt install -y redis-server
    systemctl start redis-server
    systemctl enable redis-server
else
    echo -e "${GREEN}✓ Redis已安装${NC}"
fi

# 检查项目目录
echo -e "${BLUE}检查项目目录...${NC}"
if [ ! -d "./src" ]; then
    echo -e "${RED}错误：当前目录不是项目根目录，请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 安装依赖
echo -e "${BLUE}安装项目依赖...${NC}"
npm install

# 配置环境变量
echo -e "${BLUE}配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}.env文件不存在，正在从.env.example创建...${NC}"
    cp .env.example .env
    
    # 提示用户配置环境变量
    echo -e "${YELLOW}请编辑.env文件配置数据库和其他参数：${NC}"
    echo -e "${YELLOW}vi .env${NC}"
    
    # 等待用户确认
    read -p "按Enter键继续，或按Ctrl+C退出配置..."
fi

# 初始化数据库
echo -e "${BLUE}初始化数据库...${NC}"

# 创建数据库
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)

# 检查init.sql文件
if [ -f "./scripts/init.sql" ]; then
    mysql -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < ./scripts/init.sql
    echo -e "${GREEN}✓ 数据库初始化完成${NC}"
else
    echo -e "${YELLOW}警告：scripts/init.sql文件不存在，跳过数据库初始化${NC}"
fi

# 配置服务
echo -e "${BLUE}配置系统服务...${NC}"

# 创建systemd服务文件
cat > /etc/systemd/system/campus-flower-api.service << EOF
[Unit]
Description=Campus Flower Map API Service
After=network.target mysql.service redis-server.service

[Service]
Type=simple
WorkingDirectory=/mnt/d/软件工程/backend
ExecStart=/usr/bin/node src/app.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
systemctl daemon-reload

# 启动服务
echo -e "${BLUE}启动服务...${NC}"
systemctl start campus-flower-api.service

# 查看服务状态
echo -e "${BLUE}服务状态...${NC}"
systemctl status campus-flower-api.service --no-pager

echo "========================================"
echo -e "${GREEN}部署完成！${NC}"
echo "========================================"
echo "API地址: http://localhost:3000/v1"
echo "健康检查: http://localhost:3000/v1/health"
echo ""
echo "常用命令："
echo "  启动服务: systemctl start campus-flower-api.service"
echo "  停止服务: systemctl stop campus-flower-api.service"
echo "  重启服务: systemctl restart campus-flower-api.service"
echo "  查看日志: journalctl -u campus-flower-api.service -f"
echo ""
echo -e "${YELLOW}注意：如果服务启动失败，请查看日志获取详细信息${NC}"