#!/bin/bash

# 校园花卉地图后端 API 测试脚本

BASE_URL="http://localhost:6000/v1"
TOKEN=""

# 打印分隔线
function print_separator {
    echo "============================================================"
}

# 打印标题
function print_title {
    echo -e "\033[1;34m$1\033[0m"
}

# 打印成功信息
function print_success {
    echo -e "\033[1;32m✓ $1\033[0m"
}

# 打印错误信息
function print_error {
    echo -e "\033[1;31m✗ $1\033[0m"
}

# 打印响应
function print_response {
    echo -e "\033[0;36m$1\033[0m"
}

# 测试健康状态检查
function test_health_check {
    print_title "测试 1: 健康状态检查"
    
    local response=$(curl -s "http://localhost:6000/health")
    local status=$?
    
    if [ $status -eq 0 ]; then
        print_success "健康状态检查成功"
        print_response "响应: $response"
        return 0
    else
        print_error "健康状态检查失败"
        return 1
    fi
}

# 测试获取地点列表
function test_get_locations {
    print_title "测试 2: 获取地点列表"
    
    local response=$(curl -s "$BASE_URL/locations")
    local status=$?
    
    if [ $status -eq 0 ]; then
        print_success "获取地点列表成功"
        print_response "响应: $response"
        return 0
    else
        print_error "获取地点列表失败"
        return 1
    fi
}

# 测试登录功能
function test_login {
    print_title "测试 3: 登录功能"
    
    local response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"code": "test"}' "$BASE_URL/auth/login")
    local status=$?
    
    if [ $status -eq 0 ]; then
        # 提取 Token
        TOKEN=$(echo $response | grep -o '"token":"[^"]*"' | cut -d '"' -f 4)
        
        if [ -n "$TOKEN" ]; then
            print_success "登录成功"
            print_response "Token: ${TOKEN:0:20}..."
            print_response "完整响应: $response"
            return 0
        else
            print_error "登录失败，无法提取 Token"
            print_response "响应: $response"
            return 1
        fi
    else
        print_error "登录请求失败"
        return 1
    fi
}

# 测试获取用户信息
function test_get_profile {
    print_title "测试 4: 获取用户信息"
    
    if [ -z "$TOKEN" ]; then
        print_error "需要先登录获取 Token"
        return 1
    fi
    
    local response=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/users/me")
    local status=$?
    
    if [ $status -eq 0 ]; then
        print_success "获取用户信息成功"
        print_response "响应: $response"
        return 0
    else
        print_error "获取用户信息失败"
        return 1
    fi
}

# 运行所有测试
function run_all_tests {
    print_title "开始 API 测试"
    print_separator
    
    local success=0
    local total=0
    
    # 测试健康状态
    total=$((total+1))
    test_health_check
    if [ $? -eq 0 ]; then
        success=$((success+1))
    fi
    print_separator
    
    # 测试获取地点列表
    total=$((total+1))
    test_get_locations
    if [ $? -eq 0 ]; then
        success=$((success+1))
    fi
    print_separator
    
    # 测试登录
    total=$((total+1))
    test_login
    if [ $? -eq 0 ]; then
        success=$((success+1))
    fi
    print_separator
    
    # 测试获取用户信息
    if [ -n "$TOKEN" ]; then
        total=$((total+1))
        test_get_profile
        if [ $? -eq 0 ]; then
            success=$((success+1))
        fi
        print_separator
    fi
    
    # 打印测试结果
    print_title "测试结果"
    echo -e "测试总数: $total"
    echo -e "成功: \033[1;32m$success\033[0m"
    echo -e "失败: \033[1;31m$((total-success))\033[0m"
    
    if [ $success -eq $total ]; then
        print_success "所有测试通过！"
        return 0
    else
        print_error "部分测试失败！"
        return 1
    fi
}

# 主函数
function main {
    echo -e "\033[1;33m校园花卉地图后端 API 测试脚本\033[0m"
    echo -e "测试 API: $BASE_URL\n"
    
    run_all_tests
}

# 执行主函数
main