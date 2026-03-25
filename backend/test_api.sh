#!/bin/bash

# ==============================================================================
# 校园花卉地图小程序后端 - API 自动化测试脚本
# ==============================================================================
# 依赖: curl, jq
# 用法: ./test_api.sh
# ==============================================================================

# --- 配置区域 ---
BASE_URL="http://101.37.240.166:3001/v1"
# 如果是远程服务器，请替换为实际域名，例如: https://api.yourdomain.com/v1

# 模拟数据 (可根据实际数据库种子数据调整)
# 注意：微信小程序登录通常需要真实的 code，这里假设后端有测试模式或我们使用模拟的 openid 流程
# 如果后端严格校验微信 code，此脚本的登录部分可能需要调整为使用已有的测试账号 Token
MOCK_WX_CODE="test_code_123456" 
TEST_USER_NICKNAME="TestUser_$(date +%s)"
TEST_FLOWER_NAME="测试樱花"
TEST_LOCATION_NAME="图书馆前草坪"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- 辅助函数 ---

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# 检查 HTTP 状态码
check_status() {
    local status=$1
    local expected=${2:-200}
    if [ "$status" -eq "$expected" ] || [ "$status" -eq "${expected%.*}" ]; then
        return 0
    else
        return 1
    fi
}

# 发送请求并打印结果
request() {
    local method=$1
    local path=$2
    local data=$3
    local token=$4
    
    local headers=(-H "Content-Type: application/json")
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi

    local url="${BASE_URL}${path}"
    
    log_info "Request: $method $url"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" "$url")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" -d "$data" "$url")
    elif [ "$method" == "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" -d "$data" "$url")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" "${headers[@]}" "$url")
    fi

    # 分离 body 和 status code
    body=$(echo "$response" | sed '$d')
    status=$(echo "$response" | tail -n1)

    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    return $status
}

# --- 测试流程 ---

echo "=========================================="
echo "开始校园花卉地图后端 API 测试"
echo "目标地址: $BASE_URL"
echo "=========================================="

# 1. 用户认证测试 (登录/注册)
log_info "=== 阶段 1: 用户认证 ==="
# 假设后端支持通过 mock code 自动注册/登录
LOGIN_DATA="{\"code\": \"$MOCK_WX_CODE\", \"nickname\": \"$TEST_USER_NICKNAME\", \"avatar\": \"http://example.com/avatar.jpg\"}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "$LOGIN_DATA")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n1)

if check_status $STATUS 200; then
    log_success "用户登录成功"
    TOKEN=$(echo "$BODY" | jq -r '.data.token')
    USER_ID=$(echo "$BODY" | jq -r '.data.user.id')
    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        log_error "未能提取到 Token，检查返回结构"
        exit 1
    fi
    log_info "获取到 Token: ${TOKEN:0:20}..."
    log_info "用户 ID: $USER_ID"
else
    log_error "用户登录失败 (Status: $STATUS)"
    echo "$BODY"
    # 如果登录失败，后续测试无法进行，尝试继续但会报错，或者直接退出
    # 这里选择退出，因为后续都需要 token
    exit 1
fi

# 2. 获取当前用户信息
log_info "=== 阶段 2: 用户信息 ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if check_status $STATUS 200; then
    log_success "获取用户信息成功"
else
    log_error "获取用户信息失败"
fi

# 3. 花卉与地点管理 (需要管理员权限，这里假设第一个注册用户或者是测试环境允许普通用户创建用于测试)
# 注意：根据文档，创建花卉和地点通常需要 '管理员' 角色。
# 如果当前用户不是管理员，这部分会返回 403。
# 为了脚本能跑通，我们假设这是测试环境，或者您手动将测试用户提升为管理员。
# 如果不是管理员，以下步骤将跳过或报错。

log_info "=== 阶段 3: 花卉与地点管理 (需管理员权限) ==="

# 创建花卉
FLOWER_DATA="{\"name\": \"$TEST_FLOWER_NAME\", \"scientific_name\": \"Prunus serrulata\", \"description\": \"测试用的樱花\", \"bloom_start\": \"03-01\", \"bloom_end\": \"04-01\"}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/flowers" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$FLOWER_DATA")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if check_status $STATUS 201; then
    log_success "创建花卉成功"
    FLOWER_ID=$(echo "$BODY" | jq -r '.data.id')
    log_info "花卉 ID: $FLOWER_ID"
else
    log_error "创建花卉失败 (可能是权限不足): Status $STATUS"
    echo "$BODY" | jq '.'
    FLOWER_ID=""
fi

