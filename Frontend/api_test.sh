#!/usr/bin/env bash
# API test helper for front-end engineers
# Usage:
#   ./api_test.sh register
#   ./api_test.sh login
#   ./api_test.sh info
#   ./api_test.sh flowers
#   ./api_test.sh place 1
#   ./api_test.sh checkins
#   ./api_test.sh health
# Set BASE_URL if needed, default uses the provided server IP.

BASE_URL="http://101.37.240.166:5555"
TOKEN_FILE=".api_test_token"

save_token() {
  echo "$1" > "$TOKEN_FILE"
}

load_token() {
  if [[ -f "$TOKEN_FILE" ]]; then
    cat "$TOKEN_FILE"
  else
    echo ""
  fi
}

if [[ -n "$BASE_URL_OVERRIDE" ]]; then
  BASE_URL="$BASE_URL_OVERRIDE"
fi

echo_header() {
  echo
  echo "=== $1 ==="
}

register() {
  echo_header "Register"
  curl -s -X POST "$BASE_URL/api/user/register" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "testuser",
      "password": "TestPass123",
      "nickname": "测试用户",
      "avatar_url": "http://example.com/avatar.jpg"
    }' | jq
}

login() {
  echo_header "Login"
  response=$(curl -s -X POST "$BASE_URL/api/user/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "testuser",
      "password": "TestPass123"
    }')
  echo "$response" | jq
  token=$(echo "$response" | jq -r '.access_token // empty')
  if [[ -n "$token" ]]; then
    save_token "$token"
    echo "Saved token to $TOKEN_FILE"
  else
    echo "Login failed, token not saved."
  fi
}

info() {
  token=$(load_token)
  if [[ -z "$token" ]]; then
    echo "Token file not found or empty. Run './api_test.sh login' first."
    exit 1
  fi
  echo_header "User Info"
  curl -s -X GET "$BASE_URL/api/user/info" \
    -H "Authorization: Bearer $token" | jq
}

update_info() {
  token=$(load_token)
  if [[ -z "$token" ]]; then
    echo "Token file not found or empty. Run './api_test.sh login' first."
    exit 1
  fi
  echo_header "Update User Info"
  curl -s -X PUT "$BASE_URL/api/user/info" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{"nickname": "修改昵称", "avatar_url": "http://example.com/new-avatar.jpg"}' | jq
}

flowers() {
  echo_header "Flower List"
  curl -s "$BASE_URL/api/flowers" | jq
}

flower_detail() {
  id=${1:-1}
  echo_header "Flower Detail: $id"
  curl -s "$BASE_URL/api/flowers/$id" | jq
}

flower_bloom() {
  id=${1:-1}
  echo_header "Flower Bloom Status: $id"
  curl -s "$BASE_URL/api/flowers/$id/bloom-status" | jq
}

places() {
  echo_header "Place List"
  curl -s "$BASE_URL/api/places" | jq
}

place_detail() {
  id=${1:-1}
  echo_header "Place Detail: $id"
  curl -s "$BASE_URL/api/places/$id" | jq
}

map_flowers() {
  echo_header "Map Flowers"
  curl -s "$BASE_URL/api/map/flowers" | jq
}

map_filter() {
  flower_id=${1:-1}
  echo_header "Map Filter for flower_id=$flower_id"
  curl -s "$BASE_URL/api/map/filter?flower_id=$flower_id" | jq
}

health() {
  echo_header "Health Check"
  curl -s "$BASE_URL/health" | jq
}

checkins() {
  echo_header "Checkin List"
  curl -s "$BASE_URL/api/checkins" | jq
}

checkin_detail() {
  id=${1:-1}
  echo_header "Checkin Detail: $id"
  curl -s "$BASE_URL/api/checkins/$id" | jq
}

like_checkin() {
  id=${1:-1}
  echo_header "Like Checkin: $id"
  curl -s -X PUT "$BASE_URL/api/checkins/$id/like" | jq
}

flower_checkins() {
  id=${1:-1}
  echo_header "Flower Checkins: $id"
  curl -s "$BASE_URL/api/flowers/$id/checkins" | jq
}

place_checkins() {
  id=${1:-1}
  echo_header "Place Checkins: $id"
  curl -s "$BASE_URL/api/places/$id/checkins" | jq
}

achievements() {
  echo_header "Achievement List"
  curl -s "$BASE_URL/api/achievements" | jq
}

user_achievements() {
  token=$(load_token)
  if [[ -z "$token" ]]; then
    echo "Token file not found or empty. Run './api_test.sh login' first."
    exit 1
  fi
  echo_header "User Achievements"
  curl -s -X GET "$BASE_URL/api/user/achievements" \
    -H "Authorization: Bearer $token" | jq
}

titles() {
  token=$(load_token)
  if [[ -z "$token" ]]; then
    echo "Token file not found or empty. Run './api_test.sh login' first."
    exit 1
  fi
  echo_header "User Titles"
  curl -s -X GET "$BASE_URL/api/user/titles" \
    -H "Authorization: Bearer $token" | jq
}

create_checkin() {
  token=$(load_token)
  if [[ -z "$token" ]]; then
    echo "Token file not found or empty. Run './api_test.sh login' first."
    exit 1
  fi
  echo_header "Create Checkin"
  curl -s -X POST "$BASE_URL/api/checkins" \
    -H "Authorization: Bearer $token" \
    -F "user_id=1" \
    -F "flower_place_id=1" \
    -F "bloom_report=blooming" \
    -F "content=测试打卡内容" \
    -F "images=@test_image.jpg" | jq
}

usage() {
  cat <<EOF
Usage: $0 <command>
Commands:
  register              创建用户测试
  login                 登录并保存 token
  info                  获取当前用户信息
  update-info           更新当前用户信息
  flowers               获取花卉列表
  flower-detail <id>    获取花卉详情
  flower-bloom <id>     获取花卉盛开状态
  places                获取地点列表
  place-detail <id>     获取地点详情
  map-flowers           获取地图花卉列表
  map-filter <flower_id> 获取地图筛选数据
  health                健康检查
  checkins              获取打卡列表
  checkin-detail <id>   获取打卡详情
  like-checkin <id>     点赞打卡
  flower-checkins <id>  获取花卉打卡列表
  place-checkins <id>   获取地点打卡列表
  achievements          获取成就列表
  user-achievements     获取当前用户成就
  titles                获取当前用户称号
  create-checkin        创建测试打卡（需本地 test_image.jpg）

Environment:
  BASE_URL_OVERRIDE    可以覆盖默认后端地址
EOF
}

command=$1
shift || true

case "$command" in
  register) register ;; 
  login) login ;; 
  info) info ;; 
  update-info) update_info ;; 
  flowers) flowers ;; 
  flower-detail) flower_detail "$@" ;; 
  flower-bloom) flower_bloom "$@" ;; 
  places) places ;; 
  place-detail) place_detail "$@" ;; 
  map-flowers) map_flowers ;; 
  map-filter) map_filter "$@" ;; 
  health) health ;; 
  checkins) checkins ;; 
  checkin-detail) checkin_detail "$@" ;; 
  like-checkin) like_checkin "$@" ;; 
  flower-checkins) flower_checkins "$@" ;; 
  place-checkins) place_checkins "$@" ;; 
  achievements) achievements ;; 
  user-achievements) user_achievements ;; 
  titles) titles ;; 
  create-checkin) create_checkin ;; 
  *) usage ;; 
 esac
