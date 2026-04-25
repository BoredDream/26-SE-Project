#!/bin/bash
# 后端 API 冒烟测试脚本

BASE_URL="http://127.0.0.1:5000"

echo "=== Health Check ==="
curl -s "$BASE_URL/v1/health" | python3 -m json.tool

echo ""
echo "=== Demo Login ==="
TOKEN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mode":"demo"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('token',''))")

echo "Token: ${TOKEN:0:30}..."

echo ""
echo "=== Get Checkins ==="
curl -s "$BASE_URL/v1/checkins?limit=1" | python3 -m json.tool

echo ""
echo "=== Get Locations ==="
curl -s "$BASE_URL/v1/locations" | python3 -m json.tool

echo ""
echo "=== Get Current User ==="
curl -s "$BASE_URL/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== Done ==="
