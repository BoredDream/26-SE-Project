package com.example.backend.controller;

import com.example.backend.service.LeaderboardService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class LeaderboardController {
    
    private final LeaderboardService leaderboardService;
    
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    
    // 获取打卡王榜
    @GetMapping("/leaderboard/checkins")
    public Response<List<Map<String, Object>>> getCheckinLeaderboard(@RequestParam(required = false) String month) {
        List<Map<String, Object>> leaderboard = leaderboardService.getCheckinLeaderboard(month);
        return Response.success(leaderboard);
    }
    
    // 获取点赞榜
    @GetMapping("/leaderboard/likes")
    public Response<List<Map<String, Object>>> getLikesLeaderboard() {
        List<Map<String, Object>> leaderboard = leaderboardService.getLikesLeaderboard();
        return Response.success(leaderboard);
    }
}