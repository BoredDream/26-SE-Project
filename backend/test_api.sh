#!/bin/bash

# 后端API测试脚本
# 设置API基础URL
API_BASE_URL="http://localhost:3000"

# 颜色定义
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# 测试结果统计
PASSED=0
FAILED=0
TOTAL=0

# 测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    local expected_status=$5
    local test_name=$6
    
    TOTAL=$((TOTAL + 1))
    
    echo -n "Testing ${test_name} (${method} ${endpoint})... "
    
    local curl_cmd="curl -s -X ${method} -w '%{http_code}' ${API_BASE_URL}${endpoint}"
    
    # 添加认证头
    if [ -n "$auth" ]; then
        curl_cmd="${curl_cmd} -H 'Authorization: Bearer ${auth}'"
    fi
    
    # 添加请求体
    if [ -n "$data" ]; then
        curl_cmd="${curl_cmd} -H 'Content-Type: application/json' -d '${data}'"
    fi
    
    # 执行curl命令并获取状态码和响应体
    local response=$(eval "${curl_cmd}")
    local status_code=$(echo "${response}" | tail -n 1)
    local response_body=$(echo "${response}" | head -n -1)
    
    # 检查状态码
    if [ "${status_code}" -eq "${expected_status}" ]; then
        echo -e "${GREEN}PASSED${NC}"
        echo "  Response: ${response_body}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Expected status: ${expected_status}, Got: ${status_code}"
        echo "  Response: ${response_body}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 运行测试
echo -e "${YELLOW}=== 开始API测试 ===${NC}"
echo "API基础URL: ${API_BASE_URL}"
echo

# 1. 测试健康检查接口（不需要认证）
test_api "GET" "/health" "" "" 200 "健康检查"

echo

# 2. 测试认证接口
# 注意：微信登录需要真实的code，这里只是示例
echo -e "${YELLOW}=== 认证模块测试 ===${NC}"
# 由于微信登录需要真实的code，这里我们假设测试失败，但脚本结构保留
test_api "POST" "/v1/auth/login" '{"code": "test_code"}' "" 200 "微信登录"

# 假设我们已经获得了token
# ACCESS_TOKEN="your_test_token"

# 3. 测试用户模块
# echo -e "\n${YELLOW}=== 用户模块测试 ===${NC}"
# test_api "GET" "/v1/users" "" "${ACCESS_TOKEN}" 200 "获取用户列表"
# test_api "GET" "/v1/users/1" "" "${ACCESS_TOKEN}" 200 "获取单个用户"

# 4. 测试位置模块
echo -e "\n${YELLOW}=== 位置模块测试 ===${NC}"
test_api "GET" "/v1/locations" "" "" 200 "获取地点列表"
test_api "GET" "/v1/locations/1" "" "" 200 "获取地点详情"
# 测试需要认证的接口（假设未认证会失败）
test_api "PATCH" "/v1/locations/1/status" '{"status": 1}' "" 401 "更新花期状态（未认证）"

# 5. 测试签到模块
echo -e "\n${YELLOW}=== 签到模块测试 ===${NC}"
test_api "GET" "/v1/checkins" "" "" 200 "获取所有打卡数据"
# 测试需要认证的接口（假设未认证会失败）
test_api "POST" "/v1/checkins" '{"location_id": 1, "content": "测试打卡", "images": []}' "" 401 "发布打卡（未认证）"
test_api "POST" "/v1/checkins/1/like" "" "" 401 "点赞（未认证）"
test_api "POST" "/v1/checkins/1/report" '{"reason": "测试举报"}' "" 401 "举报打卡（未认证）"

# 6. 测试其他模块
echo -e "\n${YELLOW}=== 其他模块测试 ===${NC}"
# 订阅模块
test_api "GET" "/v1/subscriptions" "" "" 401 "获取订阅列表（未认证）"

# 成就模块
test_api "GET" "/v1/achievements" "" "" 200 "获取成就列表"

# 头衔模块
test_api "GET" "/v1/titles" "" "" 200 "获取头衔列表"

# 管理员模块
test_api "GET" "/v1/admin/stats" "" "" 401 "获取统计数据（未认证）"

# 输出测试结果
echo -e "\n${YELLOW}=== 测试结果 ===${NC}"
echo "总测试数: ${TOTAL}"
echo -e "通过: ${GREEN}${PASSED}${NC}"
echo -e "失败: ${RED}${FAILED}${NC}"

if [ ${FAILED} -eq 0 ]; then
    echo -e "\n${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "\n${RED}有${FAILED}个测试失败！${NC}"
    exit 1
fi