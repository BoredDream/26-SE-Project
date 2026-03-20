package com.example.backend.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Helpers {
    
    // 用户位置验证（检查用户是否在地点附近）
    public static boolean isUserNearLocation(double userLat, double userLng, double locationLat, double locationLng) {
        // 使用Haversine公式计算两点之间的距离
        final int R = 6371; // 地球半径（公里）
        
        double latDistance = Math.toRadians(locationLat - userLat);
        double lonDistance = Math.toRadians(locationLng - userLng);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(locationLat))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        
        // 距离小于100米视为在附近
        return distance < 0.1;
    }
    
    // 获取当前花期
    public static String getCurrentBloomSeason() {
        // 简单实现：根据当前月份返回花期
        int month = java.time.LocalDate.now().getMonthValue();
        
        if (month >= 3 && month <= 5) {
            return "spring";
        } else if (month >= 6 && month <= 8) {
            return "summer";
        } else if (month >= 9 && month <= 11) {
            return "autumn";
        } else {
            return "winter";
        }
    }
    
    // 格式化响应（与原项目兼容）
    public static <T> Map<String, Object> formatResponse(int code, String message, T data) {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}