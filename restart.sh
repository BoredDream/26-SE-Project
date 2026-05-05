#!/bin/bash
# ============================================================
# 花境 (Flower Garden) 项目重启脚本
# 支持重启后端 (Flask) 和前端 (Vue 3 / uni-app) 服务
# ============================================================

set -e

# ---------- 颜色定义 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ---------- 项目路径 ----------
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
FRONTEND_UNI_DIR="$PROJECT_DIR/Frontend-uni"

# ---------- 端口配置 ----------
BACKEND_PORT=5000
FRONTEND_PORT=5173

# ---------- 帮助信息 ----------
usage() {
    echo -e "${CYAN}用法:${NC}"
    echo -e "  $0 [选项]"
    echo ""
    echo -e "${CYAN}选项:${NC}"
    echo -e "  ${GREEN}all${NC}        重启所有服务 (后端 + 前端 Vue3 + 前端 uni-app)"
    echo -e "  ${GREEN}backend${NC}    仅重启后端 Flask 服务"
    echo -e "  ${GREEN}frontend${NC}   仅重启前端 Vue3 服务"
    echo -e "  ${GREEN}frontend-uni${NC} 仅重启前端 uni-app 服务"
    echo -e "  ${GREEN}-h, --help${NC} 显示此帮助信息"
    echo ""
    echo -e "${CYAN}示例:${NC}"
    echo -e "  $0 all              # 重启全部服务"
    echo -e "  $0 backend          # 只重启后端"
    echo -e "  $0 frontend         # 只重启前端 Vue3"
    echo ""
    exit 0
}

# ---------- 查找并终止进程 ----------
kill_process_on_port() {
    local port=$1
    local name=$2
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}  正在停止 $name (PID: $pid, 端口: $port)...${NC}"
        kill "$pid" 2>/dev/null || true
        # 等待进程退出
        for i in $(seq 1 10); do
            if ! kill -0 "$pid" 2>/dev/null; then
                break
            fi
            sleep 0.5
        done
        # 强制终止
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${RED}  强制终止 $name...${NC}"
            kill -9 "$pid" 2>/dev/null || true
        fi
        echo -e "${GREEN}  ✓ $name 已停止${NC}"
    else
        echo -e "${CYAN}  $name 未在运行${NC}"
    fi
}

kill_process_by_name() {
    local pattern=$1
    local name=$2
    local pids
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}  正在停止 $name...${NC}"
        kill $pids 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}  ✓ $name 已停止${NC}"
    else
        echo -e "${CYAN}  $name 未在运行${NC}"
    fi
}

# ---------- 启动后端 ----------
start_backend() {
    echo ""
    echo -e "${CYAN}━━━ 启动后端 (Flask) ━━━${NC}"
    cd "$BACKEND_DIR"

    # 检查虚拟环境
    if [ -d "venv" ]; then
        PYTHON="venv/bin/python"
    elif [ -d ".venv" ]; then
        PYTHON=".venv/bin/python"
    else
        PYTHON="python3"
    fi

    # 检查依赖
    echo -e "${YELLOW}  检查依赖...${NC}"
    $PYTHON -c "import flask" 2>/dev/null || {
        echo -e "${YELLOW}  安装依赖...${NC}"
        $PYTHON -m pip install -r requirements.txt -q
    }

    echo -e "${GREEN}  启动后端服务 (端口: $BACKEND_PORT)...${NC}"
    nohup $PYTHON app.py > "$BACKEND_DIR/../logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}  ✓ 后端已启动 (PID: $BACKEND_PID)${NC}"
    cd "$PROJECT_DIR"
}

# ---------- 启动前端 Vue3 ----------
start_frontend() {
    echo ""
    echo -e "${CYAN}━━━ 启动前端 (Vue3 + Vite) ━━━${NC}"
    cd "$FRONTEND_DIR"

    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  安装前端依赖...${NC}"
        npm install
    fi

    echo -e "${GREEN}  启动前端开发服务器 (端口: $FRONTEND_PORT)...${NC}"
    nohup npm run dev > "$PROJECT_DIR/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}  ✓ 前端已启动 (PID: $FRONTEND_PID)${NC}"
    cd "$PROJECT_DIR"
}

