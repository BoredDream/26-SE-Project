package com.example.backend.service;

import com.example.backend.model.Checkin;
import com.example.backend.model.User;
import com.example.backend.repository.CheckinRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AdminService {
    
    private final CheckinRepository checkinRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    
    public AdminService(CheckinRepository checkinRepository, 
                       UserRepository userRepository, 
                       LocationRepository locationRepository) {
        this.checkinRepository = checkinRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
    }
    
    // 获取待审核的打卡列表
    public List<Checkin> getPendingCheckins() {
        // 使用原生SQL查询待审核的打卡记录
        return checkinRepository.findAll().stream()
                .filter(checkin -> "pending".equals(checkin.getAuditStatus()))
                .collect(java.util.stream.Collectors.toList());
    }
    
    // 审核打卡内容
    @Transactional
    public void auditCheckin(Long id, String action, String reason) {
        // 验证操作类型
        if (!"approve".equals(action) && !"reject".equals(action)) {
            throw new RuntimeException("参数错误，操作类型无效");
        }
        
        // 拒绝时必须提供理由
        if ("reject".equals(action) && (reason == null || reason.isEmpty())) {
            throw new RuntimeException("参数错误，拒绝时必须提供理由");
        }
        
        // 检查打卡是否存在
        Checkin checkin = checkinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("打卡不存在"));
        
        // 更新审核状态
        String status = "approve".equals(action) ? "approved" : "rejected";
        checkinRepository.updateAuditStatus(id, status, reason);
    }
    
    // 获取用户列表
    public List<User> getUsers() {
        return userRepository.findAll();
    }
    
    // 更新用户角色
    @Transactional
    public void updateUserRole(Long userId, boolean isAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        user.setIsAdmin(isAdmin);
        userRepository.save(user);
    }
    
    // 获取数据统计信息
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 用户总数
        stats.put("totalUsers", userRepository.count());
        
        // 地点总数
        stats.put("totalLocations", locationRepository.count());
        
        // 打卡总数
        stats.put("totalCheckins", checkinRepository.count());
        
        // 待审核打卡数
        stats.put("pendingCheckins", checkinRepository.findAll().stream()
                .filter(checkin -> "pending".equals(checkin.getAuditStatus()))
                .count());
        
        // 已审核通过打卡数
        stats.put("approvedCheckins", checkinRepository.findAll().stream()
                .filter(checkin -> "approved".equals(checkin.getAuditStatus()))
                .count());
        
        // 已拒绝打卡数
        stats.put("rejectedCheckins", checkinRepository.findAll().stream()
                .filter(checkin -> "rejected".equals(checkin.getAuditStatus()))
                .count());
        
        return stats;
    }
}