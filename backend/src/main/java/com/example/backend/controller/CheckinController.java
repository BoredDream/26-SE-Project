package com.example.backend.controller;

import com.example.backend.model.Checkin;
import com.example.backend.service.CheckinService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1")
public class CheckinController {
    
    private final CheckinService checkinService;
    
    public CheckinController(CheckinService checkinService) {
        this.checkinService = checkinService;
    }
    
    // 发布打卡
    @PostMapping("/checkins")
    public Response<Void> createCheckin(@RequestAttribute("userId") Long userId, 
                                       @RequestBody CheckinRequest request) {
        checkinService.createCheckin(userId, request.getLocation_id(), request.getBloom_report(), 
                                    request.getContent(), request.getImages(), request.getUser_latitude(), 
                                    request.getUser_longitude());
        return Response.success();
    }
    
    // 获取地点打卡列表
    @GetMapping("/locations/{id}/checkins")
    public Response<List<Checkin>> getLocationCheckins(@PathVariable Long id, 
                                                     @RequestParam(required = false) Integer page, 
                                                     @RequestParam(required = false) Integer pageSize) {
        List<Checkin> checkins = checkinService.getLocationCheckins(id, page, pageSize);
        return Response.success(checkins);
    }
    
    // 点赞打卡
    @PostMapping("/checkins/{id}/like")
    public Response<Void> likeCheckin(@RequestAttribute("userId") Long userId, 
                                     @PathVariable Long id) {
        checkinService.likeCheckin(userId, id);
        return Response.success();
    }
    
    // 举报打卡
    @PostMapping("/checkins/{id}/report")
    public Response<Void> reportCheckin(@RequestAttribute("userId") Long userId, 
                                       @PathVariable Long id, 
                                       @RequestBody ReportRequest request) {
        checkinService.reportCheckin(userId, id, request.getReason());
        return Response.success();
    }
    
    // 获取我的打卡记录
    @GetMapping("/users/me/checkins")
    public Response<List<Checkin>> getMyCheckins(@RequestAttribute("userId") Long userId) {
        List<Checkin> checkins = checkinService.getMyCheckins(userId);
        return Response.success(checkins);
    }
    
    // 打卡请求DTO
    static class CheckinRequest {
        private Long location_id;
        private String bloom_report;
        private String content;
        private List<String> images;
        private Double user_latitude;
        private Double user_longitude;
        
        // Getters and setters
        public Long getLocation_id() { return location_id; }
        public void setLocation_id(Long location_id) { this.location_id = location_id; }
        public String getBloom_report() { return bloom_report; }
        public void setBloom_report(String bloom_report) { this.bloom_report = bloom_report; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
        public Double getUser_latitude() { return user_latitude; }
        public void setUser_latitude(Double user_latitude) { this.user_latitude = user_latitude; }
        public Double getUser_longitude() { return user_longitude; }
        public void setUser_longitude(Double user_longitude) { this.user_longitude = user_longitude; }
    }
    
    // 举报请求DTO
    static class ReportRequest {
        private String reason;
        
        // Getters and setters
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}