# 创建地点
LOCATION_DATA="{\"name\": \"$TEST_LOCATION_NAME\", \"latitude\": 39.9042, \"longitude\": 116.4074, \"description\": \"测试地点\"}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/locations" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$LOCATION_DATA")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if check_status $STATUS 201; then
    log_success "创建地点成功"
    LOCATION_ID=$(echo "$BODY" | jq -r '.data.id')
    log_info "地点 ID: $LOCATION_ID"
    
    # 关联花卉到地点 (假设有一个接口或通过更新地点实现，文档中未明确列出关联接口，通常是 flower_places 表)
    # 这里假设地点创建时可以直接关联，或者跳过此步直接打卡
    # 为了演示打卡，我们需要一个有效的 location_id。如果上面成功了，我们继续。
else
    log_error "创建地点失败: Status $STATUS"
    LOCATION_ID=""
fi

# 4. 用户打卡测试
log_info "=== 阶段 4: 用户打卡 ==="

if [ -n "$LOCATION_ID" ]; then
    # 模拟打卡 (需要图片文件，这里用占位符或跳过图片上传逻辑，仅测试文本逻辑)
    # 真实场景需要 multipart/form-data，curl 处理较复杂，这里简化为测试逻辑接口
    # 假设后端允许在没有图片的情况下创建打卡，或者我们只测试元数据
    
    CHECKIN_DATA="{\"location_id\": $LOCATION_ID, \"content\": \"今天花开得很好！\", \"latitude\": 39.9042, \"longitude\": 116.4074, \"bloom_status\": \"blooming\"}"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/checkins" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$CHECKIN_DATA")
    STATUS=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if check_status $STATUS 201; then
        log_success "打卡成功"
        CHECKIN_ID=$(echo "$BODY" | jq -r '.data.id')
        log_info "打卡 ID: $CHECKIN_ID"
        
        # 点赞打卡
        log_info "测试点赞功能..."
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/checkins/$CHECKIN_ID/like" -H "Authorization: Bearer $TOKEN")
        STATUS=$(echo "$RESPONSE" | tail -n1)
        if check_status $STATUS 200; then
            log_success "点赞成功"
        else
            log_error "点赞失败"
        fi
        
        # 获取打卡详情
        log_info "获取打卡详情..."
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/checkins/$CHECKIN_ID" -H "Authorization: Bearer $TOKEN")
        STATUS=$(echo "$RESPONSE" | tail -n1)
        if check_status $STATUS 200; then
            log_success "获取打卡详情成功"
        fi
        
        # 删除打卡 (清理数据)
        log_info "清理测试数据：删除打卡..."
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/checkins/$CHECKIN_ID" -H "Authorization: Bearer $TOKEN")
        STATUS=$(echo "$RESPONSE" | tail -n1)
        if check_status $STATUS 200; then
            log_success "删除打卡成功"
        fi
    else
        log_error "打卡失败: Status $STATUS"
        echo "$BODY" | jq '.'
    fi
else
    log_info "跳过打卡测试 (因为未成功创建地点)"
fi

# 5. 成就与订阅系统
log_info "=== 阶段 5: 成就与订阅 ==="

# 获取成就列表
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/achievements" -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if check_status $STATUS 200; then
    log_success "获取成就列表成功"
else
    log_error "获取成就列表失败"
fi

# 获取我的成就
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/achievements/me" -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if check_status $STATUS 200; then
    log_success "获取我的成就成功"
fi

# 订阅花卉 (需要 location_id 或 flower_id，假设使用之前的地点)
if [ -n "$LOCATION_ID" ]; then
    SUB_DATA="{\"location_id\": $LOCATION_ID}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/subscriptions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$SUB_DATA")
    STATUS=$(echo "$RESPONSE" | tail -n1)
    if check_status $STATUS 201; then
        log_success "订阅成功"
        
        # 取消订阅
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/subscriptions/$LOCATION_ID" -H "Authorization: Bearer $TOKEN")
        STATUS=$(echo "$RESPONSE" | tail -n1)
        if check_status $STATUS 200; then
            log_success "取消订阅成功"
        fi
    else
        log_error "订阅失败"
    fi
fi

# 6. 管理员统计 (如果当前用户是管理员)
log_info "=== 阶段 6: 管理员功能测试 ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/stats" -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n1)
if check_status $STATUS 200; then
    log_success "获取管理员统计数据成功 (当前用户具有管理员权限)"
else
    log_info "获取管理员统计失败 (Status: $STATUS)，可能当前用户不是管理员，这是预期的行为。"
fi

# 7. 清理测试数据 (删除创建的地点和花卉)
log_info "=== 阶段 7: 数据清理 ==="
if [ -n "$LOCATION_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/locations/$LOCATION_ID" -H "Authorization: Bearer $TOKEN")
    STATUS=$(echo "$RESPONSE" | tail -n1)
    if check_status $STATUS 200; then
        log_success "测试地点已删除"
    fi
fi

if [ -n "$FLOWER_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/flowers/$FLOWER_ID" -H "Authorization: Bearer $TOKEN")
    STATUS=$(echo "$RESPONSE" | tail -n1)
    if check_status $STATUS 200; then
        log_success "测试花卉已删除"
    fi
fi

echo "=========================================="
echo "测试执行完毕"
echo "=========================================="