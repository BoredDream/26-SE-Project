package com.example.backend.controller;

import com.example.backend.model.Location;
import com.example.backend.security.AdminOnly;
import com.example.backend.service.LocationService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class LocationController {
    
    private final LocationService locationService;
    
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }
    
    // 获取地点列表
    @GetMapping("/locations")
    public Response<List<Location>> getLocations(@RequestParam(required = false) String status, 
                                               @RequestParam(required = false) String keyword) {
        List<Location> locations = locationService.getLocations(status, keyword);
        return Response.success(locations);
    }
    
    // 获取地点详情
    @GetMapping("/locations/{id}")
    public Response<Map<String, Object>> getLocationDetail(@PathVariable Long id) {
        Map<String, Object> detail = locationService.getLocationDetail(id);
        return Response.success(detail);
    }
    
    // 更新花期状态（仅管理员）
    @AdminOnly
    @PatchMapping("/locations/{id}/status")
    public Response<Void> updateBloomStatus(@PathVariable Long id, 
                                           @RequestParam String bloom_status) {
        locationService.updateBloomStatus(id, bloom_status);
        return Response.success();
    }
    
    // 创建地点（仅管理员）
    @AdminOnly
    @PostMapping("/locations")
    public Response<Location> createLocation(@RequestBody Location location) {
        Location createdLocation = locationService.createLocation(location);
        return Response.success(createdLocation);
    }
    
    // 获取地图热力数据
    @GetMapping("/leaderboard/heatmap")
    public Response<List<Map<String, Object>>> getHeatmapData() {
        List<Map<String, Object>> heatmapData = locationService.getHeatmapData();
        return Response.success(heatmapData);
    }
}