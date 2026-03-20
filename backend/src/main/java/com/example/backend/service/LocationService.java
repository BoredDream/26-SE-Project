package com.example.backend.service;

import com.example.backend.model.Location;
import com.example.backend.model.Checkin;
import com.example.backend.repository.LocationRepository;
import com.example.backend.repository.CheckinRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LocationService {
    
    private final LocationRepository locationRepository;
    private final CheckinRepository checkinRepository;
    
    public LocationService(LocationRepository locationRepository, CheckinRepository checkinRepository) {
        this.locationRepository = locationRepository;
        this.checkinRepository = checkinRepository;
    }
    
    // 获取地点列表（支持状态筛选和关键词搜索）
    public List<Location> getLocations(String status, String keyword) {
        if (status != null && !status.isEmpty()) {
            return locationRepository.findByBloomStatus(status);
        } else if (keyword != null && !keyword.isEmpty()) {
            return locationRepository.findByNameContainingOrFlowerSpeciesContainingOrDescriptionContaining(keyword, keyword, keyword);
        } else {
            return locationRepository.findAll();
        }
    }
    
    // 获取地点详情（包含最近的打卡记录）
    public Map<String, Object> getLocationDetail(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("地点不存在"));
        
        // 获取最近10条已审核通过的打卡记录
        List<Checkin> recentCheckins = checkinRepository.findByLocationIdAndAuditStatusOrderByCreatedAtDesc(
                id, "approved", PageRequest.of(0, 10));
        
        Map<String, Object> result = new HashMap<>();
        result.put("location", location);
        result.put("recentCheckins", recentCheckins);
        
        return result;
    }
    
    // 更新花期状态（管理员功能）
    public void updateBloomStatus(Long id, String bloomStatus) {
        // 验证花期状态值
        List<String> validStatuses = Arrays.asList("dormant", "budding", "blooming", "withering");
        if (!validStatuses.contains(bloomStatus)) {
            throw new RuntimeException("参数错误，花期状态值无效");
        }
        
        // 检查地点是否存在
        locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("地点不存在"));
        
        // 更新花期状态
        locationRepository.updateBloomStatus(id, bloomStatus);
    }
    
    // 创建地点（管理员功能）
    public Location createLocation(Location location) {
        // 验证必填字段
        if (location.getName() == null || location.getLatitude() == null || location.getLongitude() == null || location.getFlowerSpecies() == null) {
            throw new RuntimeException("参数错误，缺少必填字段");
        }
        
        return locationRepository.save(location);
    }
    
    // 获取地图热力数据
    public List<Map<String, Object>> getHeatmapData() {
        List<Object[]> results = locationRepository.findAllForHeatmap();
        
        return results.stream().map(result -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", result[0]);
            data.put("latitude", result[1]);
            data.put("longitude", result[2]);
            data.put("checkinCount", result[3]);
            return data;
        }).collect(Collectors.toList());
    }
}