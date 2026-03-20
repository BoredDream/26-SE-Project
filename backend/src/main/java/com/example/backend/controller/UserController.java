package com.example.backend.controller;

import com.example.backend.dto.UserLoginRequest;
import com.example.backend.dto.UserLoginResponse;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import com.example.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/v1")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // 微信登录
    @PostMapping("/auth/login")
    public Response<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.login(request);
        return Response.success(response);
    }
    
    // 获取当前用户信息
    @GetMapping("/users/me")
    public Response<User> getProfile(@RequestAttribute("userId") Long userId) {
        User user = userService.getUserById(userId);
        return Response.success(user);
    }
    
    // 更新当前用户信息
    @PatchMapping("/users/me")
    public Response<Void> updateProfile(@RequestAttribute("userId") Long userId, 
                                     @RequestParam(required = false) String nickname, 
                                     @RequestParam(required = false) String avatarUrl) {
        userService.updateUserProfile(userId, nickname, avatarUrl);
        return Response.success();
    }
}