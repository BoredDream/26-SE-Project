package com.example.backend.controller;

import com.example.backend.model.Subscription;
import com.example.backend.service.SubscriptionService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1")
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    
    // 订阅地点
    @PostMapping("/subscriptions")
    public Response<Void> subscribeLocation(@RequestAttribute("userId") Long userId, 
                                          @RequestBody SubscriptionRequest request) {
        subscriptionService.subscribeLocation(userId, request.getLocation_id());
        return Response.success();
    }
    
    // 取消订阅
    @DeleteMapping("/subscriptions/{locationId}")
    public Response<Void> unsubscribeLocation(@RequestAttribute("userId") Long userId, 
                                            @PathVariable Long locationId) {
        subscriptionService.unsubscribeLocation(userId, locationId);
        return Response.success();
    }
    
    // 获取我的订阅列表
    @GetMapping("/subscriptions")
    public Response<List<Subscription>> getMySubscriptions(@RequestAttribute("userId") Long userId) {
        List<Subscription> subscriptions = subscriptionService.getMySubscriptions(userId);
        return Response.success(subscriptions);
    }
    
    // 订阅请求DTO
    static class SubscriptionRequest {
        private Long location_id;
        
        // Getters and setters
        public Long getLocation_id() { return location_id; }
        public void setLocation_id(Long location_id) { this.location_id = location_id; }
    }
}