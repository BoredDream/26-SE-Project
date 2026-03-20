package com.example.backend.controller;

import com.example.backend.model.Title;
import com.example.backend.service.AchievementService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class AchievementController {
    
    private final AchievementService achievementService;
    
    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }
    
    // 获取我的花圃（成就列表）
    @GetMapping("/users/me/achievements")
    public Response<List<Map<String, Object>>> getMyAchievements(@RequestAttribute("userId") Long userId) {
        List<Map<String, Object>> achievements = achievementService.getMyAchievements(userId);
        return Response.success(achievements);
    }
    
    // 获取我的称号
    @GetMapping("/users/me/titles")
    public Response<List<Title>> getMyTitles(@RequestAttribute("userId") Long userId) {
        List<Title> titles = achievementService.getMyTitles(userId);
        return Response.success(titles);
    }
    
    // 查看他人花圃
    @GetMapping("/users/{id}/achievements")
    public Response<List<Map<String, Object>>> getUserAchievements(@PathVariable Long id) {
        List<Map<String, Object>> achievements = achievementService.getUserAchievements(id);
        return Response.success(achievements);
    }
}