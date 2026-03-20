package com.example.backend.controller;

import com.example.backend.model.Checkin;
import com.example.backend.model.User;
import com.example.backend.security.AdminOnly;
import com.example.backend.service.AdminService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    // 获取待审核的打卡列表
    @AdminOnly
    @GetMapping("/admin/checkins/pending")
    public Response<List<Checkin>> getPendingCheckins() {
        List<Checkin> checkins = adminService.getPendingCheckins();
        return Response.success(checkins);
    }
    
    // 审核打卡内容
    @AdminOnly
    @PatchMapping("/admin/checkins/{id}/audit")
    public Response<Void> auditCheckin(@PathVariable Long id, 
                                     @RequestParam String action, 
                                     @RequestParam(required = false) String reason) {
        adminService.auditCheckin(id, action, reason);
        return Response.success();
    }
    
    // 获取用户列表
    @AdminOnly
    @GetMapping("/admin/users")
    public Response<List<User>> getUsers() {
        List<User> users = adminService.getUsers();
        return Response.success(users);
    }
    
    // 更新用户角色
    @AdminOnly
    @PatchMapping("/admin/users/{id}/role")
    public Response<Void> updateUserRole(@PathVariable Long id, 
                                       @RequestParam boolean is_admin) {
        adminService.updateUserRole(id, is_admin);
        return Response.success();
    }
    
    // 获取数据统计信息
    @AdminOnly
    @GetMapping("/admin/statistics")
    public Response<Map<String, Object>> getStatistics() {
        Map<String, Object> statistics = adminService.getStatistics();
        return Response.success(statistics);
    }
}