package com.example.backend.service;

import com.example.backend.model.Checkin;
import com.example.backend.model.Location;
import com.example.backend.model.Like;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.LocationRepository;
import com.example.backend.repository.LikeRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.Helpers;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CheckinService {
    
    private final CheckinRepository checkinRepository;
    private final LocationRepository locationRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    
    public CheckinService(CheckinRepository checkinRepository, LocationRepository locationRepository, 
                         LikeRepository likeRepository, UserRepository userRepository) {
        this.checkinRepository = checkinRepository;
        this.locationRepository = locationRepository;
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
    }
    
    // 发布打卡
    @Transactional
    public void createCheckin(Long userId, Long locationId, String bloomReport, String content, 
                              List<String> images, Double userLatitude, Double userLongitude) {
        // 验证必填字段
        if (locationId == null || images == null || images.isEmpty()) {
            throw new RuntimeException("参数错误，缺少必填字段");
        }
        
        // 验证花期状态值
        if (bloomReport != null) {
            List<String> validStatuses = java.util.Arrays.asList("budding", "blooming", "withering");
            if (!validStatuses.contains(bloomReport)) {
                throw new RuntimeException("参数错误，花期状态值无效");
            }
        }
        
        // 检查地点是否存在
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("地点不存在"));
        
        // GPS 校验
        boolean gpsVerified = Helpers.isUserNearLocation(userLatitude, userLongitude, 
                                                        location.getLatitude(), location.getLongitude());
        
        // 创建打卡记录
        Checkin checkin = new Checkin();
        checkin.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在")));
        checkin.setLocation(location);
        checkin.setBloomReport(bloomReport);
        checkin.setContent(content);
        checkin.setImages(images);
        checkin.setGpsVerified(gpsVerified);
        checkin.setUserLatitude(userLatitude);
        checkin.setUserLongitude(userLongitude);
        checkin.setAuditStatus("pending");
        
        checkinRepository.save(checkin);
        
        // 更新地点的打卡计数
        locationRepository.incrementCheckinCount(locationId);
    }
    
    // 获取地点打卡列表
    public List<Checkin> getLocationCheckins(Long locationId, Integer page, Integer pageSize) {
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        
        return checkinRepository.findByLocationIdAndAuditStatusOrderByCreatedAtDesc(
                locationId, "approved", PageRequest.of(page - 1, pageSize));
    }
    
    // 点赞打卡
    @Transactional
    public void likeCheckin(Long userId, Long checkinId) {
        // 检查打卡是否存在
        Checkin checkin = checkinRepository.findById(checkinId)
                .orElseThrow(() -> new RuntimeException("打卡不存在"));
        
        // 检查是否已点赞
        Like existingLike = likeRepository.findByUserIdAndCheckinId(userId, checkinId);
        
        if (existingLike == null) {
            // 创建点赞记录
            Like like = new Like();
            Like.LikeId likeId = new Like.LikeId();
            likeId.setUserId(userId);
            likeId.setCheckinId(checkinId);
            like.setId(likeId);
            like.setUser(userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在")));
            like.setCheckin(checkin);
            
            likeRepository.save(like);
            
            // 更新打卡的点赞计数
            checkinRepository.incrementLikesCount(checkinId);
        }
    }
    
    // 取消点赞
    @Transactional
    public void unlikeCheckin(Long userId, Long checkinId) {
        // 检查是否已点赞
        Like existingLike = likeRepository.findByUserIdAndCheckinId(userId, checkinId);
        
        if (existingLike != null) {
            // 删除点赞记录
            likeRepository.delete(existingLike);
            
            // 更新打卡的点赞计数
            checkinRepository.decrementLikesCount(checkinId);
        }
    }
    
    // 举报打卡
    public void reportCheckin(Long userId, Long checkinId, String reason) {
        // 检查打卡是否存在
        checkinRepository.findById(checkinId)
                .orElseThrow(() -> new RuntimeException("打卡不存在"));
        
        // 这里简化处理，实际项目中应该创建举报记录并触发人工复核
        System.out.println("用户 " + userId + " 举报了打卡 " + checkinId + "，理由：" + reason);
    }
    
    // 获取我的打卡记录
    public List<Checkin> getMyCheckins(Long userId) {
        return checkinRepository.findByUserIdAndAuditStatusOrderByCreatedAtDesc(userId, "approved");
    }
}