# ---------- 启动前端 uni-app ----------
start_frontend_uni() {
    echo ""
    echo -e "${CYAN}━━━ 启动前端 (uni-app) ━━━${NC}"
    cd "$FRONTEND_UNI_DIR"

    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  安装 uni-app 依赖...${NC}"
        npm install
    fi

    echo -e "${GREEN}  启动 uni-app H5 开发服务器...${NC}"
    nohup npm run dev:h5 > "$PROJECT_DIR/logs/frontend-uni.log" 2>&1 &
    FRONTEND_UNI_PID=$!
    echo -e "${GREEN}  ✓ uni-app 已启动 (PID: $FRONTEND_UNI_PID)${NC}"
    cd "$PROJECT_DIR"
}

# ---------- 检查端口占用 ----------
check_port() {
    local port=$1
    local name=$2
    if lsof -i :"$port" &>/dev/null 2>&1; then
        echo -e "${RED}  ⚠ 端口 $port 已被占用，$name 可能启动失败${NC}"
    fi
}

# ---------- 主逻辑 ----------
main() {
    # 创建日志目录
    mkdir -p "$PROJECT_DIR/logs"

    # 解析参数
    TARGET="${1:-all}"

    case "$TARGET" in
        all)
            echo -e "${CYAN}═══════════════════════════════════════${NC}"
            echo -e "${CYAN}  花境 (Flower Garden) 全量重启${NC}"
            echo -e "${CYAN}═══════════════════════════════════════${NC}"

            # 停止所有服务
            echo ""
            echo -e "${YELLOW}━━━ 停止所有服务 ━━━${NC}"
            kill_process_on_port "$BACKEND_PORT" "后端 (Flask)"
            kill_process_on_port "$FRONTEND_PORT" "前端 (Vue3)"
            kill_process_by_name "vite-plugin-uni" "前端 (uni-app)"

            # 等待端口释放
            sleep 1

            # 启动所有服务
            start_backend
            start_frontend
            start_frontend_uni

            echo ""
            echo -e "${CYAN}═══════════════════════════════════════${NC}"
            echo -e "${GREEN}  ✅ 所有服务已重启${NC}"
            echo -e "${CYAN}  ┌─────────────────────────────────┐${NC}"
            echo -e "${CYAN}  │ 后端 (Flask)    → http://localhost:$BACKEND_PORT${NC}"
            echo -e "${CYAN}  │ 前端 (Vue3)     → http://localhost:$FRONTEND_PORT${NC}"
            echo -e "${CYAN}  │ uni-app (H5)    → http://localhost:5174 (默认)${NC}"
            echo -e "${CYAN}  └─────────────────────────────────┘${NC}"
            echo ""
            echo -e "${YELLOW}  查看日志:${NC}"
            echo -e "    tail -f $PROJECT_DIR/logs/backend.log"
            echo -e "    tail -f $PROJECT_DIR/logs/frontend.log"
            echo -e "    tail -f $PROJECT_DIR/logs/frontend-uni.log"
            echo ""
            ;;

        backend)
            echo -e "${CYAN}━━━ 重启后端 (Flask) ━━━${NC}"
            kill_process_on_port "$BACKEND_PORT" "后端 (Flask)"
            sleep 1
            start_backend
            echo ""
            echo -e "${GREEN}  ✅ 后端已重启 → http://localhost:$BACKEND_PORT${NC}"
            ;;

        frontend)
            echo -e "${CYAN}━━━ 重启前端 (Vue3) ━━━${NC}"
            kill_process_on_port "$FRONTEND_PORT" "前端 (Vue3)"
            sleep 1
            start_frontend
            echo ""
            echo -e "${GREEN}  ✅ 前端已重启 → http://localhost:$FRONTEND_PORT${NC}"
            ;;

        frontend-uni)
            echo -e "${CYAN}━━━ 重启前端 (uni-app) ━━━${NC}"
            kill_process_by_name "vite-plugin-uni" "前端 (uni-app)"
            sleep 1
            start_frontend_uni
            echo ""
            echo -e "${GREEN}  ✅ uni-app 已重启${NC}"
            ;;

        -h|--help)
            usage
            ;;

        *)
            echo -e "${RED}错误: 未知选项 '$TARGET'${NC}"
            usage
            ;;
    esac
}

# ---------- 执行 ----------
main "$@"
