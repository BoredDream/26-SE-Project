package com.example.backend.service;

import com.example.backend.model.Achievement;
import com.example.backend.model.Title;
import com.example.backend.repository.AchievementRepository;
import com.example.backend.repository.TitleRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AchievementService {
    
    private final AchievementRepository achievementRepository;
    private final TitleRepository titleRepository;
    private final UserRepository userRepository;
    
    public AchievementService(AchievementRepository achievementRepository, TitleRepository titleRepository, 
                             UserRepository userRepository) {
        this.achievementRepository = achievementRepository;
        this.titleRepository = titleRepository;
        this.userRepository = userRepository;
    }
    
    // 获取我的花圃（成就列表）
    public List<Map<String, Object>> getMyAchievements(Long userId) {
        // 获取所有成就
        List<Achievement> achievements = achievementRepository.findAll();
        List<Achievement> userAchievements = new ArrayList<>();
        for (Achievement achievement : achievements) {
            if (achievement.getUser().getId().equals(userId)) {
                userAchievements.add(achievement);
            }
        }
        
        // 为每个成就添加打卡次数
        List<Map<String, Object>> result = new ArrayList<>();
        for (Achievement achievement : userAchievements) {
            int checkinCount = achievementRepository.getCheckinCountByUserAndSpecies(
                    userId, achievement.getFlowerSpecies());
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", achievement.getId());
            map.put("user_id", achievement.getUser().getId());
            map.put("location_id", achievement.getLocation().getId());
            map.put("flower_species", achievement.getFlowerSpecies());
            map.put("grade", achievement.getGrade());
            map.put("checkin_id", achievement.getCheckin().getId());
            map.put("checkin_count", checkinCount);
            map.put("created_at", achievement.getCreatedAt());
            map.put("updated_at", achievement.getUpdatedAt());
            result.add(map);
        }
        return result;
    }
    
    // 获取我的称号
    public List<Title> getMyTitles(Long userId) {
        return titleRepository.findByUserIdOrderByAwardedAtDesc(userId);
    }
    
    // 查看他人花圃
    public List<Map<String, Object>> getUserAchievements(Long userId) {
        // 检查用户是否存在
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 获取用户的所有成就
        List<Achievement> achievements = achievementRepository.findAll();
        List<Achievement> userAchievements = new ArrayList<>();
        for (Achievement achievement : achievements) {
            if (achievement.getUser().getId().equals(userId)) {
                userAchievements.add(achievement);
            }
        }
        
        // 为每个成就添加打卡次数
        List<Map<String, Object>> result = new ArrayList<>();
        for (Achievement achievement : userAchievements) {
            int checkinCount = achievementRepository.getCheckinCountByUserAndSpecies(
                    userId, achievement.getFlowerSpecies());
            
            Map<String, Object> map = new HashMap<>();
            map.put("id", achievement.getId());
            map.put("user_id", achievement.getUser().getId());
            map.put("location_id", achievement.getLocation().getId());
            map.put("flower_species", achievement.getFlowerSpecies());
            map.put("grade", achievement.getGrade());
            map.put("checkin_id", achievement.getCheckin().getId());
            map.put("checkin_count", checkinCount);
            map.put("created_at", achievement.getCreatedAt());
            map.put("updated_at", achievement.getUpdatedAt());
            result.add(map);
        }
        return result;
    }
}