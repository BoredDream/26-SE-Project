package com.example.backend.service;

import com.example.backend.dto.UserLoginRequest;
import com.example.backend.dto.UserLoginResponse;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;
    
    @Value("${wx.appid}")
    private String wxAppid;
    
    @Value("${wx.secret}")
    private String wxSecret;
    
    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.restTemplate = new RestTemplate();
    }
    
    // 微信登录
    public UserLoginResponse login(UserLoginRequest request) {
        String code = request.getCode();
        String openid;
        
        // 测试环境：使用特定code进行测试登录
        if ("test".equals(code)) {
            openid = "test_openid";
        } else {
            // 生产环境：调用微信API获取openid
            String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + wxAppid + 
                        "&secret=" + wxSecret + "&js_code=" + code + "&grant_type=authorization_code";
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("openid")) {
                throw new RuntimeException("微信登录失败");
            }
            
            openid = (String) response.get("openid");
        }
        
        // 查询或创建用户
        User user = userRepository.findByOpenid(openid);
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user = userRepository.save(user);
        }
        
        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getId(), user.getOpenid(), user.getIsAdmin());
        
        // 构建响应
        UserLoginResponse response = new UserLoginResponse();
        response.setToken(token);
        
        UserLoginResponse.UserInfo userInfo = new UserLoginResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setNickname(user.getNickname());
        userInfo.setRole(user.getIsAdmin() ? "admin" : "user");
        
        response.setUser(userInfo);
        
        return response;
    }
    
    // 获取用户信息
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    // 更新用户信息
    public void updateUserProfile(Long userId, String nickname, String avatarUrl) {
        User user = getUserById(userId);
        user.setNickname(nickname);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }
}