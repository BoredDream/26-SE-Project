package com.example.backend.service;

import com.example.backend.model.Checkin;
import com.example.backend.repository.CheckinRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {
    
    private final JdbcTemplate jdbcTemplate;
    private final CheckinRepository checkinRepository;
    
    public LeaderboardService(JdbcTemplate jdbcTemplate, CheckinRepository checkinRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.checkinRepository = checkinRepository;
    }
    
    // 获取打卡王榜
    public List<Map<String, Object>> getCheckinLeaderboard(String month) {
        String query;
        Object[] params;
        
        if (month != null && !month.isEmpty()) {
            // 按指定月份查询
            String[] parts = month.split("-");
            String year = parts[0];
            String monthNum = parts[1];
            
            query = "SELECT u.id, u.nickname, u.avatar_url, COUNT(c.id) as checkin_count " +
                    "FROM users u " +
                    "JOIN checkins c ON u.id = c.user_id " +
                    "WHERE YEAR(c.created_at) = ? AND MONTH(c.created_at) = ? AND c.audit_status = 'approved' " +
                    "GROUP BY u.id " +
                    "ORDER BY checkin_count DESC " +
                    "LIMIT 20";
            params = new Object[]{year, monthNum};
        } else {
            // 按当前月份查询
            LocalDate now = LocalDate.now();
            
            query = "SELECT u.id, u.nickname, u.avatar_url, COUNT(c.id) as checkin_count " +
                    "FROM users u " +
                    "JOIN checkins c ON u.id = c.user_id " +
                    "WHERE YEAR(c.created_at) = ? AND MONTH(c.created_at) = ? AND c.audit_status = 'approved' " +
                    "GROUP BY u.id " +
                    "ORDER BY checkin_count DESC " +
                    "LIMIT 20";
            params = new Object[]{now.getYear(), now.getMonthValue()};
        }
        
        return jdbcTemplate.queryForList(query, params);
    }
    
    // 获取点赞榜
    public List<Map<String, Object>> getLikesLeaderboard() {
        // 获取获赞最多的打卡内容（前20条）
        List<Checkin> checkins = checkinRepository.findByAuditStatusOrderByLikesCountDesc(
                "approved", PageRequest.of(0, 20));
        
        // 转换为前端需要的格式
        List<Map<String, Object>> result = new ArrayList<>();
        for (Checkin checkin : checkins) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", checkin.getId());
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", checkin.getUser().getId());
            userMap.put("nickname", checkin.getUser().getNickname());
            userMap.put("avatar_url", checkin.getUser().getAvatarUrl());
            
            map.put("user", userMap);
            map.put("location_id", checkin.getLocation().getId());
            map.put("bloom_report", checkin.getBloomReport());
            map.put("content", checkin.getContent());
            map.put("images", checkin.getImages());
            map.put("likes_count", checkin.getLikesCount());
            map.put("created_at", checkin.getCreatedAt());
            
            result.add(map);
        }
        return result;
    }
}